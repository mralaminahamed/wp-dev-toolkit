<?php
/**
 * WordPress Development Toolkit
 *
 * @package           WPDevToolkit
 * @author            Mr Alamin Ahamed
 * @copyright         2025 Mr Alamin Ahamed
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       WordPress Development Toolkit
 * Plugin URI:        https://github.com/mralaminahamed/wp-dev-toolkit
 * Description:       A comprehensive toolkit for WordPress plugin development with React-based admin interface, debugging tools, and developer utilities.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Mr Alamin Ahamed
 * Author URI:        https://mralaminahamed.com
 * Text Domain:       wp-dev-toolkit
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WP_DEV_TOOLKIT_VERSION', '1.0.0' );
define( 'WP_DEV_TOOLKIT_FILE', __FILE__ );
define( 'WP_DEV_TOOLKIT_URL', plugin_dir_url( __FILE__ ) );
define( 'WP_DEV_TOOLKIT_PATH', plugin_dir_path( __FILE__ ) );

// Load Composer autoloader for PSR-4 classes
if ( ! file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	return;
}

require_once __DIR__ . '/vendor/autoload.php';

/**
 * Get main plugin instance
 *
 * @since 1.0.0
 * @return WP_Dev_Toolkit Plugin instance.
 */
function wp_dev_toolkit(): WP_Dev_Toolkit {
	return WP_Dev_Toolkit::instance();
}

// Initialize plugin
wp_dev_toolkit()->init();