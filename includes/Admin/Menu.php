<?php
namespace WPDevToolkit\Admin;

use WPDevToolkit\Core\Plugin;

/**
 * Admin Menu Handler
 *
 * Handles the admin menu registration and page rendering
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
	}

	/**
	 * Add admin menu
	 *
	 * @return void
	 */
	public function add_admin_menu() {
		$icon_url = WP_DEV_TOOLKIT_PLUGIN_URL . 'assets/images/wp-dev-toolkit-icon.svg';
		
		add_menu_page(
			__( 'Dev Toolkit', 'wp-dev-toolkit' ),
			__( 'Dev Toolkit', 'wp-dev-toolkit' ),
			'manage_options',
			'wp-dev-toolkit',
			array( $this, 'render_admin_page' ),
			$icon_url,
			100
		);
		
		// Add submenu pages
		add_submenu_page(
			'wp-dev-toolkit',
			__( 'Dashboard', 'wp-dev-toolkit' ),
			__( 'Dashboard', 'wp-dev-toolkit' ),
			'manage_options',
			'wp-dev-toolkit',
			array( $this, 'render_admin_page' )
		);
		
		add_submenu_page(
			'wp-dev-toolkit',
			__( 'Error Log', 'wp-dev-toolkit' ),
			__( 'Error Log', 'wp-dev-toolkit' ),
			'manage_options',
			'wp-dev-toolkit-error-log',
			array( $this, 'render_admin_page' )
		);
		
		add_submenu_page(
			'wp-dev-toolkit',
			__( 'Query Monitor', 'wp-dev-toolkit' ),
			__( 'Query Monitor', 'wp-dev-toolkit' ),
			'manage_options',
			'wp-dev-toolkit-query-monitor',
			array( $this, 'render_admin_page' )
		);
		
		add_submenu_page(
			'wp-dev-toolkit',
			__( 'Hook Inspector', 'wp-dev-toolkit' ),
			__( 'Hook Inspector', 'wp-dev-toolkit' ),
			'manage_options',
			'wp-dev-toolkit-hook-inspector',
			array( $this, 'render_admin_page' )
		);
		
		add_submenu_page(
			'wp-dev-toolkit',
			__( 'Terminal', 'wp-dev-toolkit' ),
			__( 'Terminal', 'wp-dev-toolkit' ),
			'manage_options',
			'wp-dev-toolkit-terminal',
			array( $this, 'render_admin_page' )
		);
		
		add_submenu_page(
			'wp-dev-toolkit',
			__( 'System Info', 'wp-dev-toolkit' ),
			__( 'System Info', 'wp-dev-toolkit' ),
			'manage_options',
			'wp-dev-toolkit-system-info',
			array( $this, 'render_admin_page' )
		);
		
		add_submenu_page(
			'wp-dev-toolkit',
			__( 'Settings', 'wp-dev-toolkit' ),
			__( 'Settings', 'wp-dev-toolkit' ),
			'manage_options',
			'wp-dev-toolkit-settings',
			array( $this, 'render_admin_page' )
		);
	}

	/**
	 * Render the admin page
	 *
	 * @return void
	 */
	public function render_admin_page() {
		// Get the current page slug
		$screen = get_current_screen();
		$page = str_replace('wp-dev-toolkit-', '', $screen->id);
		
		// For the main page, use 'dashboard'
		if ($page === 'toplevel_page_wp-dev-toolkit') {
			$page = 'dashboard';
		}
		
		// Add script to initialize the route
		echo '<script>window.wpDevToolkitInitialRoute = "' . esc_js($page) . '";</script>';
		
		// Render the app container
		echo '<div id="wp-dev-toolkit-app"></div>';
	}
}
