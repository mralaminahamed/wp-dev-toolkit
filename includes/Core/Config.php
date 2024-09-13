<?php
namespace WPDevToolkit\Core;

class Config {
	private $config = [];
	private $option_name = 'wp_dev_toolkit_config';

	public function __construct() {
		$this->load_config();
	}

	private function load_config() {
		$saved_config = get_option($this->option_name, []);
		$this->config = array_merge($this->get_default_config(), $saved_config);
	}

	public function get($key, $default = null) {
		return isset($this->config[$key]) ? $this->config[$key] : $default;
	}

	public function set($key, $value) {
		$this->config[$key] = $value;
		$this->save_config();
	}

	public function get_all() {
		return $this->config;
	}

	public function update($new_config) {
		$this->config = array_merge($this->config, $new_config);
		$this->save_config();
	}

	private function save_config() {
		update_option($this->option_name, $this->config);
	}

	public function set_default_options() {
		$this->config = $this->get_default_config();
		$this->save_config();
	}

	public function reset_to_defaults() {
		$this->set_default_options();
	}

	private function get_default_config() {
		return [
			'dev_mode' => false,
			'error_logging' => true,
			'query_monitoring' => true,
			'hook_inspection' => true,
			'debug_bar_integration' => true,
			'log_retention_days' => 30,
			'allowed_ip_addresses' => [],
			'excluded_hooks' => [],
			'excluded_queries' => [],
		];
	}

	public function validate_config() {
		$default_config = $this->get_default_config();
		foreach ($default_config as $key => $default_value) {
			if (!isset($this->config[$key])) {
				$this->config[$key] = $default_value;
			}
		}
		$this->save_config();
	}
}