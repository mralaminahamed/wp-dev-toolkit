<?php

namespace WPDevToolkit\API;

class ErrorLog extends RestBase {
	public function register_routes() {
		register_rest_route( $this->namespace, '/error-log', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_error_log' ],
				'permission_callback' => [ $this, 'permission_callback' ],
			],
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'clear_error_log' ],
				'permission_callback' => [ $this, 'permission_callback' ],
			],
		] );
	}

	public function get_error_log() {
		$log_content = file_get_contents( WP_CONTENT_DIR . '/debug.log' );

		return rest_ensure_response( [ 'log_content' => $log_content ] );
	}

	public function clear_error_log() {
		file_put_contents( WP_CONTENT_DIR . '/debug.log', '' );

		return rest_ensure_response( [ 'message' => 'Error log cleared' ] );
	}
}