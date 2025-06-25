<?php
namespace WPDevToolkit\Tools;

use WP_REST_Server;
use WPDevToolkit\Base\ToolBase;
use WPDevToolkit\Core\Logger;

/**
 * Error Logger Tool
 *
 * Handles error logging functionality
 *
 * @package WPDevToolkit\Tools
 */
class ErrorLogger extends ToolBase {
	/**
	 * Tool key for configuration
	 */
	const TOOL_KEY = 'error_logging';
	
	/**
	 * Log file path
	 *
	 * @var string
	 */
	private $log_file;

	/**
	 * Constructor
	 *
	 * @param \WPDevToolkit\Core\Config $config Configuration instance
	 */
	public function __construct( \WPDevToolkit\Core\Config $config ) {
		parent::__construct( $config );
		$this->log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
	}

	/**
	 * Clean old logs based on retention policy
	 *
	 * @return void
	 */
	public static function clean_old_logs() {
		$log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
		
		if ( ! file_exists( $log_file ) ) {
			return;
		}
		
		// If file is larger than 5MB, rotate it
		if ( filesize( $log_file ) > 5 * 1024 * 1024 ) { // 5MB limit
			$backup_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log.bak';
			if ( file_exists( $backup_file ) ) {
				unlink( $backup_file );
			}
			rename( $log_file, $backup_file );
			file_put_contents( $log_file, 'Log file rotated at ' . date( 'Y-m-d H:i:s' ) . "\n" );
			
			// Log the rotation
			Logger::log( 'Error log file rotated due to size limit', 'info' );
		}
	}

	/**
	 * Initialize the tool
	 *
	 * @return void
	 */
	public function init() {
		if ( ! $this->is_enabled() ) {
			return;
		}
		
		add_action( 'init', array( $this, 'setup_error_logging' ) );
		
		// Schedule log cleanup
		if ( ! wp_next_scheduled( 'wp_dev_toolkit_clean_logs' ) ) {
			wp_schedule_event( time(), 'daily', 'wp_dev_toolkit_clean_logs' );
		}
		add_action( 'wp_dev_toolkit_clean_logs', array( __CLASS__, 'clean_old_logs' ) );
	}

	/**
	 * Setup error logging
	 *
	 * @return void
	 */
	public function setup_error_logging() {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			ini_set( 'display_errors', 1 );
			ini_set( 'log_errors', 1 );
			ini_set( 'error_log', $this->log_file );
			
			// Set custom error handler
			set_error_handler( array( $this, 'custom_error_handler' ) );
		}
	}
	
	/**
	 * Custom error handler
	 *
	 * @param int    $errno   Error level
	 * @param string $errstr  Error message
	 * @param string $errfile File where error occurred
	 * @param int    $errline Line number where error occurred
	 * 
	 * @return bool
	 */
	public function custom_error_handler( $errno, $errstr, $errfile, $errline ) {
		// Only log errors that match the error_reporting level
		if ( ! ( error_reporting() & $errno ) ) {
			return false;
		}
		
		$error_type = $this->get_error_type( $errno );
		$log_message = "$error_type: $errstr in $errfile on line $errline";
		Logger::log( $log_message, 'error' );
		
		// Let PHP handle the error as well
		return false;
	}
	
	/**
	 * Get error type string from error number
	 *
	 * @param int $errno Error number
	 * 
	 * @return string
	 */
	private function get_error_type( $errno ) {
		switch ( $errno ) {
			case E_ERROR:
				return 'Fatal Error';
			case E_WARNING:
				return 'Warning';
			case E_PARSE:
				return 'Parse Error';
			case E_NOTICE:
				return 'Notice';
			case E_CORE_ERROR:
				return 'Core Error';
			case E_CORE_WARNING:
				return 'Core Warning';
			case E_COMPILE_ERROR:
				return 'Compile Error';
			case E_COMPILE_WARNING:
				return 'Compile Warning';
			case E_USER_ERROR:
				return 'User Error';
			case E_USER_WARNING:
				return 'User Warning';
			case E_USER_NOTICE:
				return 'User Notice';
			case E_STRICT:
				return 'Strict Notice';
			case E_RECOVERABLE_ERROR:
				return 'Recoverable Error';
			case E_DEPRECATED:
				return 'Deprecated';
			case E_USER_DEPRECATED:
				return 'User Deprecated';
			default:
				return 'Unknown Error';
		}
	}

	/**
	 * Register REST routes for the tool
	 *
	 * @return void
	 */
	public function register_rest_routes() {
		register_rest_route(
			'wp-dev-toolkit/v1',
			'/error-log',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_error_log' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
			)
		);

		register_rest_route(
			'wp-dev-toolkit/v1',
			'/error-log',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'clear_error_log' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
			)
		);
	}

	/**
	 * Get error log content
	 *
	 * @return \WP_REST_Response
	 */
	public function get_error_log() {
		$log_content = '';
		
		if ( file_exists( $this->log_file ) ) {
			$log_content = file_get_contents( $this->log_file );
		}
		
		return rest_ensure_response( 
			array( 
				'log_content' => $log_content,
				'log_file' => $this->log_file,
				'file_size' => file_exists( $this->log_file ) ? filesize( $this->log_file ) : 0,
			) 
		);
	}

	/**
	 * Clear error log
	 *
	 * @return \WP_REST_Response
	 */
	public function clear_error_log() {
		if ( file_exists( $this->log_file ) ) {
			file_put_contents( $this->log_file, 'Log cleared at ' . date( 'Y-m-d H:i:s' ) . "\n" );
			Logger::log( 'Error log cleared manually', 'info' );
		}
		
		return rest_ensure_response( array( 'message' => 'Error log cleared' ) );
	}
}
