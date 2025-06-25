<?php
namespace WPDevToolkit\Core;

use WPDevToolkit\Core\Config;
use WPDevToolkit\Core\Logger;
use WPDevToolkit\Core\Assets;
use WPDevToolkit\Tools\Factory as ToolFactory;
use WPDevToolkit\Base\ToolInterface;
use WPDevToolkit\Admin\Menu;
use WPDevToolkit\Rest\ControllerLoader;

/**
 * Main Plugin Class
 *
 * Core controller for the WP Dev Toolkit plugin
 *
 * @package WPDevToolkit\Core
 */
class Plugin {
	/**
	 * Configuration instance
	 *
	 * @var Config
	 */
	private $config;

	/**
	 * Tool factory instance
	 *
	 * @var ToolFactory
	 */
	private $tool_factory;

	/**
	 * Registered tools
	 *
	 * @var array
	 */
	private $tools = array();

	/**
	 * Admin menu instance
	 *
	 * @var Menu
	 */
	private $menu;

	/**
	 * REST controller loader
	 *
	 * @var ControllerLoader
	 */
	private $controller_loader;
	
	/**
	 * Assets manager instance
	 *
	 * @var Assets
	 */
	private $assets;

	/**
	 * Constructor
	 *
	 * @param Config      $config       Configuration instance
	 * @param ToolFactory $tool_factory Tool factory instance
	 */
	public function __construct( Config $config, ToolFactory $tool_factory ) {
		$this->config            = $config;
		$this->tool_factory      = $tool_factory;
		$this->menu              = new Menu( $this );
		$this->controller_loader = new ControllerLoader( $config );
		$this->assets            = new Assets( $config );
	}

	/**
	 * Initialize the plugin
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'init', array( $this, 'load_textdomain' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );

		// Let the Menu class handle the admin menu
		$this->menu->init();
		
		// Initialize assets
		$this->assets->init();

		$this->init_tools();

		// Allow other plugins to hook into our initialization
		do_action( 'wp_dev_toolkit_init', $this );
		
		// Set up error handling if enabled
		if ( $this->config->get( 'error_logging', true ) ) {
			$this->setup_error_handling();
		}
	}
	
	/**
	 * Set up error handling
	 *
	 * @return void
	 */
	private function setup_error_handling() {
		// Register shutdown function to catch fatal errors
		register_shutdown_function( array( $this, 'handle_fatal_error' ) );
		
		// Set custom exception handler
		set_exception_handler( array( $this, 'handle_exception' ) );
	}
	
	/**
	 * Handle fatal errors
	 *
	 * @return void
	 */
	public function handle_fatal_error() {
		$error = error_get_last();
		
		if ( $error && in_array( $error['type'], array( E_ERROR, E_PARSE, E_COMPILE_ERROR, E_CORE_ERROR ) ) ) {
			Logger::log( sprintf(
				'Fatal Error: %s in %s on line %d',
				$error['message'],
				$error['file'],
				$error['line']
			), 'error' );
		}
	}
	
	/**
	 * Handle uncaught exceptions
	 *
	 * @param \Throwable $exception The exception
	 * 
	 * @return void
	 */
	public function handle_exception( $exception ) {
		Logger::log( sprintf(
			'Uncaught Exception: %s in %s on line %d',
			$exception->getMessage(),
			$exception->getFile(),
			$exception->getLine()
		), 'error' );
	}

	/**
	 * Load text domain for internationalization
	 *
	 * @return void
	 */
	public function load_textdomain() {
		load_plugin_textdomain( 'wp-dev-toolkit', false, dirname( WP_DEV_TOOLKIT_PLUGIN_BASENAME ) . '/languages' );
	}

	/**
	 * Register REST API routes
	 *
	 * @return void
	 */
	public function register_rest_routes() {
		// Register core settings routes
		register_rest_route(
			'wp-dev-toolkit/v1',
			'/config',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_config' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
			)
		);

		register_rest_route(
			'wp-dev-toolkit/v1',
			'/config',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'update_config' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
			)
		);

		// Register all controller routes
		$this->controller_loader->register_routes();

		// Register tool-specific routes
		foreach ( $this->tools as $tool ) {
			$tool->register_rest_routes();
		}
	}

	/**
	 * Get configuration endpoint handler
	 *
	 * @return \WP_REST_Response
	 */
	public function get_config() {
		return rest_ensure_response( $this->config->get_all() );
	}

	/**
	 * Update configuration endpoint handler
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function update_config( $request ) {
		$new_config = $request->get_json_params();
		$this->config->update( $new_config );
		return rest_ensure_response( $this->config->get_all() );
	}

	/**
	 * Check admin permissions for REST API
	 *
	 * @return bool
	 */
	public function check_admin_permissions(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Initialize tools
	 *
	 * @return void
	 */
	private function init_tools() {
		// Default tools to register
		$tool_classes = array(
			'error_logging'    => 'WPDevToolkit\\Tools\\ErrorLogger',
			'query_monitoring' => 'WPDevToolkit\\Tools\\QueryMonitor',
			'hook_inspection'  => 'WPDevToolkit\\Tools\\HookInspector',
		);
		
		// Allow plugins to register additional tools
		$tool_classes = apply_filters( 'wp_dev_toolkit_tools', $tool_classes );

		foreach ( $tool_classes as $tool_name => $tool_class ) {
			if ( $this->config->get( $tool_name, true ) ) {
				$this->register_tool( $tool_name, $tool_class );
			}
		}

		// Initialize all registered tools
		foreach ( $this->tools as $tool ) {
			$tool->init();
		}
	}

	/**
	 * Register a tool
	 *
	 * @param string $name  Tool name
	 * @param string $class Tool class
	 *
	 * @return void
	 * @throws \InvalidArgumentException If tool class is invalid
	 */
	public function register_tool( $name, $class ) {
		if ( ! class_exists( $class ) || ! in_array( ToolInterface::class, class_implements( $class ) ) ) {
			throw new \InvalidArgumentException( "Invalid tool class: $class" );
		}
		
		// Create tool instance
		$this->tools[ $name ] = new $class( $this->config );
		
		// Log tool registration
		Logger::log( sprintf( 'Registered tool: %s (%s)', $name, $class ), 'info' );
	}
	
	/**
	 * Get a registered tool
	 *
	 * @param string $name Tool name
	 *
	 * @return ToolInterface|null
	 */
	public function get_tool( $name ) {
		return isset( $this->tools[ $name ] ) ? $this->tools[ $name ] : null;
	}
	
	/**
	 * Get all registered tools
	 *
	 * @return array
	 */
	public function get_tools() {
		return $this->tools;
	}

	/**
	 * Get the assets manager instance
	 *
	 * @return Assets
	 */
	public function get_assets() {
		return $this->assets;
	}
}
