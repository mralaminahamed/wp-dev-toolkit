<?php
/**
 * Error Logger Tool for WordPress Development Toolkit
 *
 * @package WPDevToolkit\Tools
 * @since   1.0.0
 */

namespace WPDevToolkit\Tools;

use WP_REST_Server;
use WPDevToolkit\Base\ToolBase;
use WPDevToolkit\Core\Logger;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Error Logger Tool
 *
 * Provides comprehensive error logging functionality with automatic
 * log rotation, cleanup, and REST API integration.
 *
 * @package WPDevToolkit\Tools
 * @since   1.0.0
 */
class ErrorLogger extends ToolBase {
	/**
	 * Tool key for configuration
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	public const TOOL_KEY = 'error_logging';
	
	/**
	 * Log file path
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	private string $log_file;

	/**
	 * Constructor
	 *
	 * Initializes the error logger with configuration and sets up log file path.
	 *
	 * @since 1.0.0
	 *
	 * @param \WPDevToolkit\Core\Config $config Configuration instance.
	 */
	public function __construct( \WPDevToolkit\Core\Config $config ) {
		parent::__construct( $config );
		$this->log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
	}

	/**
	 * Clean old logs based on retention policy
	 *
	 * Removes log files that exceed the size limit and rotates current log.
	 * This is a static method to allow external cron job usage.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function clean_old_logs(): void {
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
	 * Sets up error logging functionality and schedules cleanup tasks.
	 * Only initializes if the tool is enabled in configuration.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function init(): void {
		if ( ! $this->is_enabled() ) {
			return;
		}

		add_action( 'init', [ $this, 'setup_error_logging' ] );

		// Schedule log cleanup - using WordPress cron system.
		if ( ! wp_next_scheduled( 'wp_dev_toolkit_clean_logs' ) ) {
			wp_schedule_event( time(), 'daily', 'wp_dev_toolkit_clean_logs' );
		}
		add_action( 'wp_dev_toolkit_clean_logs', [ __CLASS__, 'clean_old_logs' ] );
	}

	/**
	 * Setup error logging
	 *
	 * Configures PHP error reporting and logging based on WordPress debug settings.
	 * Only activates when WP_DEBUG is enabled for security.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function setup_error_logging(): void {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			// Configure PHP error reporting.
			ini_set( 'display_errors', '1' );
			ini_set( 'log_errors', '1' );
			ini_set( 'error_log', $this->log_file );

			// Set custom error handler for enhanced logging.
			set_error_handler( [ $this, 'custom_error_handler' ] );
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
	 * Register REST API routes for the tool
	 *
	 * Registers secure endpoints for error log management with proper
	 * permission checks and nonce validation.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function register_rest_routes(): void {
		register_rest_route(
			'wp-dev-toolkit/v1',
			'/error-log',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_error_log' ],
				'permission_callback' => [ $this, 'check_admin_permissions' ],
				'args'                => [
					'lines' => [
						'default'           => 100,
						'sanitize_callback' => 'absint',
						'validate_callback' => [ $this, 'validate_lines_param' ],
					],
				],
			]
		);

		register_rest_route(
			'wp-dev-toolkit/v1',
			'/error-log',
			[
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => [ $this, 'clear_error_log' ],
				'permission_callback' => [ $this, 'check_admin_permissions' ],
			]
		);
	}

	/**
	 * Get error log content
	 *
	 * Retrieves error log content with security checks and optional line limiting.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 *
	 * @return \WP_REST_Response The REST response containing log data.
	 */
	public function get_error_log( $request ) {
		$lines = $request->get_param( 'lines' );
		$log_content = '';

		if ( file_exists( $this->log_file ) && is_readable( $this->log_file ) ) {
			// Security: Limit the amount of data that can be read.
			$max_size = 1024 * 1024; // 1MB limit.
			$file_size = filesize( $this->log_file );
			
			if ( $file_size > $max_size ) {
				// Read only the last portion of large files.
				$handle = fopen( $this->log_file, 'r' );
				if ( $handle ) {
					fseek( $handle, -$max_size, SEEK_END );
					$log_content = fread( $handle, $max_size );
					fclose( $handle );
				}
			} else {
				$log_content = file_get_contents( $this->log_file );
			}

			// If lines parameter is specified, limit output.
			if ( $lines && $lines > 0 ) {
				$log_lines = explode( "\n", $log_content );
				$log_lines = array_slice( $log_lines, -$lines );
				$log_content = implode( "\n", $log_lines );
			}

			// Sanitize log content to prevent XSS.
			$log_content = esc_html( $log_content );
		}

		return rest_ensure_response(
			[
				'log_content' => $log_content,
				'log_file'    => basename( $this->log_file ), // Don't expose full path.
				'file_size'   => file_exists( $this->log_file ) ? filesize( $this->log_file ) : 0,
				'lines'       => $lines,
			]
		);
	}

	/**
	 * Clear error log
	 *
	 * Securely clears the error log file and logs the action.
	 *
	 * @since 1.0.0
	 *
	 * @return \WP_REST_Response The REST response confirming the action.
	 */
	public function clear_error_log() {
		// Verify nonce for security.
		if ( ! wp_verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'wp_rest' ) ) {
			return rest_ensure_response(
				[
					'success' => false,
					'message' => __( 'Security check failed', 'wp-dev-toolkit' ),
				]
			);
		}

		if ( file_exists( $this->log_file ) && is_writable( $this->log_file ) ) {
			// Clear the log file securely.
			$cleared_message = sprintf(
				/* translators: %s: Date and time when log was cleared */
				__( 'Log cleared at %s by user ID %d', 'wp-dev-toolkit' ),
				current_time( 'Y-m-d H:i:s' ),
				get_current_user_id()
			);
			
			file_put_contents( $this->log_file, $cleared_message . "\n" );
			Logger::log( 'Error log cleared manually by user ID: ' . get_current_user_id(), 'info' );
			
			return rest_ensure_response(
				[
					'success' => true,
					'message' => __( 'Error log cleared successfully', 'wp-dev-toolkit' ),
				]
			);
		}

		return rest_ensure_response(
			[
				'success' => false,
				'message' => __( 'Unable to clear error log', 'wp-dev-toolkit' ),
			]
		);
	}

	/**
	 * Validate lines parameter for REST API
	 *
	 * Ensures the lines parameter is within acceptable range.
	 *
	 * @since 1.0.0
	 *
	 * @param int $param The parameter value.
	 *
	 * @return bool True if valid, false otherwise.
	 */
	public function validate_lines_param( int $param ): bool {
		return $param > 0 && $param <= 10000; // Maximum 10,000 lines.
	}
}
