<?php

// src/Tools/QueryMonitor.php
namespace WPDevToolkit\Tools;

use WPDevToolkit\Core\ToolInterface;
use WP_REST_Server;

class QueryMonitor implements ToolInterface {
    private $queries = [];

    public function init() {
        if (get_option('wp_dev_toolkit_dev_mode', false)) {
            add_filter('query', [$this, 'log_query']);
        }
    }

    public function register_rest_routes() {
        register_rest_route('wp-dev-toolkit/v1', '/queries', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_queries'],
            'permission_callback' => [$this, 'check_admin_permissions'],
        ]);
    }

    public function log_query($query) {
        $this->queries[] = $query;
        return $query;
    }

    public function get_queries() {
        $cached_queries = $this->get_cached_data('queries');
        if ($cached_queries !== null) {
            return rest_ensure_response(['queries' => $cached_queries]);
        }

        $this->set_cached_data('queries', $this->queries);
        return rest_ensure_response(['queries' => $this->queries]);
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