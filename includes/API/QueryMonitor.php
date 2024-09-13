<?php
namespace WPDevToolkit\API;

class QueryMonitor extends RestBase {
	public function register_routes() {
		register_rest_route($this->namespace, '/queries', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_queries'],
				'permission_callback' => [$this, 'permission_callback'],
			],
		]);
	}

	public function get_queries() {
		global $wpdb;
		return rest_ensure_response(['queries' => $wpdb->queries]);
	}
}