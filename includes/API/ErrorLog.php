<?php

namespace WPDevToolkit\API;

class ErrorLog extends RestBase {
	public function register_routes() {
		register_rest_route($this->namespace, '/error-log', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_error_log'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'lines' => [
						'default' => 100,
						'sanitize_callback' => 'absint',
					],
					'level' => [
						'default' => 'all',
						'enum' => ['all', 'error', 'warning', 'notice', 'info'],
					],
				],
			],
			[
				'methods' => 'DELETE',
				'callback' => [$this, 'clear_error_log'],
				'permission_callback' => [$this, 'permission_callback'],
			],
		]);

		register_rest_route($this->namespace, '/error-log/settings', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_log_settings'],
				'permission_callback' => [$this, 'permission_callback'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'set_log_settings'],
				'permission_callback' => [$this, 'permission_callback'],
			],
		]);
	}

	public function get_error_log($request) {
		$lines = $request->get_param('lines');
		$level = $request->get_param('level');

		$log_file = WP_CONTENT_DIR . '/debug.log';
		if (!file_exists($log_file)) {
			return $this->send_json_error('Log file does not exist', 404);
		}

		$log_content = $this->read_log_file($log_file, $lines, $level);
		return $this->send_json_success(['log_content' => $log_content]);
	}

	public function clear_error_log() {
		$log_file = WP_CONTENT_DIR . '/debug.log';
		if (file_exists($log_file)) {
			file_put_contents($log_file, '');
			return $this->send_json_success(['message' => 'Error log cleared']);
		}
		return $this->send_json_error('Log file does not exist', 404);
	}

	public function get_log_settings() {
		$settings = get_option('wp_dev_toolkit_log_settings', [
			'log_level' => 'all',
			'max_file_size' => 10 * 1024 * 1024, // 10 MB
		]);
		return $this->send_json_success(['settings' => $settings]);
	}

	public function set_log_settings($request) {
		$settings = $request->get_param('settings');
		$valid_settings = [
			'log_level' => in_array($settings['log_level'], ['all', 'error', 'warning', 'notice', 'info']) ? $settings['log_level'] : 'all',
			'max_file_size' => absint($settings['max_file_size']),
		];
		update_option('wp_dev_toolkit_log_settings', $valid_settings);
		return $this->send_json_success(['settings' => $valid_settings]);
	}

	private function read_log_file($file, $lines, $level) {
		$f = fopen($file, "r");
		$cursor = -1;
		$log_data = "";
		$line_count = 0;

		while ($lines > 0 && fseek($f, $cursor, SEEK_END) !== -1) {
			$char = fgetc($f);
			if ($char === "\n") {
				$lines--;
				$line_count++;
			}
			$log_data = $char . $log_data;
			$cursor--;
		}

		fclose($f);

		if ($level !== 'all') {
			$filtered_log = array_filter(
				explode("\n", $log_data),
				function($line) use ($level) {
					return stripos($line, "[$level]") !== false;
				}
			);
			$log_data = implode("\n", $filtered_log);
		}

		return $log_data;
	}
}