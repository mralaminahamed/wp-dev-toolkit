<?php
namespace WPDevToolkit\Tools;

use WPDevToolkit\Base\ToolInterface;

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
		return new $class();
	}
}
