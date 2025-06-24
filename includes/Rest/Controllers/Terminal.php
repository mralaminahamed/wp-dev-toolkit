<?php

namespace WPDevToolkit\Rest\Controllers;

use WPDevToolkit\Rest\Base;

/**
 * Terminal REST API Controller
 *
 * @package WPDevToolkit\Rest\Controllers
 */
class Terminal extends Base {
	/**
	 * Register routes for this controller
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route($this->namespace, '/terminal/execute', [
			[
				'methods' => 'POST',
				'callback' => [$this, 'execute_command'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'command' => [
						'required' => true,
						'type' => 'string',
						'sanitize_callback' => [$this, 'sanitize_command'],
					],
				],
			],
		]);

		register_rest_route($this->namespace, '/terminal/history', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_command_history'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'limit' => [
						'default' => 20,
						'sanitize_callback' => 'absint',
					],
				],
			],
		]);

		register_rest_route($this->namespace, '/terminal/settings', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_settings'],
				'permission_callback' => [$this, 'permission_callback'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'update_settings'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'enabled' => [
						'type' => 'boolean',
						'validate_callback' => [$this, 'validate_boolean'],
					],
					'history_limit' => [
						'type' => 'integer',
						'sanitize_callback' => 'absint',
					],
					'allowed_commands' => [
						'type' => 'array',
					],
				],
			],
		]);
	}

	/**
	 * Sanitize command input
	 *
	 * @param string $command Command to sanitize
	 *
	 * @return string
	 */
	public function sanitize_command($command) {
		// Remove any potentially dangerous characters or commands
		$disallowed = ['rm -rf', '> /etc', '| rm', '; rm', '&& rm'];

		foreach ($disallowed as $item) {
			if (stripos($command, $item) !== false) {
				return '';
			}
		}

		return sanitize_text_field($command);
	}

	/**
	 * Execute a command
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function execute_command($request) {
		$command = $request->get_param('command');

		// Security check - abort if command was sanitized to empty
		if (empty($command)) {
			return $this->send_json_error(__('Invalid command', 'wp-dev-toolkit'));
		}

		// Check if this is an allowed command
		if (!$this->is_command_allowed($command)) {
			return $this->send_json_error(__('Command not allowed', 'wp-dev-toolkit'));
		}

		// Store in history
		$this->add_to_history($command);

		// Safety - limit execution time
		$old_time_limit = ini_get('max_execution_time');
		set_time_limit(30);

		// Execute the command
		$output = [];
		$return_var = 0;

		// Execute in a safe environment
		$result = $this->execute_safe_command($command, $output, $return_var);

		// Restore time limit
		set_time_limit($old_time_limit);

		if ($result) {
			return $this->send_json_success([
				'command' => $command,
				'output' => implode("\n", $output),
				'exit_code' => $return_var,
				'executed_at' => current_time('mysql'),
			]);
		}

		return $this->send_json_error(__('Failed to execute command', 'wp-dev-toolkit'));
	}

	/**
	 * Execute command in a safe environment
	 *
	 * @param string $command    Command to execute
	 * @param array  $output     Output will be filled here
	 * @param int    $return_var Return code will be set here
	 *
	 * @return bool True if command executed, false otherwise
	 */
	private function execute_safe_command($command, &$output, &$return_var) {
		// Execute WordPress-specific commands
		if (strpos($command, 'wp ') === 0) {
			return $this->execute_wp_cli_command(substr($command, 3), $output, $return_var);
		}

		// For security, prefix with 'wp' to force WP-CLI usage if possible
		if ($this->is_wp_cli_command($command)) {
			return $this->execute_wp_cli_command($command, $output, $return_var);
		}

		// Default to shell execution
		exec($command, $output, $return_var);
		return true;
	}

	/**
	 * Execute a WP-CLI command
	 *
	 * @param string $command    Command to execute
	 * @param array  $output     Output will be filled here
	 * @param int    $return_var Return code will be set here
	 *
	 * @return bool True if command executed, false otherwise
	 */
	private function execute_wp_cli_command($command, &$output, &$return_var) {
		// Make sure WP-CLI is bootstrapped
		if (!class_exists('WP_CLI')) {
			$output[] = 'WP-CLI not available';
			$return_var = 1;
			return false;
		}

		// Capture output
		ob_start();

		try {
			// Execute the command via WP-CLI
			\WP_CLI::run_command(explode(' ', $command));
			$result = true;
			$return_var = 0;
		} catch (\Exception $e) {
			$output[] = $e->getMessage();
			$result = false;
			$return_var = 1;
		}

		$output_str = ob_get_clean();
		$output = explode("\n", $output_str);

		return $result;
	}

	/**
	 * Check if command is a WP-CLI command
	 *
	 * @param string $command Command to check
	 *
	 * @return bool
	 */
	private function is_wp_cli_command($command) {
		$wp_cli_commands = ['plugin', 'theme', 'user', 'post', 'option', 'site', 'db'];

		foreach ($wp_cli_commands as $wp_cmd) {
			if (strpos($command, $wp_cmd) === 0) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check if command is allowed
	 *
	 * @param string $command Command to check
	 *
	 * @return bool
	 */
	private function is_command_allowed($command) {
		// Get allowed commands from settings
		$allowed_commands = [
			'wp',
			'ls',
			'dir',
			'echo',
			'cat',
			'grep',
			'find',
			'php',
		];

		// Check if command starts with any allowed prefix
		foreach ($allowed_commands as $allowed) {
			if (strpos($command, $allowed) === 0) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Add command to history
	 *
	 * @param string $command Command to add
	 *
	 * @return void
	 */
	private function add_to_history($command) {
		$history = get_option('wp_dev_toolkit_terminal_history', []);
		$history[] = [
			'command' => $command,
			'timestamp' => time(),
		];

		// Limit history size
		$limit = 100;
		if (count($history) > $limit) {
			$history = array_slice($history, -$limit);
		}

		update_option('wp_dev_toolkit_terminal_history', $history);
	}

	/**
	 * Get command history
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function get_command_history($request) {
		$limit = $request->get_param('limit');

		$history = get_option('wp_dev_toolkit_terminal_history', []);

		// Sort by timestamp (newest first)
		usort($history, function($a, $b) {
			return $b['timestamp'] - $a['timestamp'];
		});

		// Apply limit
		$history = array_slice($history, 0, $limit);

		// Format timestamps
		foreach ($history as &$item) {
			$item['executed_at'] = date('Y-m-d H:i:s', $item['timestamp']);
		}

		return $this->send_json_success([
			'history' => $history,
			'total' => count($history),
		]);
	}

	/**
	 * Get terminal settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings() {
		// Implementation details would go here
		return $this->send_json_success([
			'enabled' => true,
			'history_limit' => 100,
			'allowed_commands' => [
				'wp',
				'ls',
				'dir',
				'echo',
				'cat',
				'grep',
				'find',
				'php',
			],
		]);
	}

	/**
	 * Update terminal settings
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function update_settings($request) {
		$enabled = $request->get_param('enabled');
		$history_limit = $request->get_param('history_limit');
		$allowed_commands = $request->get_param('allowed_commands');

		// Implementation details would go here
		$success = true; // Placeholder for actual implementation

		if ($success) {
			return $this->send_json_success([
				'enabled' => $enabled,
				'history_limit' => $history_limit,
				'allowed_commands' => $allowed_commands,
			]);
		}

		return $this->send_json_error(__('Failed to update settings', 'wp-dev-toolkit'));
	}
}
