<?php
// Create a new file: src/Core/Config.php

namespace WPDevToolkit\Core;

class Config {
    private static $instance = null;
    private $config = [];

    private function __construct() {
        $this->load_config();
    }

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function load_config() {
        $default_config = [
            'dev_mode' => false,
            'error_logging' => true,
            'query_monitoring' => true,
            'hook_inspection' => true,
        ];

        $user_config = get_option('wp_dev_toolkit_config', []);
        $this->config = array_merge($default_config, $user_config);
    }

    public function get($key, $default = null) {
        return isset($this->config[$key]) ? $this->config[$key] : $default;
    }

    public function set($key, $value) {
        $this->config[$key] = $value;
        update_option('wp_dev_toolkit_config', $this->config);
    }
}

// Usage example:
use WPDevToolkit\Core\Config;

$config = Config::get_instance();
$dev_mode = $config->get('dev_mode');
$config->set('dev_mode', true);