<?php
// src/Core/Plugin.php
namespace WPDevToolkit\Core;

class Plugin {
    private $tool_factory;
    private $tools = [];

    public function __construct(ToolFactory $tool_factory) {
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
            __('WP Dev Toolkit', 'wp-dev-toolkit'),
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
            WP_DEV_TOOLKIT_URL . 'build/index.js',
            ['wp-element', 'wp-components', 'wp-api-fetch'],
            WP_DEV_TOOLKIT_VERSION,
            true
        );

        wp_enqueue_style(
            'wp-dev-toolkit-styles',
            WP_DEV_TOOLKIT_URL . 'build/index.css',
            ['wp-components'],
            WP_DEV_TOOLKIT_VERSION
        );

        wp_localize_script('wp-dev-toolkit-app', 'wpDevToolkit', [
            'nonce' => wp_create_nonce('wp_rest'),
            'apiUrl' => rest_url('wp-dev-toolkit/v1'),
        ]);
    }

    public function register_rest_routes() {
        register_rest_route('wp-dev-toolkit/v1', '/dev-mode', [
            'methods' => 'GET',
            'callback' => [$this, 'get_dev_mode'],
            'permission_callback' => [$this, 'check_admin_permissions'],
        ]);

        register_rest_route('wp-dev-toolkit/v1', '/dev-mode', [
            'methods' => 'POST',
            'callback' => [$this, 'update_dev_mode'],
            'permission_callback' => [$this, 'check_admin_permissions'],
        ]);

        // Register routes for each tool
        foreach ($this->tools as $tool) {
            $tool->register_rest_routes();
        }
    }

    public function get_dev_mode() {
        return rest_ensure_response(['dev_mode' => get_option('wp_dev_toolkit_dev_mode', false)]);
    }

    public function update_dev_mode($request) {
        $dev_mode = $request->get_param('dev_mode');
        update_option('wp_dev_toolkit_dev_mode', $dev_mode);
        return rest_ensure_response(['dev_mode' => $dev_mode]);
    }

    public function check_admin_permissions() {
        return current_user_can('manage_options');
    }

    private function init_tools() {
        $tool_names = ['error_logger', 'query_monitor', 'hook_inspector'];
        foreach ($tool_names as $tool_name) {
            $this->tools[$tool_name] = $this->tool_factory->create($tool_name);
            $this->tools[$tool_name]->init();
        }
    }

    public function register_tool($name, $class) {
        do_action('wp_dev_toolkit_register_tool', $this->tool_factory, $name, $class);
    }
}



// Example usage in another plugin:
add_action('wp_dev_toolkit_init', function($plugin) {
    $plugin->register_tool('my_custom_tool', MyCustomTool::class);
});
