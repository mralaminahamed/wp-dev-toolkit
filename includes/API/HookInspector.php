<?php
namespace WPDevToolkit\API;

class HookInspector extends RestBase {
	public function register_routes() {
		register_rest_route($this->namespace, '/hooks', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_hooks'],
				'permission_callback' => [$this, 'permission_callback'],
			],
		]);
	}

	public function get_hooks() {
		global $wp_filter;
		$hooks = array_keys($wp_filter);
		return rest_ensure_response(['hooks' => $hooks]);
	}
}