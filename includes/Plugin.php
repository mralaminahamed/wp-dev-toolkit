<?php
namespace WPDevToolkit;

use WPDevToolkit\Core\Config;
use WPDevToolkit\Tools\ToolFactory;
use WPDevToolkit\Tools\ToolInterface;

class Plugin {
	private $config;
	private $tool_factory;
	private $tools = [];

	public function __construct(Config $config, ToolFactory $tool_factory) {
		$this->config = $config;
		$this->tool_factory = $tool_factory;
	}

	public function init() {
		add_action('init', [$this, 'load_textdomain']);
		add_action('admin_menu', [$this, 'add_admin_menu']);
		add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
		add_action('rest_api_init', [$this, 'register_rest_routes']);

		$this->init_tools();

		do_action('wp_dev_toolkit_init', $this);
	}

	public function load_textdomain() {
		load_plugin_textdomain('wp-dev-toolkit', false, dirname(plugin_basename(__FILE__)) . '/languages');
	}

	public function add_admin_menu() {
		add_menu_page(
			__('Dev Toolkit', 'wp-dev-toolkit'),
			__('Dev Toolkit', 'wp-dev-toolkit'),
			'manage_options',
			'wp-dev-toolkit',
			[$this, 'render_admin_page'],
			'dashicons-admin-tools',
			100
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
			'wp-dev-toolkit-app',
			WP_DEV_TOOLKIT_PLUGIN_URL . 'build/index.js',
			['wp-element', 'wp-components', 'wp-api-fetch'],
			WP_DEV_TOOLKIT_VERSION,
			true
		);

		wp_enqueue_style(
			'wp-dev-toolkit-styles',
			WP_DEV_TOOLKIT_PLUGIN_URL . 'build/index.css',
			['wp-components'],
			WP_DEV_TOOLKIT_VERSION
		);

		wp_localize_script('wp-dev-toolkit-app', 'wpDevToolkit', [
			'nonce' => wp_create_nonce('wp_rest'),
			'apiUrl' => rest_url('wp-dev-toolkit/v1'),
		]);
	}

	public function register_rest_routes() {
		register_rest_route('wp-dev-toolkit/v1', '/config', [
			'methods' => 'GET',
			'callback' => [$this, 'get_config'],
			'permission_callback' => [$this, 'check_admin_permissions'],
		]);

		register_rest_route('wp-dev-toolkit/v1', '/config', [
			'methods' => 'POST',
			'callback' => [$this, 'update_config'],
			'permission_callback' => [$this, 'check_admin_permissions'],
		]);

		foreach ($this->tools as $tool) {
			$tool->register_rest_routes();
		}
	}

	public function get_config() {
		return rest_ensure_response($this->config->get_all());
	}

	public function update_config($request) {
		$new_config = $request->get_json_params();
		$this->config->update($new_config);
		return rest_ensure_response($this->config->get_all());
	}

	public function check_admin_permissions(): bool {
		return current_user_can('manage_options');
	}

	private function init_tools() {
		$tool_classes = [
			'error_logger' => 'WPDevToolkit\\Tools\\ErrorLogger',
			'query_monitor' => 'WPDevToolkit\\Tools\\QueryMonitor',
			'hook_inspector' => 'WPDevToolkit\\Tools\\HookInspector',
		];

		foreach ($tool_classes as $tool_name => $tool_class) {
			if ($this->config->get($tool_name, true)) {
				$this->register_tool($tool_name, $tool_class);
			}
		}

		foreach ($this->tools as $tool) {
			$tool->init();
		}
	}

	public function register_tool($name, $class) {
		if (!class_exists($class) || !in_array(ToolInterface::class, class_implements($class))) {
			throw new \InvalidArgumentException("Invalid tool class: $class");
		}
		$this->tools[$name] = new $class($this->config);
	}

	public static function activate() {
		$config = new Config();
		$config->set_default_options();
		$config->validate_config();

		// Create necessary database tables or set up custom post types if needed
		// For example:
		// self::create_custom_tables();
		// self::register_custom_post_types();

		flush_rewrite_rules();
	}

	public static function deactivate() {
		// Clean up any scheduled events
		wp_clear_scheduled_hook('wp_dev_toolkit_daily_cleanup');

		flush_rewrite_rules();
	}

	private static function create_custom_tables() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();

		// Example of creating a custom table
		$table_name = $wpdb->prefix . 'wp_dev_toolkit_logs';
		$sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
            message text NOT NULL,
            type varchar(20) NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($sql);
	}

	private static function register_custom_post_types() {
		// Example of registering a custom post type
		register_post_type('wp_dev_toolkit_log', [
			'labels' => [
				'name' => __('Dev Toolkit Logs', 'wp-dev-toolkit'),
				'singular_name' => __('Log', 'wp-dev-toolkit'),
			],
			'public' => false,
			'has_archive' => false,
			'supports' => ['title', 'editor'],
		]);
	}
}