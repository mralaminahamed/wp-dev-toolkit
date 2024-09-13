<?php
/**
 * Helper functions for WordPress Development Toolkit
 *
 * @package WPDevToolkit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Log a message to the WP Dev Toolkit error log.
 *
 * @param mixed $message The message to log.
 * @param string $level The log level (e.g., 'info', 'warning', 'error').
 */
function wp_dev_toolkit_log( $message, string $level = 'info' ) {
	if ( ! function_exists( 'write_log' ) ) {
		return;
	}

	$config = new WPDevToolkit\Core\Config();
	if ( ! $config->get( 'error_logging', true ) ) {
		return;
	}

	$log_message = '[' . strtoupper( $level ) . '] ' . ( is_array( $message ) || is_object( $message ) ? print_r( $message, true ) : $message );
	write_log( $log_message );
}

/**
 * Check if the current request is from an allowed IP address.
 *
 * @return boolean True if the IP is allowed, false otherwise.
 */
function wp_dev_toolkit_is_ip_allowed(): bool {
	$config      = new WPDevToolkit\Core\Config();
	$allowed_ips = $config->get( 'allowed_ip_addresses', array() );

	if ( empty( $allowed_ips ) ) {
		return true; // If no IPs are specified, allow all.
	}

	$user_ip = wp_dev_toolkit_get_user_ip();

	return in_array( $user_ip, $allowed_ips, true );
}

/**
 * Get the user's IP address.
 *
 * @return string The user's IP address.
 */
function wp_dev_toolkit_get_user_ip(): string {
	if ( ! empty( $_SERVER['HTTP_CLIENT_IP'] ) ) {
		$ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_CLIENT_IP'] ) );
	} elseif ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
		$ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) );
	} else {
		$ip = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) );
	}

	return $ip;
}

/**
 * Check if the plugin is in development mode.
 *
 * @return boolean True if in development mode, false otherwise.
 */
function wp_dev_toolkit_is_dev_mode(): bool {
	$config = new WPDevToolkit\Core\Config();

	return $config->get( 'dev_mode', false );
}

/**
 * Get a formatted stack trace.
 *
 * @return string Formatted stack trace.
 */
function wp_dev_toolkit_get_stack_trace(): string {
	$stack_trace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS );
	$output      = "Stack Trace:\n";

	foreach ( $stack_trace as $index => $trace ) {
		$file     = $trace['file'] ?? 'unknown file';
		$line     = $trace['line'] ?? 'unknown line';
		$function = $trace['function'] ?? 'unknown function';

		$output .= "#$index $file($line): $function()\n";
	}

	return $output;
}

/**
 * Measure the execution time of a function.
 *
 * @param callable $func The function to measure.
 *
 * @return array An array containing the result and execution time.
 */
function wp_dev_toolkit_measure_execution_time( callable $func ): array {
	$start_time = microtime( true );
	$result     = $func();
	$end_time   = microtime( true );

	$execution_time = $end_time - $start_time;

	return array(
		'result'         => $result,
		'execution_time' => $execution_time,
	);
}

/**
 * Debug variable with formatting.
 *
 * @param mixed $var The variable to debug.
 * @param bool $die Whether to die after outputting. Default is false.
 */
function wp_dev_toolkit_debug( $var, bool $die = false ) {
	if ( ! wp_dev_toolkit_is_dev_mode() ) {
		return;
	}

	echo '<pre>';
	var_dump( $var );
	echo '</pre>';

	if ( $die ) {
		die();
	}
}

/**
 * Check if a specific tool is enabled.
 *
 * @param string $tool_name The name of the tool to check.
 *
 * @return boolean True if the tool is enabled, false otherwise.
 */
function wp_dev_toolkit_is_tool_enabled( string $tool_name ): bool {
	$config = new WPDevToolkit\Core\Config();

	return $config->get( $tool_name, false );
}

/**
 * Safely get a value from an array.
 *
 * @param array $array The array to search.
 * @param string $key The key to look for.
 * @param mixed $default The default value to return if the key is not found.
 *
 * @return mixed The value if found, or the default.
 */
function wp_dev_toolkit_array_get( array $array, string $key, $default = null ) {
	return $array[ $key ] ?? $default;
}

/**
 * Truncate a string to a specified length.
 *
 * @param string $string The string to truncate.
 * @param integer $length The maximum length of the string.
 * @param string $append The string to append if truncated. Default is '...'.
 *
 * @return string The truncated string.
 */
function wp_dev_toolkit_truncate( string $string, int $length, string $append = '...' ): string {
	if ( strlen( $string ) > $length ) {
		$string = substr( $string, 0, $length - strlen( $append ) ) . $append;
	}

	return $string;
}