<?php
namespace WPDevToolkit\Core;

use WPDevToolkit\Core\Config;
use WPDevToolkit\Tools\Factory as ToolFactory;
use WPDevToolkit\Base\ToolInterface;
use WPDevToolkit\Admin\Menu;
use WPDevToolkit\Rest\ControllerLoader;

/**
 * Main Plugin Class
 *
 * Core controller for the WP Dev Toolkit plugin
 *
 * @package WPDevToolkit\Core
 */
class Plugin {
    /**
     * Configuration instance
     *
     * @var Config
     */
    private $config;

    /**
     * Tool factory instance
     *
     * @var ToolFactory
     */
    private $tool_factory;

    /**
     * Registered tools
     *
     * @var array
     */
    private $tools = [];

    /**
     * Admin menu instance
     *
     * @var Menu
     */
    private $menu;

    /**
     * REST controller loader
     *
     * @var ControllerLoader
     */
    private $controller_loader;

    /**
     * Constructor
     *
     * @param Config      $config       Configuration instance
     * @param ToolFactory $tool_factory Tool factory instance
     */
    public function __construct(Config $config, ToolFactory $tool_factory) {
        $this->config = $config;
        $this->tool_factory = $tool_factory;
        $this->menu = new Menu($this);
        $this->controller_loader = new ControllerLoader($config);
    }

    /**
     * Initialize the plugin
     *
     * @return void
     */
    public function init() {
        add_action('init', [$this, 'load_textdomain']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);

        // Let the Menu class handle the admin menu
        $this->menu->init();

        $this->init_tools();

        do_action('wp_dev_toolkit_init', $this);
    }

    /**
     * Load text domain for internationalization
     *
     * @return void
     */
    public function load_textdomain() {
        load_plugin_textdomain('wp-dev-toolkit', false, dirname(WP_DEV_TOOLKIT_PLUGIN_BASENAME) . '/languages');
    }

    /**
     * Register REST API routes
     *
     * @return void
     */
    public function register_rest_routes() {
        // Register core settings routes
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

        // Register all controller routes
        $this->controller_loader->register_routes();

        // Register tool-specific routes
        foreach ($this->tools as $tool) {
            $tool->register_rest_routes();
        }
    }

    /**
     * Get configuration endpoint handler
     *
     * @return \WP_REST_Response
     */
    public function get_config() {
        return rest_ensure_response($this->config->get_all());
    }

    /**
     * Update configuration endpoint handler
     *
     * @param \WP_REST_Request $request Request object
     *
     * @return \WP_REST_Response
     */
    public function update_config($request) {
        $new_config = $request->get_json_params();
        $this->config->update($new_config);
        return rest_ensure_response($this->config->get_all());
    }

    /**
     * Check admin permissions for REST API
     *
     * @return bool
     */
    public function check_admin_permissions(): bool {
        return current_user_can('manage_options');
    }

    /**
     * Initialize tools
     *
     * @return void
     */
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

    /**
     * Register a tool
     *
     * @param string $name  Tool name
     * @param string $class Tool class
     *
     * @return void
     * @throws \InvalidArgumentException If tool class is invalid
     */
    public function register_tool($name, $class) {
        if (!class_exists($class) || !in_array(ToolInterface::class, class_implements($class))) {
            throw new \InvalidArgumentException("Invalid tool class: $class");
        }
        $this->tools[$name] = new $class($this->config);
    }
}
