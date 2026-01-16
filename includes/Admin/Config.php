<?php
/**
 * Configuration Class for WordPress Development Toolkit
 *
 * @package WPDevToolkit\Admin
 * @since   1.0.0
 */

namespace WPDevToolkit\Admin;

// Prevent direct access.

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Configuration Class
 *
 * Manages all plugin configuration settings with WordPress integration.
 * Handles loading, saving, validation, and default values.
 *
 * @package WPDevToolkit\Core
 * @since   1.0.0
 */
class Config {
	/**
	 * Configuration data
	 *
	 * @since 1.0.0
	 *
	 * @var array<string, mixed>
	 */
	private array $config = [];

	/**
	 * Option name in WordPress database
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	private string $option_name = 'wp_dev_toolkit_config';

	/**
	 * Constructor
	 *
	 * Initializes the configuration by loading settings from the database.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		$this->load_config();
	}

	/**
	 * Load configuration from database
	 *
	 * Merges saved configuration with defaults to ensure all required
	 * settings are available.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private function load_config(): void {
		$saved_config = get_option( $this->option_name, [] );
		$this->config = array_merge( $this->get_default_config(), $saved_config );
	}

	/**
	 * Get a configuration value
	 *
	 * Retrieves a specific configuration value by key, with fallback to default.
	 *
	 * @since 1.0.0
	 *
	 * @param string $key     Configuration key to retrieve.
	 * @param mixed  $default Default value if key doesn't exist.
	 *
	 * @return mixed The configuration value or default.
	 */
	public function get( string $key, $default = null ) {
		return $this->config[ $key ] ?? $default;
	}

	/**
	 * Set a configuration value
	 *
	 * Updates a specific configuration value and saves to database.
	 *
	 * @since 1.0.0
	 *
	 * @param string $key   Configuration key to set.
	 * @param mixed  $value Configuration value to store.
	 *
	 * @return void
	 */
	public function set( string $key, $value ): void {
		$this->config[ $key ] = $value;
		$this->save_config();
	}

	/**
	 * Get all configuration values
	 *
	 * Returns the complete configuration array.
	 *
	 * @since 1.0.0
	 *
	 * @return array<string, mixed> The complete configuration array.
	 */
	public function get_all(): array {
		return $this->config;
	}

	/**
	 * Update multiple configuration values
	 *
	 * Merges new configuration values with existing ones and saves to database.
	 *
	 * @since 1.0.0
	 *
	 * @param array<string, mixed> $new_config New configuration values to merge.
	 *
	 * @return void
	 */
	public function update( array $new_config ): void {
		// Validate input data before merging.
		$sanitized_config = $this->sanitize_config_data( $new_config );

		$this->config = array_merge( $this->config, $sanitized_config );
		$this->save_config();
	}

	/**
	 * Save configuration to database
	 *
	 * Stores the current configuration in WordPress options table.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private function save_config(): void {
		update_option( $this->option_name, $this->config, false );
	}

	/**
	 * Set default options
	 *
	 * Resets configuration to default values and saves to database.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function set_default_options(): void {
		$this->config = $this->get_default_config();
		$this->save_config();
	}

	/**
	 * Reset configuration to defaults
	 *
	 * Alias for set_default_options() for backward compatibility.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function reset_to_defaults(): void {
		$this->set_default_options();
	}

	/**
	 * Get default configuration values
	 *
	 * Defines all default configuration values for the plugin.
	 *
	 * @since 1.0.0
	 *
	 * @return array<string, mixed> Default configuration values.
	 */
	private function get_default_config(): array {
		// Get WordPress upload directory information
		$upload_dir = wp_upload_dir();

		return [
			'dev_mode'              => false,
			'error_logging'         => true,
			'query_monitoring'      => true,
			'hook_inspection'       => true,
			'debug_bar_integration' => true,
			'terminal_enabled'      => false, // Disabled by default for security.
			'log_path'              => $upload_dir['basedir'] . '/wp-dev-toolkit/logs/error.log',
			'asset_path'            => WP_DEV_TOOLKIT_PLUGIN_DIR . 'assets',
			'asset_url'             => WP_DEV_TOOLKIT_PLUGIN_URL . 'assets',
			'build_path'            => WP_DEV_TOOLKIT_PLUGIN_DIR . 'build',
			'build_url'             => WP_DEV_TOOLKIT_PLUGIN_URL . 'build',
			'log_retention_days'    => 30,
			'allowed_ip_addresses'  => [],
			'excluded_hooks'        => [],
			'excluded_queries'      => [],
		];
	}

	/**
	 * Validate configuration
	 *
	 * Ensures all required configuration keys exist with proper values.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function validate_config(): void {
		$default_config = $this->get_default_config();
		foreach ( $default_config as $key => $default_value ) {
			if ( ! isset( $this->config[ $key ] ) ) {
				$this->config[ $key ] = $default_value;
			}
		}
		$this->save_config();
	}

	/**
	 * Get asset URL
	 *
	 * Returns the full URL to an asset file for frontend use.
	 *
	 * @since 1.0.0
	 *
	 * @param string $asset_path Asset path relative to the assets directory.
	 * @param bool   $is_build   Whether this is a build asset.
	 *
	 * @return string The full asset URL.
	 */
	public function get_asset_url( string $asset_path, bool $is_build = false ): string {
		if ( $is_build ) {
			return $this->get( 'build_url' ) . '/' . ltrim( $asset_path, '/' );
		}

		return $this->get( 'asset_url' ) . '/' . ltrim( $asset_path, '/' );
	}

	/**
	 * Get asset path
	 *
	 * Returns the full filesystem path to an asset file.
	 *
	 * @since 1.0.0
	 *
	 * @param string $asset_path Asset path relative to the assets directory.
	 * @param bool   $is_build   Whether this is a build asset.
	 *
	 * @return string The full asset path.
	 */
	public function get_asset_path( string $asset_path, bool $is_build = false ): string {
		if ( $is_build ) {
			return $this->get( 'build_path' ) . '/' . ltrim( $asset_path, '/' );
		}

		return $this->get( 'asset_path' ) . '/' . ltrim( $asset_path, '/' );
	}

	/**
	 * Sanitize configuration data
	 *
	 * Validates and sanitizes configuration values to ensure data integrity.
	 *
	 * @since 1.0.0
	 *
	 * @param array<string, mixed> $config_data Raw configuration data.
	 *
	 * @return array<string, mixed> Sanitized configuration data.
	 */
	private function sanitize_config_data( array $config_data ): array {
		$sanitized = [];
		$defaults  = $this->get_default_config();

		foreach ( $config_data as $key => $value ) {
			// Only allow known configuration keys.
			if ( ! array_key_exists( $key, $defaults ) ) {
				continue;
			}

			// Sanitize based on the default type.
			$default_type = gettype( $defaults[ $key ] );

			switch ( $default_type ) {
				case 'boolean':
					$sanitized[ $key ] = (bool) $value;
					break;

				case 'integer':
					$sanitized[ $key ] = (int) $value;
					break;

				case 'string':
					$sanitized[ $key ] = sanitize_text_field( (string) $value );
					break;

				case 'array':
					$sanitized[ $key ] = is_array( $value ) ? array_map( 'sanitize_text_field', $value ) : [];
					break;

				default:
					// For mixed types, keep the value but ensure it's not malicious.
					$sanitized[ $key ] = is_scalar( $value ) ? $value : '';
					break;
			}
		}

		return $sanitized;
	}
}
