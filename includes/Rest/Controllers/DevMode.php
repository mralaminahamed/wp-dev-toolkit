<?php

namespace WPDevToolkit\Rest\Controllers;

use WPDevToolkit\Rest\Base;

/**
 * Development Mode REST API Controller
 *
 * @package WPDevToolkit\Rest\Controllers
 */
class DevMode extends Base {
	/**
	 * Register routes for this controller
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/dev-mode',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_dev_mode' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_dev_mode' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'enabled' => array(
							'type'              => 'boolean',
							'required'          => true,
							'validate_callback' => array( $this, 'validate_boolean' ),
						),
					),
				),
			)
		);
	}

	/**
	 * Get development mode status
	 *
	 * @return \WP_REST_Response
	 */
	public function get_dev_mode() {
		$enabled = get_option( 'wp_dev_toolkit_dev_mode', false );

		return $this->send_json_success(
			array(
				'enabled'          => (bool) $enabled,
				'wp_debug'         => defined( 'WP_DEBUG' ) && WP_DEBUG,
				'wp_debug_log'     => defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG,
				'wp_debug_display' => defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY,
			)
		);
	}

	/**
	 * Update development mode status
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function update_dev_mode( $request ) {
		$enabled = $request->get_param( 'enabled' );

		update_option( 'wp_dev_toolkit_dev_mode', $enabled );

		// Attempt to update wp-config.php constants if we have filesystem access
		$config_updated = $this->update_wp_debug_constants( $enabled );

		return $this->send_json_success(
			array(
				'enabled'          => (bool) $enabled,
				'config_updated'   => $config_updated,
				'wp_debug'         => defined( 'WP_DEBUG' ) && WP_DEBUG,
				'wp_debug_log'     => defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG,
				'wp_debug_display' => defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY,
			)
		);
	}

	/**
	 * Update WordPress debug constants in wp-config.php
	 *
	 * Note: This requires filesystem access and may not work in all environments
	 *
	 * @param bool $enabled Whether debug mode should be enabled
	 *
	 * @return bool Whether the update was successful
	 */
	private function update_wp_debug_constants( $enabled ) {
		// This is a placeholder - actual implementation would use WP_Filesystem
		// to modify wp-config.php, which requires proper permissions

		// For security reasons, we're not implementing the actual file modification
		// as it could potentially be dangerous if not implemented carefully

		return false;
	}
}
