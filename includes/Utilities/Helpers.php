<?php
/**
 * Helper functions for WordPress Development Toolkit
 *
 * @package WPDevToolkit\Utilities
 */

namespace WPDevToolkit\Utilities;

use WPDevToolkit\Utilities\Logger;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class for helper functions
 */
class Helpers {
	/**
	 * Log a message to the WP Dev Toolkit error log.
	 *
	 * @param mixed  $message The message to log.
	 * @param string $level   The log level (e.g., 'info', 'warning', 'error').
	 *
	 * @return void
	 */
	public static function log( $message, string $level = 'info' ) {
		Logger::log( $message, $level );
	}

	/**
	 * Format file size for display
	 *
	 * @param int $bytes    File size in bytes
	 * @param int $decimals Number of decimal places
	 *
	 * @return string
	 */
	public static function format_file_size( $bytes, $decimals = 2 ) {
		if ( $bytes <= 0 ) {
			return '0 B';
		}
		
		$size   = array( 'B', 'KB', 'MB', 'GB', 'TB', 'PB' );
		$factor = floor( ( strlen( $bytes ) - 1 ) / 3 );

		return sprintf( "%.{$decimals}f", $bytes / pow( 1024, $factor ) ) . ' ' . $size[ $factor ];
	}

	/**
	 * Get plugin data
	 *
	 * @return array
	 */
	public static function get_plugin_data() {
		if ( ! function_exists( 'get_plugin_data' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		return get_plugin_data( WP_DEV_TOOLKIT_FILE );
	}
	
	/**
	 * Get system information
	 *
	 * @return array
	 */
	public static function get_system_info() {
		global $wpdb;
		
		$plugin_data = self::get_plugin_data();
		
		return array(
			'wordpress' => array(
				'version'       => get_bloginfo( 'version' ),
				'site_url'      => get_site_url(),
				'home_url'      => get_home_url(),
				'is_multisite'  => is_multisite(),
				'debug_mode'    => defined( 'WP_DEBUG' ) && WP_DEBUG,
				'memory_limit'  => WP_MEMORY_LIMIT,
				'table_prefix'  => $wpdb->prefix,
				'active_theme'  => wp_get_theme()->get( 'Name' ),
				'theme_version' => wp_get_theme()->get( 'Version' ),
			),
			'server' => array(
				'php_version'    => phpversion(),
				'mysql_version'  => $wpdb->db_version(),
				'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? '',
				'os'             => PHP_OS,
				'max_execution_time' => ini_get( 'max_execution_time' ),
				'memory_limit'   => ini_get( 'memory_limit' ),
				'upload_max_filesize' => ini_get( 'upload_max_filesize' ),
				'post_max_size'  => ini_get( 'post_max_size' ),
			),
			'plugin' => array(
				'name'           => $plugin_data['Name'],
				'version'        => $plugin_data['Version'],
				'author'         => $plugin_data['Author'],
				'plugin_uri'     => $plugin_data['PluginURI'],
				'text_domain'    => $plugin_data['TextDomain'],
				'domain_path'    => $plugin_data['DomainPath'],
			),
		);
	}
	
	/**
	 * Check if a plugin is active
	 *
	 * @param string $plugin_file Plugin file path relative to plugins directory
	 * 
	 * @return bool
	 */
	public static function is_plugin_active( $plugin_file ) {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			include_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		
		return is_plugin_active( $plugin_file );
	}
	
	/**
	 * Sanitize and validate data based on type
	 *
	 * @param mixed  $data Data to sanitize
	 * @param string $type Type of data (text, email, url, int, float, bool)
	 * 
	 * @return mixed
	 */
	public static function sanitize( $data, $type = 'text' ) {
		switch ( $type ) {
			case 'email':
				return sanitize_email( $data );
			
			case 'url':
				return esc_url_raw( $data );
				
			case 'int':
				return intval( $data );
				
			case 'float':
				return floatval( $data );
				
			case 'bool':
				return (bool) $data;
				
			case 'html':
				return wp_kses_post( $data );
				
			case 'text':
			default:
				return sanitize_text_field( $data );
		}
	}
}

/**
 * Global function for backward compatibility
 *
 * @param mixed  $message The message to log.
 * @param string $level   The log level (e.g., 'info', 'warning', 'error').
 *
 * @return void
 */
function wp_dev_toolkit_log( $message, string $level = 'info' ) {
	Helpers::log( $message, $level );
}

/**
 * Global function to get system information
 * 
 * @return array
 */
function wp_dev_toolkit_system_info() {
	return Helpers::get_system_info();
}
