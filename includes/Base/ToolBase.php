<?php
namespace WPDevToolkit\Base;

use WPDevToolkit\Core\Config;

/**
 * Base class for all tools
 *
 * Provides common functionality for all toolkit tools
 *
 * @package WPDevToolkit\Base
 */
abstract class ToolBase implements ToolInterface {
	/**
	 * Tool key for configuration
	 * 
	 * Each child class should define this constant
	 */
	const TOOL_KEY = '';
	
	/**
	 * Configuration instance
	 *
	 * @var Config
	 */
	protected $config;

	/**
	 * Constructor
	 *
	 * @param Config $config Configuration instance
	 */
	public function __construct( Config $config ) {
		$this->config = $config;
		
		// Validate that child class has defined TOOL_KEY
		if ( static::TOOL_KEY === '' ) {
			throw new \LogicException( sprintf( 'Tool class %s must define TOOL_KEY constant', get_class( $this ) ) );
		}
	}

	/**
	 * Initialize the tool
	 *
	 * @return void
	 */
	abstract public function init();

	/**
	 * Register REST routes for the tool
	 *
	 * @return void
	 */
	abstract public function register_rest_routes();

	/**
	 * Check if the tool is enabled
	 *
	 * @return bool
	 */
	protected function is_enabled() {
		return $this->config->get( static::TOOL_KEY, false );
	}

	/**
	 * Check if the current user has admin permissions
	 *
	 * @return bool
	 */
	public function check_admin_permissions() {
		return current_user_can( 'manage_options' );
	}
	
	/**
	 * Get the tool key
	 *
	 * @return string
	 */
	public function get_tool_key() {
		return static::TOOL_KEY;
	}
	
	/**
	 * Get the tool name
	 *
	 * @return string
	 */
	public function get_tool_name() {
		return ucwords( str_replace( '_', ' ', static::TOOL_KEY ) );
	}
}
