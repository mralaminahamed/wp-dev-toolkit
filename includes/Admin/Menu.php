<?php
namespace WPDevToolkit\Admin;

use WPDevToolkit\Core\Plugin;

/**
 * Admin Menu Handler
 *
 * Handles the admin menu registration and assets loading
 *
 * @package WPDevToolkit\Admin
 */
class Menu {
	/**
	 * Plugin instance
	 *
	 * @var Plugin
	 */
	private $plugin;

	/**
	 * Constructor
	 *
	 * @param Plugin $plugin Plugin instance
	 */
	public function __construct( Plugin $plugin ) {
		$this->plugin = $plugin;
	}

	/**
	 * Initialize the menu
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Add admin menu
	 *
	 * @return void
	 */
	public function add_admin_menu() {
		add_menu_page(
			__( 'Dev Toolkit', 'wp-dev-toolkit' ),
			__( 'Dev Toolkit', 'wp-dev-toolkit' ),
			'manage_options',
			'wp-dev-toolkit',
			array( $this, 'render_admin_page' ),
			'dashicons-admin-tools',
			100
		);
	}

	/**
	 * Render the admin page
	 *
	 * @return void
	 */
	public function render_admin_page() {
		echo '<div id="wp-dev-toolkit-app"></div>';
	}

	/**
	 * Enqueue admin assets
	 *
	 * @param string $hook Current admin page hook
	 *
	 * @return void
	 */
	public function enqueue_admin_assets( $hook ): void {
		if ( 'toplevel_page_wp-dev-toolkit' !== $hook ) {
			return;
		}

		$asset_file = WP_DEV_TOOLKIT_PLUGIN_DIR . 'build/index.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return; // Asset file not found, skip enqueueing
		}

		$asset        = include $asset_file;
		$dependencies = $asset['dependencies'] ?? array();
		$version      = $asset['version'] ?? WP_DEV_TOOLKIT_VERSION;

		wp_enqueue_script(
			'wp-dev-toolkit-app',
			WP_DEV_TOOLKIT_PLUGIN_URL . 'build/index.js',
			$dependencies,
			$version,
			true
		);

		wp_enqueue_style(
			'wp-dev-toolkit-styles',
			WP_DEV_TOOLKIT_PLUGIN_URL . 'build/index.css',
			array( 'wp-components' ),
			$version
		);

		// Enhanced global configuration object
		$log_path          = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
		$log_path_relative = str_replace( ABSPATH, '', $log_path );

		$debug_mode = defined( 'WP_DEBUG' ) && WP_DEBUG;

		wp_localize_script(
			'wp-dev-toolkit-app',
			'wpDevToolkit',
			array(
				'nonce'      => wp_create_nonce( 'wp_rest' ),
				'apiUrl'     => rest_url( 'wp-dev-toolkit/v1' ),
				'version'    => WP_DEV_TOOLKIT_VERSION,
				'logPath'    => $log_path_relative,
				'debugMode'  => $debug_mode,
				'wpVersion'  => get_bloginfo( 'version' ),
				'phpVersion' => phpversion(),
			)
		);
	}
}
