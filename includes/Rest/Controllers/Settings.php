<?php

namespace WPDevToolkit\Rest\Controllers;

use WPDevToolkit\Rest\Base;
use WPDevToolkit\Core\Config;

/**
 * Settings REST API Controller
 *
 * @package WPDevToolkit\Rest\Controllers
 */
class Settings extends Base {
    /**
     * Configuration instance
     *
     * @var Config
     */
    protected $config;

    /**
     * Constructor
     *
     * @param Config $config Configuration instance
     */
    public function __construct(Config $config) {
        $this->config = $config;
    }

	/**
	 * Register routes for this controller
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route($this->namespace, '/settings', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_settings'],
				'permission_callback' => [$this, 'permission_callback'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'update_settings'],
				'permission_callback' => [$this, 'permission_callback'],
			],
		]);

		register_rest_route($this->namespace, '/settings/reset', [
			[
				'methods' => 'POST',
				'callback' => [$this, 'reset_settings'],
				'permission_callback' => [$this, 'permission_callback'],
			],
		]);
	}

	/**
	 * Get plugin settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings() {
		return $this->send_json_success([
			'settings' => $this->config->get_all(),
			'version' => WP_DEV_TOOLKIT_VERSION,
		]);
	}

	/**
	 * Update plugin settings
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function update_settings($request) {
		$new_settings = $request->get_json_params();

		if (!is_array($new_settings)) {
			return $this->send_json_error(__('Invalid settings data', 'wp-dev-toolkit'));
		}

		$this->config->update($new_settings);

		return $this->send_json_success([
			'settings' => $this->config->get_all(),
			'message' => __('Settings updated successfully', 'wp-dev-toolkit'),
		]);
	}

	/**
	 * Reset plugin settings to defaults
	 *
	 * @return \WP_REST_Response
	 */
	public function reset_settings() {
		$this->config->set_default_options();

		return $this->send_json_success([
			'settings' => $this->config->get_all(),
			'message' => __('Settings reset to defaults', 'wp-dev-toolkit'),
		]);
	}
}
