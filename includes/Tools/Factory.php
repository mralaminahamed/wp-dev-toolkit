<?php
/**
 * Tool Factory for WordPress Development Toolkit
 *
 * @package WPDevToolkit\Tools
 * @since   1.0.0
 */

namespace WPDevToolkit\Tools;

use WPDevToolkit\Base\ToolInterface;
use WPDevToolkit\Core\Config;
use Exception;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tool Factory
 *
 * Factory class for creating and managing development tool instances.
 * Implements the Factory pattern for consistent tool instantiation.
 *
 * @package WPDevToolkit\Tools
 * @since   1.0.0
 */
class Factory {
	/**
	 * Registered tool classes
	 *
	 * @since 1.0.0
	 *
	 * @var array<string, class-string>
	 */
	private array $tools = [];

	/**
	 * Configuration instance
	 *
	 * @since 1.0.0
	 *
	 * @var Config
	 */
	private Config $config;

	/**
	 * Constructor
	 *
	 * Initializes the factory with configuration and registers default tools.
	 *
	 * @since 1.0.0
	 *
	 * @param Config|null $config Configuration instance. Creates new if null.
	 */
	public function __construct( ?Config $config = null ) {
		$this->config = $config ?? new Config();
		$this->register_default_tools();
	}

	/**
	 * Register default tools
	 *
	 * Registers all built-in development tools with their configuration keys.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private function register_default_tools(): void {
		$default_tools = [
			'error_logging'    => ErrorLogger::class,
			'query_monitoring' => QueryMonitor::class,
			'hook_inspection'  => HookInspector::class,
		];

		// Allow developers to modify default tools.
		$default_tools = apply_filters( 'wp_dev_toolkit_default_tools', $default_tools );

		foreach ( $default_tools as $key => $class ) {
			$this->register( $key, $class );
		}
	}

	/**
	 * Register a tool class
	 *
	 * Registers a tool class for later instantiation. Validates that the
	 * class exists and implements the correct interface.
	 *
	 * @since 1.0.0
	 *
	 * @param string $name  Tool configuration key.
	 * @param string $class Fully qualified tool class name.
	 *
	 * @return void
	 *
	 * @throws Exception If class doesn't exist or implement ToolInterface.
	 */
	public function register( string $name, string $class ): void {
		// Validate class exists.
		if ( ! class_exists( $class ) ) {
			throw new Exception(
				sprintf(
					/* translators: %s: Tool class name */
					__( 'Tool class %s does not exist', 'wp-dev-toolkit' ),
					$class
				)
			);
		}

		// Validate class implements ToolInterface.
		if ( ! in_array( ToolInterface::class, class_implements( $class ) ?: [], true ) ) {
			throw new Exception(
				sprintf(
					/* translators: %s: Tool class name */
					__( 'Tool class %s must implement ToolInterface', 'wp-dev-toolkit' ),
					$class
				)
			);
		}

		$this->tools[ $name ] = $class;
	}

	/**
	 * Create a tool instance
	 *
	 * Creates and returns a configured tool instance. Ensures tools
	 * are only created if they are registered.
	 *
	 * @since 1.0.0
	 *
	 * @param string $name Tool configuration key.
	 *
	 * @return ToolInterface The created tool instance.
	 *
	 * @throws Exception If tool is not registered.
	 */
	public function create( string $name ): ToolInterface {
		if ( ! isset( $this->tools[ $name ] ) ) {
			throw new Exception(
				sprintf(
					/* translators: %s: Tool name */
					__( 'Unknown tool: %s', 'wp-dev-toolkit' ),
					$name
				)
			);
		}

		$class = $this->tools[ $name ];
		return new $class( $this->config );
	}

	/**
	 * Get all registered tools
	 *
	 * Returns the list of all registered tool names and their classes.
	 *
	 * @since 1.0.0
	 *
	 * @return array<string, class-string> Registered tools array.
	 */
	public function get_registered_tools(): array {
		return $this->tools;
	}

	/**
	 * Check if a tool is registered
	 *
	 * @since 1.0.0
	 *
	 * @param string $name Tool configuration key.
	 *
	 * @return bool True if tool is registered, false otherwise.
	 */
	public function is_registered( string $name ): bool {
		return isset( $this->tools[ $name ] );
	}
}
