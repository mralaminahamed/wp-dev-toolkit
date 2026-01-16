<?php
/**
 * REST Controllers Loader
 *
 * @package WPDevToolkit\Rest
 */

namespace WPDevToolkit\Rest;

/**
 * Controller Loader Class
 *
 * Manages registration of REST controllers
 */
class ControllerLoader {
	/**
	 * Controller instances
	 *
	 * @var array
	 */
	private $controllers = array();

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->init_controllers();
	}

	/**
	 * Initialize controllers
	 *
	 * @return void
	 */
	private function init_controllers() {
		$this->controllers = array(
			'settings'       => new Controllers\Settings(),
			'dev_mode'       => new Controllers\DevMode(),
			'error_log'      => new Controllers\ErrorLog(),
			'query_monitor'  => new Controllers\QueryMonitor(),
			'hook_inspector' => new Controllers\HookInspector(),
			'terminal'       => new Controllers\Terminal(),
			'system_info'    => new Controllers\SystemInfo(),
		);
	}

	/**
	 * Register all controllers
	 *
	 * @return void
	 */
	public function register_routes() {
		foreach ( $this->controllers as $controller ) {
			$controller->register_routes();
		}
	}

	/**
	 * Get controller by name
	 *
	 * @param string $name Controller name
	 *
	 * @return mixed|null Controller instance or null if not found
	 */
	public function get_controller( $name ) {
		return isset( $this->controllers[ $name ] ) ? $this->controllers[ $name ] : null;
	}
}
