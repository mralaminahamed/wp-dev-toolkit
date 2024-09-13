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
			],
		]);
	}

	public function get_dev_mode() {
		return rest_ensure_response(['dev_mode' => get_option('wp_dev_toolkit_dev_mode', false)]);
	}

	public function set_dev_mode($request) {
		$dev_mode = $request->get_param('dev_mode');
		update_option('wp_dev_toolkit_dev_mode', $dev_mode);
		return rest_ensure_response(['dev_mode' => $dev_mode]);
	}
}