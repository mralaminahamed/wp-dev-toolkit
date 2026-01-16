<?php
namespace WPDevToolkit\Admin;

defined( 'ABSPATH' ) || exit;

/**
 * Admin Menu Controller for WP Dev Toolkit Plugin.
 *
 * Handles admin menu registration, submenu management, and navigation
 * for the development toolkit interface in WordPress admin.
 *
 * @since 1.0.0
 */
class Menu {

	/**
	 * Controller constructor
	 *
	 * Initializes the admin menu controller and registers necessary hooks
	 */
	public function __construct() {
		$this->register_hooks();
	}

	/**
	 * Register hooks for menu controller
	 *
	 * @return void
	 */
	protected function register_hooks(): void {
		add_action( 'admin_menu', array( $this, 'register' ) );
		add_action( 'admin_init', array( $this, 'maybe_redirect_to_setup' ) );
	}

	/**
	 * Register admin menu and submenus
	 *
	 * Creates the main WP Dev Toolkit menu in WordPress admin with all necessary submenus
	 * and applies filters for customization.
	 *
	 * @return void
	 */
	public function register(): void {
		global $submenu;

		/**
		 * Action before admin menu is added
		 *
		 * @since 1.0.0
		 */
		do_action( 'wp_dev_toolkit_before_admin_menu' );

		$slug          = 'wp-dev-toolkit';
		$capability    = apply_filters( 'wp_dev_toolkit_menu_capability', 'manage_options' );
		$menu_position = apply_filters( 'wp_dev_toolkit_menu_position', 100 );

		// Menu icon as dashicon
		$menu_icon = 'dashicons-admin-tools';

		/**
		 * Filter the admin menu icon
		 *
		 * @since 1.0.0
		 *
		 * @param string $menu_icon Menu icon.
		 */
		$menu_icon = apply_filters( 'wp_dev_toolkit_admin_menu_icon', $menu_icon );

		// Main menu page.
		add_menu_page(
			__( 'Dev Toolkit', 'wp-dev-toolkit' ),
			__( 'Dev Toolkit', 'wp-dev-toolkit' ),
			$capability,
			$slug,
			array( $this, 'callback_dashboard' ),
			$menu_icon,
			$menu_position
		);

		if ( current_user_can( $capability ) ) {
			// phpcs:disable.
			$submenu[ $slug ][] = array( __( 'Dashboard', 'wp-dev-toolkit' ), $capability, 'admin.php?page=' . $slug . '#/' );
			$submenu[ $slug ][] = array( __( 'Error Log', 'wp-dev-toolkit' ), $capability, 'admin.php?page=' . $slug . '#/error-log' );
			$submenu[ $slug ][] = array( __( 'Query Monitor', 'wp-dev-toolkit' ), $capability, 'admin.php?page=' . $slug . '#/query-monitor' );
			$submenu[ $slug ][] = array( __( 'Hook Inspector', 'wp-dev-toolkit' ), $capability, 'admin.php?page=' . $slug . '#/hook-inspector' );
			$submenu[ $slug ][] = array( __( 'Terminal', 'wp-dev-toolkit' ), $capability, 'admin.php?page=' . $slug . '#/terminal' );
			$submenu[ $slug ][] = array( __( 'System Info', 'wp-dev-toolkit' ), $capability, 'admin.php?page=' . $slug . '#/system-info' );
			$submenu[ $slug ][] = array( __( 'Settings', 'wp-dev-toolkit' ), $capability, 'admin.php?page=' . $slug . '#/settings' );

			/**
			 * Filter admin menu submenu items
			 *
			 * @since 1.0.0
			 *
			 * @param array $submenu_items Submenu items.
			 * @param string $capability Menu capability.
			 * @param string $slug Menu slug.
			 */
			$submenu[ $slug ] = apply_filters( 'wp_dev_toolkit_admin_menu_submenu', $submenu[ $slug ], $capability, $slug ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		}

		/**
		 * Action for adding custom menu items
		 *
		 * @since 1.0.0
		 *
		 * @param string $capability Menu capability.
		 * @param int $menu_position Menu position.
		 */
		do_action( 'wp_dev_toolkit_admin_menu', $capability, $menu_position );
	}

	/**
	 * Render the admin dashboard page
	 *
	 * Outputs the main admin dashboard template for the WP Dev Toolkit plugin.
	 *
	 * @return void
	 */
	public function callback_dashboard(): void {
		// Add script to initialize the route
		$current_route = $this->get_current_route();
		echo '<script>window.wpDevToolkitInitialRoute = "' . esc_js( $current_route ) . '";</script>';

		// Render the app container
		echo '<div id="wp-dev-toolkit-app"></div>';
	}

	/**
	 * Get current route from URL hash or page parameter
	 *
	 * @return string
	 */
	private function get_current_route(): string {
		// Check if there's a hash in the URL
		if ( isset( $_SERVER['REQUEST_URI'] ) && strpos( $_SERVER['REQUEST_URI'], '#' ) !== false ) {
			$url_parts = explode( '#', $_SERVER['REQUEST_URI'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			$hash = isset( $url_parts[1] ) ? $url_parts[1] : '';

			if ( ! empty( $hash ) ) {
				// Remove leading slash
				return ltrim( $hash, '/' );
			}
		}

		// Default to dashboard
		return '';
	}

	/**
	 * Maybe redirect to setup on activation.
	 *
	 * Handles automatic redirection to setup when the plugin
	 * is first activated. Only redirects administrators.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function maybe_redirect_to_setup(): void {
		// Check if we should redirect to setup.
		if ( get_transient( 'wp_dev_toolkit_activation_redirect' ) ) {
			delete_transient( 'wp_dev_toolkit_activation_redirect' );

			// Avoid redirect loops.
			if ( ! isset( $_GET['page'] ) || 'wp-dev-toolkit' !== $_GET['page'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				wp_safe_redirect( admin_url( 'admin.php?page=wp-dev-toolkit#/' ) );
				exit;
			}
		}
	}
}
