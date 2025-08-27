<?php
/**
 * Plugin Name: WordPress Development Toolkit
 * Plugin URI: https://github.com/mralaminahamed/wp-dev-toolkit
 * Description: A comprehensive toolkit for WordPress plugin development
 * Version: 1.0.0
 * Author: Mr Alamin Ahamed
 * Author URI: https://mralaminahamed.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wp-dev-toolkit
 * Domain Path: /languages
 *
 * @package WPDevToolkit
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

// Define plugin constants
define( 'WP_DEV_TOOLKIT_VERSION', '1.0.0' );
define( 'WP_DEV_TOOLKIT_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WP_DEV_TOOLKIT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WP_DEV_TOOLKIT_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'WP_DEV_TOOLKIT_ASSETS_URL', WP_DEV_TOOLKIT_PLUGIN_URL . 'assets/' );
define( 'WP_DEV_TOOLKIT_ASSETS_DIR', WP_DEV_TOOLKIT_PLUGIN_DIR . 'assets/' );

// Ensure the assets directories exist
if ( ! file_exists( WP_DEV_TOOLKIT_ASSETS_DIR ) ) {
	mkdir( WP_DEV_TOOLKIT_ASSETS_DIR, 0755, true );
}

if ( ! file_exists( WP_DEV_TOOLKIT_ASSETS_DIR . 'css/' ) ) {
	mkdir( WP_DEV_TOOLKIT_ASSETS_DIR . 'css/', 0755, true );
}

if ( ! file_exists( WP_DEV_TOOLKIT_ASSETS_DIR . 'images/' ) ) {
	mkdir( WP_DEV_TOOLKIT_ASSETS_DIR . 'images/', 0755, true );
}

// Composer autoloader
if ( file_exists( WP_DEV_TOOLKIT_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
	require_once WP_DEV_TOOLKIT_PLUGIN_DIR . 'vendor/autoload.php';
} else {
	wp_die( esc_html__( 'Please run composer install to download the necessary dependencies', 'wp-dev-toolkit' ) );
}

// Initialize the plugin
add_action( 'plugins_loaded', 'wp_dev_toolkit_init' );

/**
 * Initialize the plugin
 *
 * Bootstrap function that initializes all plugin components with proper
 * error handling and security checks.
 *
 * @since 1.0.0
 *
 * @return void
 */
function wp_dev_toolkit_init(): void {
	try {
		// Initialize logger first for error tracking.
		WPDevToolkit\Core\Logger::init();

		// Create core components.
		$config       = new WPDevToolkit\Core\Config();
		$tool_factory = new WPDevToolkit\Tools\Factory( $config );
		$plugin       = new WPDevToolkit\Core\Plugin( $config, $tool_factory );
		
		// Initialize plugin functionality.
		$plugin->init();

		// Load text domain for internationalization.
		load_plugin_textdomain(
			'wp-dev-toolkit',
			false,
			dirname( WP_DEV_TOOLKIT_PLUGIN_BASENAME ) . '/languages/'
		);

		// Plugin initialized successfully.
		do_action( 'wp_dev_toolkit_initialized', $plugin );
		
	} catch ( Exception $e ) {
		// Log initialization error.
		error_log(
			sprintf(
				'WP Dev Toolkit initialization failed: %s in %s:%d',
				$e->getMessage(),
				$e->getFile(),
				$e->getLine()
			)
		);
		
		// Show admin notice for initialization failure.
		add_action( 'admin_notices', 'wp_dev_toolkit_init_error_notice' );
	}
}

// Activation hook
register_activation_hook( __FILE__, 'wp_dev_toolkit_activate' );

/**
 * Plugin activation callback
 *
 * Performs initial setup including directory creation, security hardening,
 * and default configuration initialization.
 *
 * @since 1.0.0
 *
 * @return void
 */
function wp_dev_toolkit_activate(): void {
	// Verify minimum requirements.
	if ( ! wp_dev_toolkit_check_requirements() ) {
		deactivate_plugins( WP_DEV_TOOLKIT_PLUGIN_BASENAME );
		return;
	}

	try {
		// Initialize configuration with default options.
		$config = new WPDevToolkit\Core\Config();
		$config->set_default_options();

		// Create secure log directory.
		wp_dev_toolkit_create_log_directory();

		// Set up security measures.
		wp_dev_toolkit_setup_security();

		// Clear any existing rewrite rules.
		flush_rewrite_rules();

		// Log successful activation.
		error_log( 'WP Dev Toolkit activated successfully' );

		// Trigger activation hook for extensions.
		do_action( 'wp_dev_toolkit_activated' );
		
	} catch ( Exception $e ) {
		// Log activation error.
		error_log(
			sprintf(
				'WP Dev Toolkit activation failed: %s',
				$e->getMessage()
			)
		);
		
		// Deactivate plugin on fatal error.
		deactivate_plugins( WP_DEV_TOOLKIT_PLUGIN_BASENAME );
	}
}

// Deactivation hook
register_deactivation_hook( __FILE__, 'wp_dev_toolkit_deactivate' );

/**
 * Plugin deactivation callback
 *
 * Performs cleanup tasks when plugin is deactivated, including
 * clearing scheduled events and flushing rewrite rules.
 *
 * @since 1.0.0
 *
 * @return void
 */
function wp_dev_toolkit_deactivate(): void {
	// Clear all scheduled events.
	wp_clear_scheduled_hook( 'wp_dev_toolkit_daily_event' );
	wp_clear_scheduled_hook( 'wp_dev_toolkit_weekly_event' );
	wp_clear_scheduled_hook( 'wp_dev_toolkit_clean_logs' );

	// Flush rewrite rules to clean up.
	flush_rewrite_rules();

	// Log deactivation.
	error_log( 'WP Dev Toolkit deactivated' );

	// Trigger deactivation hook for extensions.
	do_action( 'wp_dev_toolkit_deactivated' );
}

// Uninstall hook
register_uninstall_hook( __FILE__, 'wp_dev_toolkit_uninstall' );

/**
 * Plugin uninstall callback
 *
 * Performs complete cleanup when plugin is uninstalled, including
 * removing all options, log files, and temporary data.
 *
 * @since 1.0.0
 *
 * @return void
 */
function wp_dev_toolkit_uninstall(): void {
	// Security check - only allow uninstall from admin.
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	// Remove all plugin options.
	delete_option( 'wp_dev_toolkit_config' );
	delete_option( 'wp_dev_toolkit_terminal_history' );
	delete_transient( 'wp_dev_toolkit_queries' );
	delete_transient( 'wp_dev_toolkit_hooks' );

	// Clear scheduled events.
	wp_clear_scheduled_hook( 'wp_dev_toolkit_daily_event' );
	wp_clear_scheduled_hook( 'wp_dev_toolkit_weekly_event' );
	wp_clear_scheduled_hook( 'wp_dev_toolkit_clean_logs' );

	// Remove log files and directory (optional - ask user preference).
	if ( apply_filters( 'wp_dev_toolkit_remove_logs_on_uninstall', true ) ) {
		wp_dev_toolkit_remove_log_directory();
	}

	// Log uninstall action.
	error_log( 'WP Dev Toolkit uninstalled and cleaned up' );

	// Trigger uninstall hook for extensions.
	do_action( 'wp_dev_toolkit_uninstalled' );
}

/**
 * Add settings link on plugin page
 *
 * @param array $links Array of plugin action links.
 *
 * @return array Modified array of plugin action links.
 */
function wp_dev_toolkit_settings_link( array $links ): array {
	$settings_link = '<a href="' . admin_url( 'admin.php?page=wp-dev-toolkit' ) . '">' . __( 'Settings', 'wp-dev-toolkit' ) . '</a>';
	array_unshift( $links, $settings_link );
	return $links;
}
add_filter( 'plugin_action_links_' . WP_DEV_TOOLKIT_PLUGIN_BASENAME, 'wp_dev_toolkit_settings_link' );

/**
 * Add custom cron schedule
 *
 * @param array $schedules Array of WordPress cron schedules.
 *
 * @return array Modified array of WordPress cron schedules.
 */
function wp_dev_toolkit_cron_schedules( array $schedules ): array {
	$schedules['weekly'] = array(
		'interval' => 604800,
		'display'  => __( 'Once Weekly', 'wp-dev-toolkit' ),
	);
	return $schedules;
}
add_filter( 'cron_schedules', 'wp_dev_toolkit_cron_schedules' );

// Schedule custom cron jobs
function wp_dev_toolkit_setup_cron_jobs() {
	if ( ! wp_next_scheduled( 'wp_dev_toolkit_daily_event' ) ) {
		wp_schedule_event( time(), 'daily', 'wp_dev_toolkit_daily_event' );
	}
	
	if ( ! wp_next_scheduled( 'wp_dev_toolkit_weekly_event' ) ) {
		wp_schedule_event( time(), 'weekly', 'wp_dev_toolkit_weekly_event' );
	}
}
add_action( 'wp', 'wp_dev_toolkit_setup_cron_jobs' );

/**
 * Daily cron job callback
 *
 * @return void
 */
function wp_dev_toolkit_do_daily_event() {
	// Perform daily tasks here
	// For example, rotate logs
	WPDevToolkit\Core\Logger::rotate_logs();
}
add_action( 'wp_dev_toolkit_daily_event', 'wp_dev_toolkit_do_daily_event' );

/**
 * Weekly cron job callback
 *
 * @return void
 */
function wp_dev_toolkit_do_weekly_event() {
	// Perform weekly tasks here
	// For example, you might want to clean up old logs
	WPDevToolkit\Tools\ErrorLogger::clean_old_logs();
}
add_action( 'wp_dev_toolkit_weekly_event', 'wp_dev_toolkit_do_weekly_event' );


/**
 * Add debug information to WordPress debug bar
 *
 * @param array $panels Array of Debug Bar panels.
 * @return array Modified array of Debug Bar panels.
 */
function wp_dev_toolkit_debug_bar_panels( $panels ) {
    if ( ! class_exists( 'WPDevToolkit\DebugBar\DevToolkitPanel' ) ) {
        return $panels;
    }
    $panels[] = new WPDevToolkit\DebugBar\DevToolkitPanel();
    return $panels;
}
add_filter( 'debug_bar_panels', 'wp_dev_toolkit_debug_bar_panels' );

// Include global helper functions.
require_once WP_DEV_TOOLKIT_PLUGIN_DIR . 'includes/Utilities/Helpers.php';

/**
 * Check minimum requirements for the plugin
 *
 * @since 1.0.0
 *
 * @return bool True if requirements are met, false otherwise.
 */
function wp_dev_toolkit_check_requirements(): bool {
	global $wp_version;

	// Check WordPress version.
	if ( version_compare( $wp_version, '5.8', '<' ) ) {
		add_action( 'admin_notices', function() {
			echo '<div class="error"><p>' .
				sprintf(
					/* translators: %s: Required WordPress version */
					esc_html__( 'WP Dev Toolkit requires WordPress %s or higher.', 'wp-dev-toolkit' ),
					'5.8'
				) .
				'</p></div>';
		} );
		return false;
	}

	// Check PHP version.
	if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
		add_action( 'admin_notices', function() {
			echo '<div class="error"><p>' .
				sprintf(
					/* translators: %s: Required PHP version */
					esc_html__( 'WP Dev Toolkit requires PHP %s or higher. You are running %s.', 'wp-dev-toolkit' ),
					'7.4',
					PHP_VERSION
				) .
				'</p></div>';
		} );
		return false;
	}

	return true;
}

/**
 * Create secure log directory
 *
 * @since 1.0.0
 *
 * @return void
 */
function wp_dev_toolkit_create_log_directory(): void {
	$upload_dir = wp_upload_dir();
	$log_dir    = $upload_dir['basedir'] . '/wp-dev-toolkit/logs';

	if ( ! file_exists( $log_dir ) ) {
		wp_mkdir_p( $log_dir );

		// Create .htaccess file to prevent direct access to logs.
		$htaccess_content = "# Prevent direct access to log files\n";
		$htaccess_content .= "<Files \"*.log\">\n";
		$htaccess_content .= "  Require all denied\n";
		$htaccess_content .= "</Files>\n";
		$htaccess_content .= "<Files \".htaccess\">\n";
		$htaccess_content .= "  Require all denied\n";
		$htaccess_content .= "</Files>\n";
		
		file_put_contents( $log_dir . '/.htaccess', $htaccess_content );

		// Create index.php to prevent directory browsing.
		file_put_contents( $log_dir . '/index.php', "<?php\n// Silence is golden.\n" );
	}
}

/**
 * Remove log directory and contents
 *
 * @since 1.0.0
 *
 * @return void
 */
function wp_dev_toolkit_remove_log_directory(): void {
	$upload_dir = wp_upload_dir();
	$log_dir    = $upload_dir['basedir'] . '/wp-dev-toolkit/logs';

	if ( file_exists( $log_dir ) ) {
		// Remove all log files.
		$files = glob( $log_dir . '/*.log' );
		foreach ( $files as $file ) {
			if ( is_file( $file ) ) {
				unlink( $file );
			}
		}

		// Remove security files.
		$security_files = [ '.htaccess', 'index.php' ];
		foreach ( $security_files as $file ) {
			$file_path = $log_dir . '/' . $file;
			if ( file_exists( $file_path ) ) {
				unlink( $file_path );
			}
		}

		// Remove directory if empty.
		if ( is_dir( $log_dir ) ) {
			rmdir( $log_dir );
		}
	}
}

/**
 * Setup additional security measures
 *
 * @since 1.0.0
 *
 * @return void
 */
function wp_dev_toolkit_setup_security(): void {
	// Set secure default permissions for created files.
	umask( 0022 );
	
	// Additional security headers can be added here if needed.
}

/**
 * Display initialization error notice
 *
 * @since 1.0.0
 *
 * @return void
 */
function wp_dev_toolkit_init_error_notice(): void {
	echo '<div class="error"><p>' .
		esc_html__( 'WP Dev Toolkit failed to initialize. Please check error logs for details.', 'wp-dev-toolkit' ) .
		'</p></div>';
}
