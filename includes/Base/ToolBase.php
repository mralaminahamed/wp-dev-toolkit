<?php
/**
 * Base Tool Class for WordPress Development Toolkit
 *
 * @package WPDevToolkit\Base
 * @since   1.0.0
 */

namespace WPDevToolkit\Base;

use WPDevToolkit\Core\Config;
use LogicException;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base class for all development tools
 *
 * Provides common functionality and enforces consistent implementation
 * patterns for all toolkit tools. All tools should extend this class.
 *
 * @package WPDevToolkit\Base
 * @since   1.0.0
 */
abstract class ToolBase implements ToolInterface {

	/**
	 * Tool key for configuration
	 *
	 * Each child class must define this constant to identify the tool
	 * in configuration settings and other contexts.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	public const TOOL_KEY = '';

	/**
	 * Configuration instance
	 *
	 * @since 1.0.0
	 *
	 * @var Config
	 */
	protected Config $config;

	/**
	 * Constructor
	 *
	 * Initializes the tool with configuration and validates that the child
	 * class has properly defined the required TOOL_KEY constant.
	 *
	 * @since 1.0.0
	 *
	 * @throws LogicException If TOOL_KEY constant is not defined.
	 */
	public function __construct() {
		$this->config = wp_dev_toolkit()->get_config();

		// Validate that child class has defined TOOL_KEY.
		if ( '' === static::TOOL_KEY ) {
			throw new LogicException(
				sprintf(
					/* translators: %s: Tool class name */
					esc_html__( 'Tool class %s must define TOOL_KEY constant', 'wp-dev-toolkit' ),
					esc_html( get_class( $this ) )
				)
			);
		}
	}

	/**
	 * Initialize the tool
	 *
	 * Child classes must implement this method to set up their specific
	 * functionality, register hooks, and prepare for operation.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	abstract public function init(): void;

	/**
	 * Register REST API routes for the tool
	 *
	 * Child classes must implement this method to register any REST API
	 * endpoints they need for frontend communication.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	abstract public function register_rest_routes(): void;

	/**
	 * Check if the tool is enabled
	 *
	 * Checks the configuration to determine if this tool should be active.
	 * Tools can use this to conditionally initialize functionality.
	 *
	 * @since 1.0.0
	 *
	 * @return bool True if the tool is enabled, false otherwise.
	 */
	final protected function is_enabled(): bool {
		return (bool) $this->config->get( static::TOOL_KEY, false );
	}

	/**
	 * Check if the current user has admin permissions
	 *
	 * Standard permission check for REST API endpoints and admin operations.
	 * Uses WordPress's manage_options capability.
	 *
	 * @since 1.0.0
	 *
	 * @return bool True if user has admin permissions, false otherwise.
	 */
	final public function check_admin_permissions(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get the tool key
	 *
	 * Returns the tool's configuration key for identification purposes.
	 *
	 * @since 1.0.0
	 *
	 * @return string The tool key.
	 */
	final public function get_tool_key(): string {
		return static::TOOL_KEY;
	}

	/**
	 * Get the tool name
	 *
	 * Converts the tool key into a human-readable name by replacing
	 * underscores with spaces and applying title case.
	 *
	 * @since 1.0.0
	 *
	 * @return string The formatted tool name.
	 */
	final public function get_tool_name(): string {
		return ucwords( str_replace( '_', ' ', static::TOOL_KEY ) );
	}
}
