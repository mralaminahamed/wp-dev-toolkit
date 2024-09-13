<?php
// src/Tools/ErrorLogger.php
namespace WPDevToolkit\Tools;

use WP_REST_Server;
use WPDevToolkit\ToolInterface;
use function current_user_can;
use function get_option;
use function register_rest_route;
use function rest_ensure_response;
use const WP_CONTENT_DIR;

class ErrorLogger implements ToolInterface {
    public function init() {
        if (get_option('wp_dev_toolkit_dev_mode', false)) {
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
            ini_set('log_errors', 1);
            ini_set('error_log', WP_CONTENT_DIR . '/wp-dev-toolkit-error.log');
        }
    }

    public function register_rest_routes() {
        register_rest_route('wp-dev-toolkit/v1', '/error-log', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_error_log'],
            'permission_callback' => [$this, 'check_admin_permissions'],
        ]);

        register_rest_route('wp-dev-toolkit/v1', '/error-log', [
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => [$this, 'clear_error_log'],
            'permission_callback' => [$this, 'check_admin_permissions'],
        ]);
    }

    public function get_error_log() {
        $log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
        if (!file_exists($log_file)) {
            return rest_ensure_response(['message' => 'Error log is empty']);
        }

        $log_content = file_get_contents($log_file);
        return rest_ensure_response(['log_content' => $log_content]);
    }

    public function clear_error_log() {
        $log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-error.log';
        file_put_contents($log_file, '');
        return rest_ensure_response(['message' => 'Error log cleared']);
    }

    public function check_admin_permissions() {
        return current_user_can('manage_options');
    }
}

