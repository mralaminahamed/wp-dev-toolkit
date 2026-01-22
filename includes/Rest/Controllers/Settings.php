<?php

namespace WPDevToolkit\Rest\Controllers;

use WPDevToolkit\Admin\Config;
use WPDevToolkit\Rest\Base;

/**
 * Settings REST API Controller
 *
 * @package WPDevToolkit\Rest\Controllers
 */
class Settings extends Base {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Constructor logic if needed
	}

	/**
	 * Get configuration instance
	 *
	 * @return Config
	 */
	protected function get_config() {
		return wp_dev_toolkit()->get_config();
	}

	/**
	 * Register routes for this controller
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/settings',
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
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/settings/reset',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'reset_settings' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);
	}

	/**
	 * Get plugin settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings() {
		return $this->send_json_success(
			array(
				'settings' => $this->get_config()->get_all(),
				'version'  => WP_DEV_TOOLKIT_VERSION,
			)
		);
	}

	/**
	 * Update plugin settings
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function update_settings( $request ) {
		$new_settings = $request->get_json_params();

		if ( ! is_array( $new_settings ) ) {
			return $this->send_json_error( __( 'Invalid settings data', 'wp-dev-toolkit' ) );
		}

		$this->get_config()->update( $new_settings );

		return $this->send_json_success(
			array(
				'settings' => $this->get_config()->get_all(),
				'message'  => __( 'Settings updated successfully', 'wp-dev-toolkit' ),
			)
		);
	}

	/**
	 * Reset plugin settings to defaults
	 *
	 * @return \WP_REST_Response
	 */
	public function reset_settings() {
		$this->get_config()->set_default_options();

		return $this->send_json_success(
			array(
				'settings' => $this->get_config()->get_all(),
				'message'  => __( 'Settings reset to defaults', 'wp-dev-toolkit' ),
			)
		);
	}
}
