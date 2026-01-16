<?php
/**
 * WP Dev Toolkit Main Class
 *
 * @package WPDevToolkit
 * @since 1.0.0
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * WP Dev Toolkit Main Class
 *
 * Handles the core functionality of the WP Dev Toolkit plugin.
 *
 * @since 1.0.0
 * @package WPDevToolkit
 */
class WP_Dev_Toolkit {

	/**
	 * Single instance of the plugin
	 *
	 * @since 1.0.0
	 * @var WP_Dev_Toolkit
	 */
	private static $instance = null;

	/**
	 * Configuration instance
	 *
	 * @since 1.0.0
	 * @var \WPDevToolkit\Admin\Config
	 */
	private $config;

	/**
	 * Tool factory instance
	 *
	 * @since 1.0.0
	 * @var WPDevToolkit\Tools\Factory
	 */
	private $tool_factory;

	/**
	 * Registered tools
	 *
	 * @since 1.0.0
	 * @var array
	 */
	private $tools = array();

	/**
	 * Admin menu instance
	 *
	 * @since 1.0.0
	 * @var WPDevToolkit\Admin\Menu
	 */
	private $menu;

	/**
	 * REST controller loader
	 *
	 * @since 1.0.0
	 * @var WPDevToolkit\REST\ControllerLoader
	 */
	private $controller_loader;

	/**
	 * Assets manager instance
	 *
	 * @since 1.0.0
	 * @var WPDevToolkit\Core\Assets
	 */
	private $assets;

	/**
	 * Get single instance of the plugin
	 *
	 * @since 1.0.0
	 * @return WP_Dev_Toolkit
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		// Constructor logic if needed
	}

	/**
	 * Initialize the plugin
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function init(): void {
		\register_activation_hook( WP_DEV_TOOLKIT_FILE, array( $this, 'activate' ) );
		\register_deactivation_hook( WP_DEV_TOOLKIT_FILE, array( $this, 'deactivate' ) );

		\add_action( 'init', array( $this, 'init_components' ) );
		\add_action( 'admin_notices', array( $this, 'dependency_notice' ) );
	}

	/**
	 * Initialize plugin components
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function init_components(): void {
		if ( ! $this->check_dependencies() ) {
			return;
		}

		$this->load_dependencies();
		$this->setup_components();
		$this->init_tools();
		$this->setup_error_handling();

		// Allow other plugins to hook into our initialization
		\do_action( 'wp_dev_toolkit_init', $this );
	}



	/**
	 * Load plugin dependencies
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function load_dependencies() {
		// Load text domain
		\load_plugin_textdomain( 'wp-dev-toolkit', false, dirname( plugin_basename( WP_DEV_TOOLKIT_FILE ) ) . '/languages' );

		// Initialize logger first
		WPDevToolkit\Utilities\Logger::init();
	}

	/**
	 * Setup core components
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function setup_components() {
		$this->config            = new \WPDevToolkit\Admin\Config();
		$this->tool_factory      = new WPDevToolkit\Tools\Factory();
		$this->menu              = new WPDevToolkit\Admin\Menu();
		$this->controller_loader = new WPDevToolkit\REST\ControllerLoader();
		$this->assets            = new \WPDevToolkit\Admin\Assets();

		// Initialize components
		$this->menu->init();
		$this->assets->init();
	}

	/**
	 * Setup error handling
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function setup_error_handling() {
		if ( $this->config->get( 'error_logging', true ) ) {
			register_shutdown_function( array( $this, 'handle_fatal_error' ) );
			set_exception_handler( array( $this, 'handle_exception' ) );
		}
	}

	/**
	 * Handle fatal errors
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function handle_fatal_error() {
		$error = error_get_last();

		if ( $error && in_array( $error['type'], array( E_ERROR, E_PARSE, E_COMPILE_ERROR, E_CORE_ERROR ) ) ) {
			WPDevToolkit\Utilities\Logger::log(
				sprintf(
					'Fatal Error: %s in %s on line %d',
					$error['message'],
					$error['file'],
					$error['line']
				),
				'error'
			);
		}
	}

	/**
	 * Handle uncaught exceptions
	 *
	 * @since 1.0.0
	 * @param Throwable $exception The exception
	 * @return void
	 */
	public function handle_exception( $exception ) {
		WPDevToolkit\Utilities\Logger::log(
			sprintf(
				'Uncaught Exception: %s in %s on line %d',
				$exception->getMessage(),
				$exception->getFile(),
				$exception->getLine()
			),
			'error'
		);
	}

	/**
	 * Register REST API routes
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_rest_routes() {
		// Register core settings routes
		register_rest_route(
			'wp-dev-toolkit/v1',
			'/config',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_config_api' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_config' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
				),
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
	 * @since 1.0.0
	 * @return WP_REST_Response
	 */
	public function get_config_api() {
		return rest_ensure_response( $this->config->get_all() );
	}

	/**
	 * Update configuration endpoint handler
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Request object
	 * @return WP_REST_Response
	 */
	public function update_config( $request ) {
		$new_config = $request->get_json_params();
		$this->config->update( $new_config );
		return rest_ensure_response( $this->config->get_all() );
	}

	/**
	 * Check admin permissions for REST API
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public function check_admin_permissions() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Initialize tools
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function init_tools() {
		// Default tools to register
		$tool_names = array(
			'error_logging',
			'query_monitoring',
			'hook_inspection',
		);

		// Allow plugins to modify tool list
		$tool_names = apply_filters( 'wp_dev_toolkit_tool_names', $tool_names );

		foreach ( $tool_names as $tool_name ) {
			if ( $this->config->get( $tool_name, true ) ) {
				try {
					$tool = $this->tool_factory->create( $tool_name );
					$this->tools[ $tool_name ] = $tool;
					$tool->init();
				} catch ( Exception $e ) {
					WPDevToolkit\Utilities\Logger::log(
						sprintf( 'Failed to create tool %s: %s', $tool_name, $e->getMessage() ),
						'error'
					);
				}
			}
		}
	}

	/**
	 * Register a tool
	 *
	 * @since 1.0.0
	 * @param string $name  Tool name
	 * @param string $class Tool class
	 * @return void
	 * @throws InvalidArgumentException If tool class is invalid
	 */
	public function register_tool( $name, $class ) {
		if ( ! class_exists( $class ) || ! in_array( 'WPDevToolkit\\Tools\\ToolInterface', class_implements( $class ) ) ) {
			throw new InvalidArgumentException( "Invalid tool class: $class" );
		}

		$this->tools[ $name ] = new $class();
		WPDevToolkit\Utilities\Logger::log(
			sprintf( 'Registered tool: %s (%s)', $name, $class ),
			'info'
		);
	}

	/**
	 * Get a registered tool
	 *
	 * @param string $name Tool name
	 *
	 * @return \WPDevToolkit\Tools\ToolInterface|null
	 *@since 1.0.0
	 */
	public function get_tool( $name ) {
		return isset( $this->tools[ $name ] ) ? $this->tools[ $name ] : null;
	}

	/**
	 * Get all registered tools
	 *
	 * @since 1.0.0
	 * @return array
	 */
	public function get_tools() {
		return $this->tools;
	}

	/**
	 * Get the assets manager instance
	 *
	 * @since 1.0.0
	 * @return WPDevToolkit\Core\Assets
	 */
	public function get_assets() {
		return $this->assets;
	}

	/**
	 * Get the config instance
	 *
	 * @return \WPDevToolkit\Admin\Config
	 * @since 1.0.0
	 */
	public function get_config() {
		return $this->config;
	}



	/**
	 * Check plugin dependencies
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	private function check_dependencies(): bool {
		return $this->check_wordpress_version() && $this->check_php_version();
	}

	/**
	 * Check WordPress version
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	private function check_wordpress_version(): bool {
		global $wp_version;
		return version_compare( $wp_version, '5.8', '>=' );
	}

	/**
	 * Check PHP version
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	private function check_php_version(): bool {
		return version_compare( PHP_VERSION, '7.4', '>=' );
	}

	/**
	 * Show dependency notice
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function dependency_notice(): void {
		$missing = array();

		if ( ! $this->check_wordpress_version() ) {
			$missing[] = 'WordPress 5.8+';
		}

		if ( ! $this->check_php_version() ) {
			$missing[] = 'PHP 7.4+';
		}

		if ( empty( $missing ) ) {
			return;
		}

		printf(
			'<div class="notice notice-error"><p>%s</p></div>',
			sprintf(
				/* translators: %s: List of missing plugin dependencies */
				esc_html__( 'WP Dev Toolkit requires: %s', 'wp-dev-toolkit' ),
				esc_html( implode( ', ', $missing ) )
			)
		);
	}

	/**
	 * Plugin activation
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function activate(): void {
		// Create database tables if needed
		// Set default options
		$this->set_default_options();

		// Create secure log directory
		$this->create_log_directory();

		// Schedule cron jobs
		$this->schedule_cron_jobs();

		// Flush rewrite rules
		\flush_rewrite_rules();

		// Log successful activation
		error_log( 'WP Dev Toolkit activated successfully' );

		// Trigger activation hook for extensions
		\do_action( 'wp_dev_toolkit_activated' );
	}

	/**
	 * Plugin deactivation
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function deactivate(): void {
		// Clear scheduled events
		$timestamp = \wp_next_scheduled( 'wp_dev_toolkit_daily_event' );
		if ( $timestamp ) {
			\wp_unschedule_event( $timestamp, 'wp_dev_toolkit_daily_event' );
		}

		$timestamp = \wp_next_scheduled( 'wp_dev_toolkit_weekly_event' );
		if ( $timestamp ) {
			\wp_unschedule_event( $timestamp, 'wp_dev_toolkit_weekly_event' );
		}

		// Flush rewrite rules
		\flush_rewrite_rules();

		// Log deactivation
		error_log( 'WP Dev Toolkit deactivated' );

		// Trigger deactivation hook for extensions
		\do_action( 'wp_dev_toolkit_deactivated' );
	}

	/**
	 * Schedule cron jobs
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function schedule_cron_jobs(): void {
		if ( ! \wp_next_scheduled( 'wp_dev_toolkit_daily_event' ) ) {
			\wp_schedule_event( time(), 'daily', 'wp_dev_toolkit_daily_event' );
		}

		if ( ! \wp_next_scheduled( 'wp_dev_toolkit_weekly_event' ) ) {
			\wp_schedule_event( time(), 'weekly', 'wp_dev_toolkit_weekly_event' );
		}
	}

	/**
	 * Set default plugin options
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function set_default_options(): void {
		if ( ! get_option( 'wp_dev_toolkit_config' ) ) {
			$default_config = array(
				'error_logging'     => true,
				'query_monitoring'  => true,
				'hook_inspection'   => true,
			);
			update_option( 'wp_dev_toolkit_config', $default_config );
		}
	}

	/**
	 * Create secure log directory
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function create_log_directory(): void {
		$upload_dir = wp_upload_dir();
		$log_dir    = $upload_dir['basedir'] . '/wp-dev-toolkit/logs';

		if ( ! file_exists( $log_dir ) ) {
			wp_mkdir_p( $log_dir );

			// Create .htaccess file to prevent direct access to logs
			$htaccess_content = "# Prevent direct access to log files\n";
			$htaccess_content .= "<Files \"*.log\">\n";
			$htaccess_content .= "  Require all denied\n";
			$htaccess_content .= "</Files>\n";

			file_put_contents( $log_dir . '/.htaccess', $htaccess_content );

			// Create index.php to prevent directory browsing
			file_put_contents( $log_dir . '/index.php', "<?php\n// Silence is golden.\n" );
		}
	}
}
