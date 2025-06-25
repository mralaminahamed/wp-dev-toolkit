<?php
namespace WPDevToolkit\Core;

/**
 * Configuration Class
 * 
 * Manages plugin configuration settings
 * 
 * @package WPDevToolkit\Core
 */
class Config {
	/**
	 * Configuration data
	 *
	 * @var array
	 */
	private $config = array();
	
	/**
	 * Option name in WordPress database
	 *
	 * @var string
	 */
	private $option_name = 'wp_dev_toolkit_config';

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->load_config();
	}

	/**
	 * Load configuration from database
	 *
	 * @return void
	 */
	private function load_config() {
		$saved_config = get_option( $this->option_name, array() );
		$this->config = array_merge( $this->get_default_config(), $saved_config );
	}

	/**
	 * Get a configuration value
	 *
	 * @param string $key     Configuration key
	 * @param mixed  $default Default value if key doesn't exist
	 *
	 * @return mixed
	 */
	public function get( $key, $default = null ) {
		return isset( $this->config[ $key ] ) ? $this->config[ $key ] : $default;
	}

	/**
	 * Set a configuration value
	 *
	 * @param string $key   Configuration key
	 * @param mixed  $value Configuration value
	 *
	 * @return void
	 */
	public function set( $key, $value ) {
		$this->config[ $key ] = $value;
		$this->save_config();
	}

	/**
	 * Get all configuration values
	 *
	 * @return array
	 */
	public function get_all() {
		return $this->config;
	}

	/**
	 * Update multiple configuration values
	 *
	 * @param array $new_config New configuration values
	 *
	 * @return void
	 */
	public function update( $new_config ) {
		if ( ! is_array( $new_config ) ) {
			return;
		}
		
		$this->config = array_merge( $this->config, $new_config );
		$this->save_config();
	}

	/**
	 * Save configuration to database
	 *
	 * @return void
	 */
	private function save_config() {
		update_option( $this->option_name, $this->config );
	}

	/**
	 * Set default options
	 *
	 * @return void
	 */
	public function set_default_options() {
		$this->config = $this->get_default_config();
		$this->save_config();
	}

	/**
	 * Reset configuration to defaults
	 *
	 * @return void
	 */
	public function reset_to_defaults() {
		$this->set_default_options();
	}

	/**
	 * Get default configuration values
	 *
	 * @return array
	 */
	private function get_default_config() {
		// Get WordPress upload directory information
		$upload_dir = wp_upload_dir();
		
		return array(
			'dev_mode'              => false,
			'error_logging'         => true,
			'query_monitoring'      => true,
			'hook_inspection'       => true,
			'debug_bar_integration' => true,
			'log_path'              => $upload_dir['basedir'] . '/wp-dev-toolkit/logs/error.log',
			'asset_path'            => WP_DEV_TOOLKIT_PLUGIN_DIR . 'assets',
			'asset_url'             => WP_DEV_TOOLKIT_PLUGIN_URL . 'assets',
			'build_path'            => WP_DEV_TOOLKIT_PLUGIN_DIR . 'build',
			'build_url'             => WP_DEV_TOOLKIT_PLUGIN_URL . 'build',
			'log_retention_days'    => 30,
			'allowed_ip_addresses'  => array(),
			'excluded_hooks'        => array(),
			'excluded_queries'      => array(),
		);
	}

	/**
	 * Validate configuration
	 *
	 * @return void
	 */
	public function validate_config() {
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
	 * @param string $asset_path Asset path relative to the assets directory
	 * @param bool   $is_build   Whether this is a build asset
	 *
	 * @return string
	 */
	public function get_asset_url( $asset_path, $is_build = false ) {
		if ( $is_build ) {
			return $this->get( 'build_url' ) . '/' . ltrim( $asset_path, '/' );
		}
		
		return $this->get( 'asset_url' ) . '/' . ltrim( $asset_path, '/' );
	}
	
	/**
	 * Get asset path
	 *
	 * @param string $asset_path Asset path relative to the assets directory
	 * @param bool   $is_build   Whether this is a build asset
	 *
	 * @return string
	 */
	public function get_asset_path( $asset_path, $is_build = false ) {
		if ( $is_build ) {
			return $this->get( 'build_path' ) . '/' . ltrim( $asset_path, '/' );
		}
		
		return $this->get( 'asset_path' ) . '/' . ltrim( $asset_path, '/' );
	}
}
