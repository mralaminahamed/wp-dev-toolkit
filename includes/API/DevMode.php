<?php
namespace WPDevToolkit\API;

class DevMode extends RestBase {
	public function register_routes() {
		register_rest_route($this->namespace, '/dev-mode', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_dev_mode'],
				'permission_callback' => [$this, 'permission_callback'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'set_dev_mode'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'dev_mode' => [
						'required' => true,
						'validate_callback' => [$this, 'validate_boolean'],
					],
				],
			],
		]);

		register_rest_route($this->namespace, '/dev-mode/features', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_dev_features'],
				'permission_callback' => [$this, 'permission_callback'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'set_dev_features'],
				'permission_callback' => [$this, 'permission_callback'],
			],
		]);
	}

	public function get_dev_mode() {
		$dev_mode = get_option('wp_dev_toolkit_dev_mode', false);
		return $this->send_json_success(['dev_mode' => $dev_mode]);
	}

	public function set_dev_mode($request) {
		$dev_mode = $request->get_param('dev_mode');
		update_option('wp_dev_toolkit_dev_mode', $dev_mode);
		return $this->send_json_success(['dev_mode' => $dev_mode]);
	}

	public function get_dev_features() {
		$features = get_option('wp_dev_toolkit_dev_features', [
			'error_logging' => true,
			'query_monitoring' => true,
			'hook_inspection' => true,
		]);
		return $this->send_json_success(['features' => $features]);
	}

	public function set_dev_features($request) {
		$features = $request->get_param('features');
		$valid_features = ['error_logging', 'query_monitoring', 'hook_inspection'];

		$updated_features = [];
		foreach ($valid_features as $feature) {
			$updated_features[$feature] = isset($features[$feature]) ? (bool)$features[$feature] : false;
		}

		update_option('wp_dev_toolkit_dev_features', $updated_features);
		return $this->send_json_success(['features' => $updated_features]);
	}
}