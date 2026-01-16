<?php

// src/Tools/HookInspector.php
namespace WPDevToolkit\Tools;

use WP_REST_Server;
use WPDevToolkit\Core\Logger;
use function add_action;
use function get_transient;
use function register_rest_route;
use function rest_ensure_response;
use function set_transient;

/**
 * Hook Inspector Tool
 *
 * Tracks and inspects WordPress hooks for debugging
 *
 * @package WPDevToolkit\Tools
 */
class HookInspector extends ToolBase {
	/**
	 * Tool key for configuration
	 */
	const TOOL_KEY = 'hook_inspection';

	/**
	 * Tracked hooks
	 *
	 * @var array
	 */
	private $hooks = array();

	/**
	 * Hook execution count
	 *
	 * @var array
	 */
	private $hook_counts = array();

	/**
	 * Hook execution time
	 *
	 * @var array
	 */
	private $hook_times = array();

	/**
	 * Current hook being executed
	 *
	 * @var string|null
	 */
	private $current_hook = null;

	/**
	 * Maximum number of hooks to track
	 *
	 * @var int
	 */
	private $max_hooks = 5000;

	/**
	 * Initialize the tool
	 *
	 * @return void
	 */
	public function init(): void {
		if ( ! $this->is_enabled() ) {
			return;
		}

		// Track hooks as they occur
		add_action( 'all', array( $this, 'log_hook_start' ), 0 );
		add_action( 'all', array( $this, 'log_hook_end' ), 999 );

		// Save data on shutdown
		add_action( 'shutdown', array( $this, 'save_hooks' ), 9999 );
	}

	/**
	 * Register REST routes for the tool
	 *
	 * @return void
	 */
	public function register_rest_routes(): void {
		register_rest_route(
			'wp-dev-toolkit/v1',
			'/hooks',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_hooks' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
			)
		);

		register_rest_route(
			'wp-dev-toolkit/v1',
			'/hooks/clear',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'clear_hooks' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
			)
		);
	}

	/**
	 * Log hook execution start
	 *
	 * @param string $tag Hook name
	 *
	 * @return void
	 */
	public function log_hook_start( $tag ) {
		// Skip tracking for some internal hooks
		if ( $this->should_skip_hook( $tag ) ) {
			return;
		}

		// Store the current hook being executed
		$this->current_hook = $tag;

		// Track hook execution count
		if ( ! isset( $this->hook_counts[ $tag ] ) ) {
			$this->hook_counts[ $tag ] = 0;

			// Store backtrace for first occurrence only
			$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 5 );
			$this->hooks[ $tag ] = array(
				'name'      => $tag,
				'type'      => $this->get_hook_type( $tag ),
				'backtrace' => $this->format_backtrace( $backtrace ),
				'first_call' => microtime( true ),
				'count'     => 0,
				'total_time' => 0,
			);
		}

		$this->hook_counts[ $tag ]++;

		// Store start time for this execution
		$this->hook_times[ $tag ] = microtime( true );

		// Limit the number of tracked hooks
		if ( count( $this->hooks ) > $this->max_hooks ) {
			// Remove the least frequently used hooks
			$min_count = min( $this->hook_counts );
			foreach ( $this->hook_counts as $hook => $count ) {
				if ( $count === $min_count ) {
					unset( $this->hooks[ $hook ] );
					unset( $this->hook_counts[ $hook ] );
					break;
				}
			}
		}
	}

	/**
	 * Log hook execution end
	 *
	 * @param string $tag Hook name
	 *
	 * @return void
	 */
	public function log_hook_end( $tag ) {
		if ( $this->current_hook !== $tag || ! isset( $this->hook_times[ $tag ] ) ) {
			return;
		}

		// Calculate execution time
		$start_time = $this->hook_times[ $tag ];
		$end_time = microtime( true );
		$execution_time = $end_time - $start_time;

		// Update hook data
		if ( isset( $this->hooks[ $tag ] ) ) {
			$this->hooks[ $tag ]['count'] = $this->hook_counts[ $tag ];
			$this->hooks[ $tag ]['total_time'] += $execution_time;
		}

		// Reset current hook
		$this->current_hook = null;
	}

	/**
	 * Save hooks data on shutdown
	 *
	 * @return void
	 */
	public function save_hooks() {
		// Sort hooks by execution count
		uasort( $this->hooks, function( $a, $b ) {
			return $b['count'] - $a['count'];
		} );

		// Store for later retrieval via API
		set_transient( 'wp_dev_toolkit_hooks', $this->hooks, DAY_IN_SECONDS );

		// Log summary
		$total_hooks = count( $this->hooks );
		$total_executions = array_sum( $this->hook_counts );
		Logger::log( sprintf(
			'Hooks: %d unique hooks executed %d times',
			$total_hooks,
			$total_executions
		), 'info' );
	}

	/**
	 * Determine if a hook should be skipped
	 *
	 * @param string $tag Hook name
	 *
	 * @return bool
	 */
	private function should_skip_hook( $tag ) {
		// Skip our own hooks
		if ( strpos( $tag, 'wp_dev_toolkit' ) === 0 ) {
			return true;
		}

		// Skip some common WordPress hooks that fire too frequently
		$skip_hooks = array(
			'gettext',
			'ngettext',
			'gettext_with_context',
			'pre_get_posts',
		);

		// Get excluded hooks from config
		$excluded_hooks = $this->config->get( 'excluded_hooks', array() );
		$skip_hooks = array_merge( $skip_hooks, $excluded_hooks );

		return in_array( $tag, $skip_hooks );
	}

	/**
	 * Determine hook type (action or filter)
	 *
	 * @param string $tag Hook name
	 *
	 * @return string
	 */
	private function get_hook_type( $tag ) {
		global $wp_filter;

		// Check if this hook is registered as an action
		$is_action = false;
		if ( function_exists( 'did_action' ) ) {
			$is_action = did_action( $tag ) > 0;
		}

		// If it's not an action or we can't determine, check if it's a filter
		if ( ! $is_action ) {
			// If it has callbacks and returns a value, it's likely a filter
			if ( isset( $wp_filter[ $tag ] ) && has_filter( $tag ) ) {
				return 'filter';
			}
		}

		return $is_action ? 'action' : 'unknown';
	}

	/**
	 * Format backtrace for display
	 *
	 * @param array $backtrace Debug backtrace
	 *
	 * @return array
	 */
	private function format_backtrace( $backtrace ) {
		$formatted = array();

		foreach ( $backtrace as $trace ) {
			if ( isset( $trace['file'] ) && isset( $trace['line'] ) ) {
				$file = str_replace( ABSPATH, '', $trace['file'] );
				$formatted[] = $file . ':' . $trace['line'];
			}
		}

		return $formatted;
	}

	/**
	 * Get hooks via REST API
	 *
	 * @return \WP_REST_Response
	 */
	public function get_hooks() {
		$cached_hooks = get_transient( 'wp_dev_toolkit_hooks' );
		$hooks = $cached_hooks ?: array();

		// Add summary data
		$total_executions = array_sum( array_column( $hooks, 'count' ) );
		$total_time = array_sum( array_column( $hooks, 'total_time' ) );

		$summary = array(
			'total_hooks' => count( $hooks ),
			'total_executions' => $total_executions,
			'total_time' => $total_time,
		);

		// Group hooks by type
		$grouped_hooks = array(
			'action' => array(),
			'filter' => array(),
			'unknown' => array(),
		);

		foreach ( $hooks as $hook ) {
			$type = isset( $hook['type'] ) ? $hook['type'] : 'unknown';
			$grouped_hooks[ $type ][] = $hook;
		}

		return rest_ensure_response( array(
			'hooks' => $hooks,
			'grouped_hooks' => $grouped_hooks,
			'summary' => $summary,
		) );
	}

	/**
	 * Clear hooks data
	 *
	 * @return \WP_REST_Response
	 */
	public function clear_hooks() {
		delete_transient( 'wp_dev_toolkit_hooks' );
		$this->hooks = array();
		$this->hook_counts = array();
		$this->hook_times = array();

		return rest_ensure_response( array(
			'message' => 'Hook cache cleared',
			'success' => true,
		) );
	}

}
