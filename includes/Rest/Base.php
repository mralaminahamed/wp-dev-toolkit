<?php

namespace WPDevToolkit\REST;

use WP_REST_Controller;

/**
 * Base class for REST API controllers
 *
 * @package WPDevToolkit\REST
 */
abstract class Base extends WP_REST_Controller {
	/**
	 * API namespace
	 *
	 * @var string
	 */
	protected $namespace = 'wp-dev-toolkit/v1';

	/**
	 * Check permissions for endpoints
	 *
	 * @return bool
	 */
	public function permission_callback(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Validate boolean parameter
	 *
	 * @param mixed  $param   Parameter value
	 * @param object $request Request object
	 * @param string $key     Parameter key
	 *
	 * @return bool
	 */
	public function validate_boolean( $param, object $request, string $key ): bool {
		return is_bool( $param );
	}

	/**
	 * Send success response
	 *
	 * @param mixed $data        Response data
	 * @param int   $status_code HTTP status code
	 *
	 * @return \WP_REST_Response
	 */
	protected function send_json_success( $data = null, $status_code = 200 ): \WP_REST_Response {
		return $this->send_json_response( true, $data, $status_code );
	}

	/**
	 * Send error response
	 *
	 * @param string $message     Error message
	 * @param int $status_code HTTP status code
	 *
	 * @return \WP_REST_Response
	 */
	protected function send_json_error( string $message = '', int $status_code = 400 ): \WP_REST_Response {
		return $this->send_json_response( false, array( 'message' => $message ), $status_code );
	}

	/**
	 * Send JSON response
	 *
	 * @param bool $success     Success status
	 * @param mixed $data        Response data
	 * @param int $status_code HTTP status code
	 *
	 * @return \WP_REST_Response
	 */
	private function send_json_response( bool $success, $data, int $status_code ): \WP_REST_Response {
		$response = array(
			'success' => $success,
			'data'    => $data,
		);

		return rest_ensure_response( $response );
	}
}
