<?php
namespace WPDevToolkit\Tools;

use WP_REST_Server;
use WPDevToolkit\Base\ToolBase;

class ErrorLogger extends ToolBase {
	const TOOL_KEY = 'error_logging';

	public static function clean_old_logs() {
		// Implementation for cleaning old logs
		$log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
		if (file_exists($log_file) && filesize($log_file) > 5 * 1024 * 1024) { // 5MB limit
			$backup_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log.bak';
			if (file_exists($backup_file)) {
				unlink($backup_file);
			}
			rename($log_file, $backup_file);
			file_put_contents($log_file, "Log file rotated at " . date('Y-m-d H:i:s') . "\n");
		}
	}

	public function init() {
		if ($this->is_enabled()) {
			add_action('init', [$this, 'setup_error_logging']);
		}
	}

	public function setup_error_logging() {
		ini_set('display_errors', 1);
		ini_set('log_errors', 1);
		ini_set('error_log', WP_CONTENT_DIR . '/wp-dev-toolkit-error.log');
	}

	public function register_rest_routes() {
		register_rest_route('wp-dev-toolkit/v1', '/error-log', [
			'methods' => WP_REST_Server::READABLE,
			'callback' => [$this, 'get_error_log'],
			'permission_callback' => [$this, 'check_admin_permissions'],
		]);

		register_rest_route('wp-dev-toolkit/v1', '/error-log', [
			'methods' => WP_REST_Server::DELETABLE,
			'callback' => [$this, 'clear_error_log'],
			'permission_callback' => [$this, 'check_admin_permissions'],
		]);
	}

	public function get_error_log() {
		$log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
		$log_content = file_exists($log_file) ? file_get_contents($log_file) : '';
		return rest_ensure_response(['log_content' => $log_content]);
	}

	public function clear_error_log() {
		$log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
		file_put_contents($log_file, '');
		return rest_ensure_response(['message' => 'Error log cleared']);
	}
}
