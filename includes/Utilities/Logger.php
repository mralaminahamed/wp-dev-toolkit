<?php
// Create a new file: src/Core/Logger.php

namespace WPDevToolkit\Utilities;

/**
 * Logger Class
 * 
 * Handles logging for the WordPress Development Toolkit
 * 
 * @package WPDevToolkit\Core
 */
class Logger {
	/**
	 * Default log file path
	 *
	 * @var string
	 */
	private static $default_log_file;
	
	/**
	 * Initialize the logger
	 *
	 * @return void
	 */
	public static function init() {
		$upload_dir = wp_upload_dir();
		self::$default_log_file = $upload_dir['basedir'] . '/wp-dev-toolkit/logs/error.log';
		
		// Ensure log directory exists
		$log_dir = dirname(self::$default_log_file);
		if (!file_exists($log_dir)) {
			wp_mkdir_p($log_dir);
		}
	}
	
	/**
	 * Log a message to the WP Dev Toolkit log file
	 *
	 * @param mixed  $message The message to log
	 * @param string $level   The log level (info, warning, error, debug)
	 * @param string $log_file Optional custom log file
	 * 
	 * @return void
	 */
	public static function log( $message, $level = 'info', $log_file = null ) {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}
		
		// Initialize if not already done
		if (!isset(self::$default_log_file)) {
			self::init();
		}

		$log_file = $log_file ?: self::$default_log_file;
		$timestamp = date( 'Y-m-d H:i:s' );
		$formatted_message = is_array( $message ) || is_object( $message ) 
			? print_r( $message, true ) 
			: $message;
		$log_message = "[$timestamp] [" . strtoupper( $level ) . "] $formatted_message" . PHP_EOL;

		error_log( $log_message, 3, $log_file );
	}
	
	/**
	 * Rotate logs if they exceed the size limit
	 *
	 * @param int $max_size Maximum log size in bytes (default 5MB)
	 * 
	 * @return void
	 */
	public static function rotate_logs( $max_size = 5242880 ) {
		// Initialize if not already done
		if (!isset(self::$default_log_file)) {
			self::init();
		}
		
		$log_file = self::$default_log_file;
		
		if ( ! file_exists( $log_file ) ) {
			return;
		}
		
		// If file is larger than max size, rotate it
		if ( filesize( $log_file ) > $max_size ) {
			$log_dir = dirname($log_file);
			$log_name = basename($log_file);
			$timestamp = date('Ymd_His');
			$backup_file = $log_dir . '/' . pathinfo($log_name, PATHINFO_FILENAME) . '_' . $timestamp . '.log';
			
			rename( $log_file, $backup_file );
			file_put_contents( $log_file, 'Log file rotated at ' . date( 'Y-m-d H:i:s' ) . "\n" );
			
			self::log('Log file rotated. Previous log saved as: ' . basename($backup_file), 'info');
			
			// Cleanup old log files
			self::clean_old_logs();
		}
	}
	
	/**
	 * Clean old log files
	 *
	 * @param int $days Number of days to keep logs (default 30)
	 * 
	 * @return void
	 */
	public static function clean_old_logs( $days = 30 ) {
		// Initialize if not already done
		if (!isset(self::$default_log_file)) {
			self::init();
		}
		
		$log_dir = dirname(self::$default_log_file);
		
		if ( ! file_exists( $log_dir ) ) {
			return;
		}
		
		$log_files = glob($log_dir . '/*.log');
		$current_time = time();
		$retention_period = 86400 * $days; // Convert days to seconds
		
		foreach ($log_files as $file) {
			// Skip the current log file
			if ($file === self::$default_log_file) {
				continue;
			}
			
			// If file is older than retention period, delete it
			if ($current_time - filemtime($file) > $retention_period) {
				unlink($file);
				self::log('Deleted old log file: ' . basename($file), 'info');
			}
		}
	}
	
	/**
	 * Get log file content
	 *
	 * @param string $log_file Optional custom log file
	 * @param int $lines Number of lines to retrieve (0 for all)
	 * 
	 * @return string
	 */
	public static function get_log_content($log_file = null, $lines = 0) {
		// Initialize if not already done
		if (!isset(self::$default_log_file)) {
			self::init();
		}
		
		$log_file = $log_file ?: self::$default_log_file;
		
		if (!file_exists($log_file)) {
			return '';
		}
		
		if ($lines > 0) {
			// Get only the last X lines
			$content = '';
			$file = new \SplFileObject($log_file, 'r');
			$file->seek(PHP_INT_MAX); // Seek to end of file
			$total_lines = $file->key(); // Get total line count
			
			$start_line = max(0, $total_lines - $lines);
			$file->seek($start_line);
			
			while (!$file->eof()) {
				$content .= $file->fgets();
			}
			
			return $content;
		}
		
		return file_get_contents($log_file);
	}
}

//// Usage example:
//use WPDevToolkit\Core\Logger;
//use const WPDevToolkit\Core\WP_CONTENT_DIR;
//use const WPDevToolkit\Core\WP_DEBUG;
//
//Logger::log('Development mode enabled');
//Logger::log('An error occurred', 'error');
