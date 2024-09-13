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
 * @return void
 */
function wp_dev_toolkit_init() {
	$config = new WPDevToolkit\Core\Config();
	$tool_factory = new WPDevToolkit\ToolFactory();
	$plugin = new WPDevToolkit\Plugin( $config, $tool_factory );
	$plugin->init();

	// Load text domain for internationalization
	load_plugin_textdomain( 'wp-dev-toolkit', false, dirname( WP_DEV_TOOLKIT_PLUGIN_BASENAME ) . '/languages/' );
}

// Activation hook
register_activation_hook( __FILE__, 'wp_dev_toolkit_activate' );

/**
 * Plugin activation callback
 *
 * @return void
 */
function wp_dev_toolkit_activate() {
	// Perform any necessary setup on activation
	$config = new WPDevToolkit\Core\Config();
	$config->set_default_options();

	// Flush rewrite rules
	flush_rewrite_rules();
}

// Deactivation hook
register_deactivation_hook( __FILE__, 'wp_dev_toolkit_deactivate' );

/**
 * Plugin deactivation callback
 *
 * @return void
 */
function wp_dev_toolkit_deactivate() {
	// Perform any necessary cleanup on deactivation
	// For example, you might want to remove scheduled events
	wp_clear_scheduled_hook( 'wp_dev_toolkit_daily_event' );

	// Flush rewrite rules
	flush_rewrite_rules();
}

// Uninstall hook
register_uninstall_hook( __FILE__, 'wp_dev_toolkit_uninstall' );

/**
 * Plugin uninstall callback
 *
 * @return void
 */
function wp_dev_toolkit_uninstall() {
	// Perform any necessary cleanup on uninstall
	// This function should be used to remove any options, database tables, etc.
	delete_option( 'wp_dev_toolkit_config' );
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

// Schedule custom cron job
if ( ! wp_next_scheduled( 'wp_dev_toolkit_weekly_event' ) ) {
	wp_schedule_event( time(), 'weekly', 'wp_dev_toolkit_weekly_event' );
}

/**
 * Custom cron job callback
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

// Include any global helper functions
require_once WP_DEV_TOOLKIT_PLUGIN_DIR . 'includes/helpers.php';
