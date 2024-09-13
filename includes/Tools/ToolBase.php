<?php
namespace WPDevToolkit\Tools;

use WPDevToolkit\Core\Config;
use WPDevToolkit\ToolInterface;

abstract class ToolBase implements ToolInterface {
	protected $config;

	public function __construct(Config $config) {
		$this->config = $config;
	}

	abstract public function init();
	abstract public function register_rest_routes();

	protected function is_enabled() {
		return $this->config->get(static::TOOL_KEY, false);
	}

	public function check_admin_permissions() {
		return current_user_can('manage_options');
	}
}