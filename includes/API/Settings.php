<?php
namespace WPDevToolkit\API;

class Settings extends RestBase {
	private $default_settings = [
		'dev_mode' => false,
		'error_logging' => true,
		'query_monitoring' => true,
		'hook_inspection' => true,
		'log_level' => 'all',
		'max_queries' => 100,
		'slow_query_threshold' => 1.0,
	];

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
	}

	public function get_settings() {
		$settings = get_option('wp_dev_toolkit_settings', $this->default_settings);
		return $this->send_json_success(['settings' => $settings]);
	}

	public function update_settings($request) {
		$new_settings = $request->get_param('settings');
		$current_settings = get_option('wp_dev_toolkit_settings', $this->default_settings);

		$updated_settings = array_merge($current_settings, $new_settings);

		// Validate and sanitize settings
		$updated_settings['dev_mode'] = isset($new_settings['dev_mode']) ? (bool)$new_settings['dev_mode'] : $current_settings['dev_mode'];
		$updated_settings['error_logging'] = isset($new_settings['error_logging']) ? (bool)$new_settings['error_logging'] : $current_settings['error_logging'];
		$updated_settings['query_monitoring'] = isset($new_settings['query_monitoring']) ? (bool)$new_settings['query_monitoring'] : $current_settings['query_monitoring'];
		$updated_settings['hook_inspection'] = isset($new_settings['hook_inspection']) ? (bool)$new_settings['hook_inspection'] : $current_settings['hook_inspection'];
		$updated_settings['log_level'] = isset($new_settings['log_level']) && in_array($new_settings['log_level'], ['all', 'error', 'warning', 'notice', 'info']) ? $new_settings['log_level'] : $current_settings['log_level'];
		$updated_settings['max_queries'] = isset($new_settings['max_queries']) ? absint($new_settings['max_queries']) : $current_settings['max_queries'];
		$updated_settings['slow_query_threshold'] = isset($new_settings['slow_query_threshold']) ? floatval($new_settings['slow_query_threshold']) : $current_settings['slow_query_threshold'];

		update_option('wp_dev_toolkit_settings', $updated_settings);

		return $this->send_json_success(['settings' => $updated_settings]);
	}

	public static function get($key, $default = null) {
		$settings = get_option('wp_dev_toolkit_settings', self::$default_settings);
		return isset($settings[$key]) ? $settings[$key] : $default;
	}
}