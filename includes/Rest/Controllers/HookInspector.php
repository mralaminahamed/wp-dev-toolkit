<?php

namespace WPDevToolkit\REST\Controllers;

use WPDevToolkit\REST\Base;

/**
 * Hook Inspector REST API Controller
 *
 * @package WPDevToolkit\REST\Controllers
 */
class HookInspector extends Base {
	/**
	 * Register routes for this controller
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/hook-inspector',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_hooks' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'type'   => array(
							'default' => 'all',
							'enum'    => array( 'all', 'action', 'filter' ),
						),
						'search' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/hook-inspector/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'enabled'     => array(
							'type'              => 'boolean',
							'validate_callback' => array( $this, 'validate_boolean' ),
						),
						'track_hooks' => array(
							'type'              => 'boolean',
							'validate_callback' => array( $this, 'validate_boolean' ),
						),
					),
				),
			)
		);
	}

	/**
	 * Get WordPress hooks
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function get_hooks( $request ) {
		global $wp_filter;

		$type   = $request->get_param( 'type' );
		$search = $request->get_param( 'search' );

		$hooks = array();

		foreach ( $wp_filter as $hook_name => $hook_obj ) {
			// Skip if we're searching and the hook name doesn't match
			if ( ! empty( $search ) && strpos( $hook_name, $search ) === false ) {
				continue;
			}

			$is_action = strpos( $hook_name, 'action_' ) === 0 || in_array( $hook_name, $this->get_common_actions() );
			$is_filter = strpos( $hook_name, 'filter_' ) === 0 || in_array( $hook_name, $this->get_common_filters() );

			// Skip based on hook type filter
			if ( $type === 'action' && ! $is_action ) {
				continue;
			} elseif ( $type === 'filter' && ! $is_filter ) {
				continue;
			}

			$callbacks = array();

			// Process callbacks for each priority
			foreach ( $hook_obj->callbacks as $priority => $callback_group ) {
				foreach ( $callback_group as $callback_id => $callback_data ) {
					$callback_info = $this->get_callback_info( $callback_data['function'] );

					$callbacks[] = array(
						'priority'      => $priority,
						'function'      => $callback_info['function'],
						'file'          => $callback_info['file'],
						'line'          => $callback_info['line'],
						'accepted_args' => $callback_data['accepted_args'],
					);
				}
			}

			// Add the hook to our results
			$hooks[] = array(
				'name'           => $hook_name,
				'type'           => $is_action ? 'action' : 'filter',
				'callbacks'      => $callbacks,
				'callback_count' => count( $callbacks ),
			);
		}

		// Sort hooks alphabetically
		usort(
			$hooks,
			function ( $a, $b ) {
				return strcmp( $a['name'], $b['name'] );
			}
		);

		return $this->send_json_success(
			array(
				'hooks'  => $hooks,
				'total'  => count( $hooks ),
				'type'   => $type,
				'search' => $search,
			)
		);
	}

	/**
	 * Get common WordPress action hooks
	 *
	 * @return array
	 */
	private function get_common_actions() {
		return array(
			'init',
			'admin_init',
			'wp_loaded',
			'wp_footer',
			'wp_head',
			'wp_enqueue_scripts',
			'admin_enqueue_scripts',
			'save_post',
			'wp',
			'template_redirect',
			'widgets_init',
			'registered_post_type',
		);
	}

	/**
	 * Get common WordPress filter hooks
	 *
	 * @return array
	 */
	private function get_common_filters() {
		return array(
			'the_content',
			'the_title',
			'the_excerpt',
			'template_include',
			'body_class',
			'post_class',
		);
	}

	/**
	 * Get callback info from function
	 *
	 * @param mixed $function Callback function
	 *
	 * @return array
	 */
	private function get_callback_info( $function ) {
		$result = array(
			'function' => 'Unknown',
			'file'     => 'Unknown',
			'line'     => 0,
		);

		// Function is a closure
		if ( $function instanceof \Closure ) {
			$result['function'] = 'Anonymous function';

			$reflection     = new \ReflectionFunction( $function );
			$result['file'] = $reflection->getFileName();
			$result['line'] = $reflection->getStartLine();

			return $result;
		}

		// Function is an array (class method)
		if ( is_array( $function ) ) {
			if ( is_object( $function[0] ) ) {
				$class              = get_class( $function[0] );
				$result['function'] = $class . '->' . $function[1];
			} else {
				$result['function'] = $function[0] . '::' . $function[1];
			}

			if ( method_exists( $function[0], $function[1] ) ) {
				$reflection     = new \ReflectionMethod( $function[0], $function[1] );
				$result['file'] = $reflection->getFileName();
				$result['line'] = $reflection->getStartLine();
			}

			return $result;
		}

		// Function is a string (function name)
		if ( is_string( $function ) && function_exists( $function ) ) {
			$result['function'] = $function;

			$reflection     = new \ReflectionFunction( $function );
			$result['file'] = $reflection->getFileName();
			$result['line'] = $reflection->getStartLine();

			return $result;
		}

		// Return default if we couldn't determine the function info
		return $result;
	}

	/**
	 * Get hook inspector settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings() {
		// Implementation details would go here
		return $this->send_json_success(
			array(
				'enabled'     => true,
				'track_hooks' => true,
			)
		);
	}

	/**
	 * Update hook inspector settings
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function update_settings( $request ) {
		$enabled     = $request->get_param( 'enabled' );
		$track_hooks = $request->get_param( 'track_hooks' );

		// Implementation details would go here
		$success = true; // Placeholder for actual implementation

		if ( $success ) {
			return $this->send_json_success(
				array(
					'enabled'     => $enabled,
					'track_hooks' => $track_hooks,
				)
			);
		}

		return $this->send_json_error( __( 'Failed to update settings', 'wp-dev-toolkit' ) );
	}
}
