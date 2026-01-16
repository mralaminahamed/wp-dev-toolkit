<?php
namespace WPDevToolkit\Admin;

use WPDevToolkit\Admin\Config;

defined( 'ABSPATH' ) || exit;

/**
 * Assets Manager Class
 *
 * Handles registration and enqueuing of CSS, JS, and other assets
 *
 * @package WPDevToolkit\Admin
 * @since 1.0.0
 */
class Assets {

	/**
	 * Script dependencies
	 *
	 * @var array
	 */
	private $script_deps = array( 'wp-api', 'wp-api-fetch', 'wp-i18n', 'wp-components', 'wp-element' );

	/**
	 * Style dependencies
	 *
	 * @var array
	 */
	private $style_deps = array();

	/**
	 * Controller constructor
	 *
	 * Initializes the assets manager and registers necessary hooks
	 */
	public function __construct() {
		$this->register_hooks();
	}

	/**
	 * Register hooks for assets manager
	 *
	 * @return void
	 */
	protected function register_hooks(): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'register_assets' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_head', array( $this, 'add_admin_inline_css' ) );
	}

	/**
	 * Get configuration instance
	 *
	 * @return Config
	 */
	protected function get_config() {
		return wp_dev_toolkit()->get_config();
	}

	/**
	 * Get asset data from asset file
	 *
	 * @param string $asset_file Path to the asset file
	 * @return array|false Asset data or false if file doesn't exist
	 */
	protected function get_asset_data( $asset_file ) {
		if ( ! file_exists( $asset_file ) ) {
			return false;
		}

		$asset = require $asset_file;

		// Validate asset data structure
		if ( ! is_array( $asset ) || ! isset( $asset['version'] ) || ! isset( $asset['dependencies'] ) ) {
			return false;
		}

		return $asset;
	}

    /**
     * Register all assets
     *
     * @return void
     */
    public function register_assets() {
        $this->register_scripts();
        $this->register_styles();
    }

	/**
	 * Register scripts
	 *
	 * @return void
	 */
	private function register_scripts() {
		$asset_file = WP_DEV_TOOLKIT_PLUGIN_DIR . 'build/app.asset.php';
		$asset_data = $this->get_asset_data( $asset_file );

		// Get version and dependencies from asset file
		if ( $asset_data ) {
			$version = $asset_data['version'];
			$dependencies = $asset_data['dependencies'];
		} else {
			$version = WP_DEV_TOOLKIT_VERSION;
			$dependencies = $this->script_deps;
		}

		// Main app script
		wp_register_script(
			'wp-dev-toolkit-app',
			WP_DEV_TOOLKIT_PLUGIN_URL . 'build/app.js',
			$dependencies,
			$version,
			true
		);

        // Localize script with plugin data
        wp_localize_script(
            'wp-dev-toolkit-app',
            'wpDevToolkit',
            [
                'apiUrl'    => esc_url_raw( rest_url( 'wp-dev-toolkit/v1' ) ),
                'nonce'     => wp_create_nonce( 'wp_rest' ),
                'version'   => WP_DEV_TOOLKIT_VERSION,
                'logPath'   => $this->get_log_path(),
                'debugMode' => (bool) 		$this->get_config()->get( 'debug_mode', false ),
                'pluginUrl' => WP_DEV_TOOLKIT_PLUGIN_URL,
            ]
        );
    }

	/**
	 * Register styles
	 *
	 * @return void
	 */
	private function register_styles() {
		$asset_file = WP_DEV_TOOLKIT_PLUGIN_DIR . 'build/app.asset.php';
		$asset_data = $this->get_asset_data( $asset_file );

		// Get version from asset file
		$version = $asset_data ? $asset_data['version'] : WP_DEV_TOOLKIT_VERSION;

		// Main app styles
		wp_register_style(
			'wp-dev-toolkit-app',
			WP_DEV_TOOLKIT_PLUGIN_URL . 'build/app.css',
			$this->style_deps,
			$version
		);

		// Admin styles (for menu icon, etc.) - use plugin version for this
		wp_register_style(
			'wp-dev-toolkit-admin',
			WP_DEV_TOOLKIT_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			WP_DEV_TOOLKIT_VERSION
		);
	}

    /**
     * Enqueue assets for admin pages
     *
     * @param string $hook Current admin page hook
     *
     * @return void
     */
    public function enqueue_assets( $hook ) {
        // Only enqueue on our plugin pages
        if ( false === strpos( $hook, 'wp-dev-toolkit' ) ) {
            return;
        }

        // Enqueue main app assets
        wp_enqueue_script( 'wp-dev-toolkit-app' );
        wp_enqueue_style( 'wp-dev-toolkit-app' );

        // Always enqueue admin styles
        wp_enqueue_style( 'wp-dev-toolkit-admin' );
    }

    /**
     * Add inline CSS for admin pages
     *
     * @return void
     */
    public function add_admin_inline_css() {
        // Add icon for the admin menu
        echo '<style>
            #adminmenu .toplevel_page_wp-dev-toolkit .wp-menu-image img {
                width: 20px;
                height: 20px;
                padding: 7px 0 0;
            }
        </style>';
    }

    /**
     * Get the log file path
     *
     * @return string
     */
    private function get_log_path() {
        $log_path = 		$this->get_config()->get( 'log_path', '' );

        if ( empty( $log_path ) ) {
            $log_path = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
        }

        return $log_path;
    }

    /**
     * Get the asset URL with version
     *
     * @param string $file_path Path to the asset file
     *
     * @return string
     */
    public function get_asset_url( $file_path ) {
        $url = WP_DEV_TOOLKIT_PLUGIN_URL . $file_path;
        $version = WP_DEV_TOOLKIT_VERSION;

        // Add file modification time for cache busting in development
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            $real_path = WP_DEV_TOOLKIT_PLUGIN_DIR . $file_path;
            if ( file_exists( $real_path ) ) {
                $version = filemtime( $real_path );
            }
        }

        return add_query_arg( 'ver', $version, $url );
    }
}
