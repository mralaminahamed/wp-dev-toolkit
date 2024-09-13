<?php

namespace WPDevToolkit\API;

use WP_REST_Controller;

abstract class RestBase extends WP_REST_Controller {
	protected $namespace = 'wp-dev-toolkit/v1';

	public function permission_callback(): bool {
		return current_user_can('manage_options');
	}

	public function validate_boolean($param, $request, $key): bool {
		return is_bool($param);
	}

	protected function send_json_success($data = null, $status_code = 200) {
		return $this->send_json_response(true, $data, $status_code);
	}

	protected function send_json_error($message = '', $status_code = 400) {
		return $this->send_json_response(false, ['message' => $message], $status_code);
	}

	private function send_json_response($success, $data, $status_code) {
		$response = [
			'success' => $success,
			'data' => $data,
		];
		return rest_ensure_response($response);
	}
}