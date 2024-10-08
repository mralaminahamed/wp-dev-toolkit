<?php

// src/Tools/HookInspector.php
namespace WPDevToolkit\Tools;

use WP_REST_Server;
use function add_action;
use function current_user_can;
use function get_option;
use function get_transient;
use function register_rest_route;
use function rest_ensure_response;
use function set_transient;

class HookInspector implements ToolInterface {
    private $hooks = [];

    public function init() {
        if (get_option('wp_dev_toolkit_dev_mode', false)) {
            add_action('all', [$this, 'log_hook'], 1);
        }
    }

    public function register_rest_routes() {
        register_rest_route('wp-dev-toolkit/v1', '/hooks', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_hooks'],
            'permission_callback' => [$this, 'check_admin_permissions'],
        ]);
    }

    public function log_hook($tag) {
        $this->hooks[] = $tag;
    }

    public function get_hooks() {
        $cached_hooks = $this->get_cached_data('hooks');
        if ($cached_hooks !== null) {
            return rest_ensure_response(['hooks' => $cached_hooks]);
        }

        $this->set_cached_data('hooks', $this->hooks);
        return rest_ensure_response(['hooks' => $this->hooks]);
    }

    public function check_admin_permissions() {
        return current_user_can('manage_options');
    }

    private function get_cached_data($key) {
        $cache = get_transient('wp_dev_toolkit_' . $key);
        if ($cache === false) {
            return null;
        }
        return $cache;
    }

    private function set_cached_data($key, $data, $expiration = 300) {
        set_transient('wp_dev_toolkit_' . $key, $data, $expiration);
    }
}