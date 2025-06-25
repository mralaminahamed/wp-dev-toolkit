<?php
namespace WPDevToolkit\Tools;

use WPDevToolkit\Base\ToolInterface;
use WPDevToolkit\Core\Config;

/**
 * Tool Factory
 *
 * Factory class for creating tool instances
 *
 * @package WPDevToolkit\Tools
 */
class Factory {
	/**
	 * Registered tool classes
	 *
	 * @var array
	 */
	private $tools = array();

	/**
	 * Configuration instance
	 *
	 * @var Config
	 */
	private $config;

	/**
	 * Constructor
	 *
	 * @param Config|null $config Configuration instance
	 */
	public function __construct( Config $config = null ) {
		$this->config = $config ?? new Config();
		$this->register_default_tools();
	}

	/**
	 * Register default tools
	 *
	 * @return void
	 */
	private function register_default_tools() {
		$this->register( 'error_logger', ErrorLogger::class );
		$this->register( 'query_monitor', QueryMonitor::class );
		$this->register( 'hook_inspector', HookInspector::class );
	}

	/**
	 * Register a tool class
	 *
	 * @param string $name  Tool name
	 * @param string $class Tool class
	 *
	 * @return void
	 */
	public function register( $name, $class ) {
		$this->tools[ $name ] = $class;
	}

	/**
	 * Create a tool instance
	 *
	 * @param string $name Tool name
	 *
	 * @return ToolInterface
	 * @throws \Exception If tool is not registered
	 */
	public function create( $name ) {
		if ( ! isset( $this->tools[ $name ] ) ) {
			throw new \Exception( "Unknown tool: $name" );
		}

		$class = $this->tools[ $name ];
		return new $class( $this->config );
	}
}
