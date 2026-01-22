<?php

namespace WPDevToolkit\Rest\Controllers;

use WPDevToolkit\Rest\Base;

/**
 * Error Log REST API Controller
 *
 * @package WPDevToolkit\Rest\Controllers
 */
class ErrorLog extends Base {
	/**
	 * Register routes for this controller
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/error-log',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_error_log' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'lines' => array(
							'default'           => 100,
							'sanitize_callback' => 'absint',
						),
						'level' => array(
							'default' => 'all',
							'enum'    => array( 'all', 'error', 'warning', 'notice', 'info' ),
						),
					),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'clear_error_log' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/error-log/settings',
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
					'args'                => array(
						'enabled'   => array(
							'type'              => 'boolean',
							'validate_callback' => array( $this, 'validate_boolean' ),
						),
						'log_level' => array(
							'enum' => array( 'all', 'error', 'warning', 'notice', 'info' ),
						),
					),
				),
			)
		);
	}

	/**
	 * Get error log entries
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function get_error_log( $request ) {
		$lines = $request->get_param( 'lines' );
		$level = $request->get_param( 'level' );

		$log_entries = $this->parse_error_log( $lines, $level );

		return $this->send_json_success(
			array(
				'entries' => $log_entries,
				'total'   => count( $log_entries ),
			)
		);
	}

	/**
	 * Clear error log
	 *
	 * @return \WP_REST_Response
	 */
	public function clear_error_log() {
		$log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';

		if ( file_exists( $log_file ) && is_writable( $log_file ) ) {
			// Clear the log file and add a marker entry
			$cleared_message = sprintf(
				'[%s] Log cleared by user ID %d',
				current_time( 'd-M-Y H:i:s T' ),
				get_current_user_id()
			);

			$result = file_put_contents( $log_file, $cleared_message . "\n" );

			if ( false !== $result ) {
				return $this->send_json_success(
					array(
						'message' => __( 'Error log cleared successfully', 'wp-dev-toolkit' ),
					)
				);
			}
		}

		return $this->send_json_error( __( 'Failed to clear error log', 'wp-dev-toolkit' ) );
	}

	/**
	 * Get error log settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings() {
		// Implementation details would go here
		return $this->send_json_success(
			array(
				'enabled'   => true,
				'log_level' => 'all',
			)
		);
	}

	/**
	 * Update error log settings
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function update_settings( $request ) {
		$enabled   = $request->get_param( 'enabled' );
		$log_level = $request->get_param( 'log_level' );

		// Implementation details would go here
		$success = true; // Placeholder for actual implementation

		if ( $success ) {
			return $this->send_json_success(
				array(
					'enabled'   => $enabled,
					'log_level' => $log_level,
				)
			);
		}

		return $this->send_json_error( __( 'Failed to update settings', 'wp-dev-toolkit' ) );
	}

	/**
	 * Parse error log file
	 *
	 * @param int    $lines Number of lines to retrieve
	 * @param string $level Log level filter
	 *
	 * @return array
	 */
	private function parse_error_log( $lines, $level ) {
		$log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
		$entries = array();

		if ( ! file_exists( $log_file ) || ! is_readable( $log_file ) ) {
			return $entries;
		}

		// Read the log file
		$log_content = file_get_contents( $log_file );
		if ( false === $log_content ) {
			return $entries;
		}

		// Split into lines and reverse to get newest first
		$log_lines = array_reverse( explode( "\n", trim( $log_content ) ) );

		// Limit to requested number of lines
		if ( $lines && $lines > 0 && $lines < count( $log_lines ) ) {
			$log_lines = array_slice( $log_lines, 0, $lines );
		}

		// Parse each line
		foreach ( $log_lines as $line ) {
			$line = trim( $line );
			if ( empty( $line ) ) {
				continue;
			}

			$entry = $this->parse_log_line( $line );
			if ( $entry ) {
				// Apply level filter if specified
				if ( 'all' === $level || strtolower( $entry['level'] ) === strtolower( $level ) ) {
					$entries[] = $entry;
				}
			}
		}

		return $entries;
	}

	/**
	 * Parse a single log line
	 *
	 * @param string $line Log line
	 *
	 * @return array|null
	 */
	private function parse_log_line( $line ) {
		// Common log formats:
		// [DD-MMM-YYYY HH:MM:SS UTC] PHP TYPE: MESSAGE in FILE on line LINE
		// DD-MMM-YYYY HH:MM:SS UTC - MESSAGE

		$timestamp = null;
		$message = $line;
		$level = 'UNKNOWN';
		$file = null;
		$line_number = null;

		// Try to extract timestamp
		if ( preg_match( '/^\[([^\]]+)\]/', $line, $matches ) ) {
			$timestamp = $matches[1];
			$message = trim( substr( $line, strlen( $matches[0] ) ) );
		} elseif ( preg_match( '/^(\d{2}-\w{3}-\d{4} \d{2}:\d{2}:\d{2} \w+)/', $line, $matches ) ) {
			$timestamp = $matches[1];
			$message = trim( substr( $line, strlen( $matches[0] ) ) );
		}

		// Try to extract error level from common patterns
		if ( stripos( $message, 'fatal error' ) !== false ) {
			$level = 'ERROR';
		} elseif ( stripos( $message, 'warning' ) !== false ) {
			$level = 'WARNING';
		} elseif ( stripos( $message, 'notice' ) !== false ) {
			$level = 'NOTICE';
		} elseif ( stripos( $message, 'deprecated' ) !== false ) {
			$level = 'DEPRECATED';
		} elseif ( stripos( $message, 'parse error' ) !== false ) {
			$level = 'ERROR';
		} elseif ( stripos( $message, 'info' ) !== false || stripos( $message, 'information' ) !== false ) {
			$level = 'INFO';
		}

		// Try to extract file and line information
		if ( preg_match( '/in (.+) on line (\d+)/i', $message, $matches ) ) {
			$file = $matches[1];
			$line_number = (int) $matches[2];
		}

		return array(
			'timestamp' => $timestamp ?: current_time( 'Y-m-d H:i:s' ),
			'message'   => $message,
			'level'     => $level,
			'file'      => $file,
			'line'      => $line_number,
		);
	}
}
