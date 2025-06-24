<?php
/**
 * Helper functions for WordPress Development Toolkit
 *
 * @package WPDevToolkit\Utilities
 */

namespace WPDevToolkit\Utilities;

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
        if ( ! function_exists( 'write_log' ) ) {
            return;
        }

        $config = new \WPDevToolkit\Core\Config();
        if ( ! $config->get( 'error_logging', true ) ) {
            return;
        }

        $log_message = '[' . strtoupper( $level ) . '] ' . ( is_array( $message ) || is_object( $message ) ? print_r( $message, true ) : $message );
        write_log( $log_message );
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
        $size = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        $factor = floor((strlen($bytes) - 1) / 3);

        return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . ' ' . $size[$factor];
    }

    /**
     * Get plugin data
     *
     * @return array
     */
    public static function get_plugin_data() {
        if (!function_exists('get_plugin_data')) {
            require_once(ABSPATH . 'wp-admin/includes/plugin.php');
        }

        return get_plugin_data(WP_DEV_TOOLKIT_PLUGIN_DIR . 'wp-dev-toolkit.php');
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
    Helpers::log($message, $level);
}
