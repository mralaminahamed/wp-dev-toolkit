<?php
/**
 * Plugin Name: WordPress Development Toolkit
 * Description: A comprehensive toolkit for WordPress plugin development.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * Text Domain: wp-dev-toolkit
 */

namespace WPDevToolkit;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

// Check if Composer's autoloader exists and load it
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
	require __DIR__ . '/vendor/autoload.php';
} else {
	wp_die('Composer autoloader not found. Please run "composer install" in the plugin directory.');
}

class WP_Dev_Toolkit {
	private static $instance = null;

	private function __construct() {
		$this->define_constants();
		$this->init_hooks();
	}

	public static function get_instance() {
		if (self::$instance === null) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function define_constants() {
		define('WP_DEV_TOOLKIT_VERSION', '1.0.0');
		define('WP_DEV_TOOLKIT_PLUGIN_DIR', plugin_dir_path(__FILE__));
		define('WP_DEV_TOOLKIT_PLUGIN_URL', plugin_dir_url(__FILE__));
	}

	private function init_hooks() {
		add_action('plugins_loaded', [$this, 'load_plugin_textdomain']);
		add_action('admin_menu', [$this, 'add_admin_menu']);
		add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
		add_action('rest_api_init', [$this, 'register_rest_routes']);
	}

	public function load_plugin_textdomain() {
		load_plugin_textdomain('wp-dev-toolkit', false, dirname(plugin_basename(__FILE__)) . '/languages');
	}

	public function add_admin_menu() {
		add_menu_page(
			__('WP Dev Toolkit', 'wp-dev-toolkit'),
			__('WP Dev Toolkit', 'wp-dev-toolkit'),
			'manage_options',
			'wp-dev-toolkit',
			[$this, 'render_admin_page'],
			'dashicons-admin-tools'
		);
	}

	public function render_admin_page() {
		echo '<div id="wp-dev-toolkit-app"></div>';
	}

	public function enqueue_admin_assets($hook) {
		if ('toplevel_page_wp-dev-toolkit' !== $hook) {
			return;
		}

		wp_enqueue_script(
			'wp-dev-toolkit-admin',
			WP_DEV_TOOLKIT_PLUGIN_URL . 'build/index.js',
			['wp-element', 'wp-components', 'wp-api-fetch'],
			WP_DEV_TOOLKIT_VERSION,
			true
		);

		wp_enqueue_style(
			'wp-dev-toolkit-admin',
			WP_DEV_TOOLKIT_PLUGIN_URL . 'build/index.css',
			['wp-components'],
			WP_DEV_TOOLKIT_VERSION
		);
	}

	public function register_rest_routes() {
		$endpoints = [
			new API\DevMode(),
			new API\ErrorLog(),
			new API\QueryMonitor(),
			new API\HookInspector(),
		];

		foreach ($endpoints as $endpoint) {
			$endpoint->register_routes();
		}

		// Register a general info endpoint
		register_rest_route('wp-dev-toolkit/v1', '/info', [
			'methods' => 'GET',
			'callback' => [$this, 'get_plugin_info'],
			'permission_callback' => function () {
				return current_user_can('manage_options');
			},
		]);
	}

	public function get_plugin_info() {
		return rest_ensure_response([
			'version' => WP_DEV_TOOLKIT_VERSION,
			'wp_version' => get_bloginfo('version'),
			'php_version' => phpversion(),
			'debug_mode' => WP_DEBUG,
			'debug_log' => WP_DEBUG_LOG,
			'debug_display' => WP_DEBUG_DISPLAY,
		]);
	}
}

// Initialize the plugin
WP_Dev_Toolkit::get_instance();
