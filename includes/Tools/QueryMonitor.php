<?php

// src/Tools/QueryMonitor.php
namespace WPDevToolkit\Tools;

use WP_REST_Server;
use WPDevToolkit\Base\ToolBase;
use WPDevToolkit\Core\Logger;
use function add_filter;
use function current_user_can;
use function register_rest_route;
use function rest_ensure_response;
use function set_transient;

/**
 * Query Monitor Tool
 *
 * Monitors database queries for debugging
 *
 * @package WPDevToolkit\Tools
 */
class QueryMonitor extends ToolBase {
	/**
	 * Tool key for configuration
	 */
	const TOOL_KEY = 'query_monitoring';

	/**
	 * Collected queries
	 *
	 * @var array
	 */
	private $queries = array();
	
	/**
	 * Start time for query execution
	 *
	 * @var array
	 */
	private $query_start_time = array();
	
	/**
	 * Maximum number of queries to store
	 *
	 * @var int
	 */
	private $max_queries = 1000;

	/**
	 * Initialize the tool
	 *
	 * @return void
	 */
	public function init() {
		if ( ! $this->is_enabled() ) {
			return;
		}
		
		// Use SAVEQUERIES to ensure WordPress saves query data
		if ( ! defined( 'SAVEQUERIES' ) ) {
			define( 'SAVEQUERIES', true );
		}
		
		add_filter( 'query', array( $this, 'log_query' ) );
		add_action( 'shutdown', array( $this, 'save_queries' ), 9999 );
	}

	/**
	 * Register REST routes for the tool
	 *
	 * @return void
	 */
	public function register_rest_routes() {
		register_rest_route(
			'wp-dev-toolkit/v1',
			'/queries',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_queries' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
			)
		);
		
		register_rest_route(
			'wp-dev-toolkit/v1',
			'/queries/clear',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'clear_queries' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
			)
		);
	}

	/**
	 * Log a database query
	 *
	 * @param string $query SQL query
	 *
	 * @return string
	 */
	public function log_query( $query ) {
		global $wpdb;
		
		// Generate a unique ID for this query
		$query_id = md5( $query . microtime() );
		
		// Store the start time
		$this->query_start_time[$query_id] = microtime(true);
		
		// Add query to the list with backtrace
		$backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 5);
		$caller = $this->get_query_caller($backtrace);
		
		$this->queries[] = array(
			'id'        => $query_id,
			'sql'       => $query,
			'start'     => $this->query_start_time[$query_id],
			'time'      => 0, // Will be updated when query completes
			'caller'    => $caller,
			'backtrace' => $this->format_backtrace($backtrace),
		);
		
		// Limit the number of stored queries
		if (count($this->queries) > $this->max_queries) {
			array_shift($this->queries);
		}
		
		return $query;
	}
	
	/**
	 * Save queries on shutdown
	 *
	 * @return void
	 */
	public function save_queries() {
		global $wpdb;
		
		if (!empty($wpdb->queries)) {
			$saved_queries = array();
			
			// Update query times from WordPress's saved queries
			foreach ($wpdb->queries as $index => $query_data) {
				$query_sql = $query_data[0];
				$query_time = $query_data[1];
				$query_trace = $query_data[2];
				
				// Find our stored query that matches this SQL
				foreach ($this->queries as $key => $our_query) {
					if ($our_query['sql'] === $query_sql) {
						$this->queries[$key]['time'] = $query_time;
						break;
					}
				}
				
				$saved_queries[] = array(
					'sql'   => $query_sql,
					'time'  => $query_time,
					'trace' => $query_trace,
				);
			}
			
			// Store for later retrieval via API
			set_transient('wp_dev_toolkit_queries', $this->queries, DAY_IN_SECONDS);
			
			// Log total query count and time
			$total_time = array_sum(array_column($saved_queries, 'time'));
			Logger::log(sprintf(
				'Database: %d queries in %.4f seconds',
				count($saved_queries),
				$total_time
			), 'info');
		}
	}

	/**
	 * Get the caller of a query from backtrace
	 *
	 * @param array $backtrace Debug backtrace
	 *
	 * @return string
	 */
	private function get_query_caller($backtrace) {
		$caller = '';
		
		// Skip the first few entries which are usually WP database functions
		for ($i = 0; $i < count($backtrace); $i++) {
			$trace = $backtrace[$i];
			
			// Skip WordPress database classes
			if (isset($trace['class']) && strpos($trace['class'], 'wpdb') !== false) {
				continue;
			}
			
			// Skip WordPress database functions
			if (isset($trace['function']) && in_array($trace['function'], array('query', 'prepare', 'get_results', 'get_row'))) {
				continue;
			}
			
			// Found our caller
			if (isset($trace['class'])) {
				$caller = $trace['class'] . '::' . $trace['function'];
			} else if (isset($trace['function'])) {
				$caller = $trace['function'];
			}
			
			if (!empty($caller)) {
				break;
			}
		}
		
		return $caller ?: 'unknown';
	}
	
	/**
	 * Format backtrace for display
	 *
	 * @param array $backtrace Debug backtrace
	 *
	 * @return array
	 */
	private function format_backtrace($backtrace) {
		$formatted = array();
		
		foreach ($backtrace as $trace) {
			if (isset($trace['file']) && isset($trace['line'])) {
				$file = str_replace(ABSPATH, '', $trace['file']);
				$formatted[] = $file . ':' . $trace['line'];
			}
		}
		
		return $formatted;
	}

	/**
	 * Get queries via REST API
	 *
	 * @return \WP_REST_Response
	 */
	public function get_queries() {
		global $wpdb;
		
		$cached_queries = get_transient('wp_dev_toolkit_queries');
		$queries = $cached_queries ?: array();
		
		// Add summary data
		$total_time = array_sum(array_column($queries, 'time'));
		$summary = array(
			'total_queries' => count($queries),
			'total_time' => $total_time,
			'avg_time' => count($queries) > 0 ? $total_time / count($queries) : 0,
		);
		
		return rest_ensure_response(array(
			'queries' => $queries,
			'summary' => $summary,
		));
	}
	
	/**
	 * Clear stored queries
	 *
	 * @return \WP_REST_Response
	 */
	public function clear_queries() {
		delete_transient('wp_dev_toolkit_queries');
		$this->queries = array();
		
		return rest_ensure_response(array(
			'message' => 'Query cache cleared',
			'success' => true,
		));
	}

	public function check_admin_permissions() {
		return current_user_can( 'manage_options' );
	}
}
