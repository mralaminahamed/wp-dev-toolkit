<?php
/**
 * Plugin Name: WordPress Development Toolkit
 * Description: A comprehensive toolkit for WordPress plugin development with React-based control panel.
 * Version: 1.0.0
 * Author: Al Amin Ahamed
 * Author URI: https://alaminahamed.com
 * Text Domain: wp-dev-toolkit
 */

namespace WPDevToolkit;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

require_once __DIR__ . '/vendor/autoload.php';

use WPDevToolkit\Core\Plugin;
use WPDevToolkit\Core\ToolFactory;
use WPDevToolkit\Tools\ErrorLogger;
use WPDevToolkit\Tools\QueryMonitor;
use WPDevToolkit\Tools\HookInspector;

class WPDevToolkit {
    private static $instance = null;
    private $plugin;

    private function __construct() {
        $this->define_constants();
        $this->init_plugin();
    }

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function define_constants() {
        define('WP_DEV_TOOLKIT_VERSION', '1.0.0');
        define('WP_DEV_TOOLKIT_PATH', plugin_dir_path(__FILE__));
        define('WP_DEV_TOOLKIT_URL', plugin_dir_url(__FILE__));
    }

    private function init_plugin() {
        $tool_factory = new ToolFactory();
        $tool_factory->register('error_logger', ErrorLogger::class);
        $tool_factory->register('query_monitor', QueryMonitor::class);
        $tool_factory->register('hook_inspector', HookInspector::class);

        $this->plugin = new Plugin($tool_factory);
        $this->plugin->init();
    }
}

// Initialize the plugin
WPDevToolkit::get_instance();