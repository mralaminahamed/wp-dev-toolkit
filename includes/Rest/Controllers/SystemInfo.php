<?php

namespace WPDevToolkit\Rest\Controllers;

use WPDevToolkit\Rest\Base;

/**
 * System Information REST API Controller
 *
 * @package WPDevToolkit\Rest\Controllers
 */
class SystemInfo extends Base {
    /**
     * Register routes for this controller
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route($this->namespace, '/system-info', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_system_info'],
                'permission_callback' => [$this, 'permission_callback'],
            ],
        ]);
    }

    /**
     * Get system information
     *
     * @return \WP_REST_Response
     */
    public function get_system_info() {
        global $wpdb;

        // WordPress environment
        $wp_info = [
            'version' => get_bloginfo('version'),
            'home_url' => home_url(),
            'site_url' => site_url(),
            'is_multisite' => is_multisite(),
            'debug_mode' => defined('WP_DEBUG') && WP_DEBUG,
            'memory_limit' => WP_MEMORY_LIMIT,
            'permalink_structure' => get_option('permalink_structure'),
            'theme' => wp_get_theme()->get('Name'),
            'theme_version' => wp_get_theme()->get('Version'),
            'active_plugins' => count(get_option('active_plugins')),
            'language' => get_locale(),
        ];

        // Server environment
        $server_info = [
            'php_version' => phpversion(),
            'mysql_version' => $wpdb->db_version(),
            'web_server' => $_SERVER['SERVER_SOFTWARE'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'php_memory_limit' => ini_get('memory_limit'),
            'php_max_execution_time' => ini_get('max_execution_time'),
            'php_post_max_size' => ini_get('post_max_size'),
            'php_upload_max_filesize' => ini_get('upload_max_filesize'),
            'php_max_input_vars' => ini_get('max_input_vars'),
            'php_extensions' => implode(', ', get_loaded_extensions()),
        ];

        // Constants
        $constants = [
            'ABSPATH' => defined('ABSPATH'),
            'WP_CONTENT_DIR' => defined('WP_CONTENT_DIR') ? WP_CONTENT_DIR : '',
            'WP_CONTENT_URL' => defined('WP_CONTENT_URL') ? WP_CONTENT_URL : '',
            'WP_PLUGIN_DIR' => defined('WP_PLUGIN_DIR') ? WP_PLUGIN_DIR : '',
            'WP_PLUGIN_URL' => defined('WP_PLUGIN_URL') ? WP_PLUGIN_URL : '',
            'WPMU_PLUGIN_DIR' => defined('WPMU_PLUGIN_DIR') ? WPMU_PLUGIN_DIR : '',
            'WPMU_PLUGIN_URL' => defined('WPMU_PLUGIN_URL') ? WPMU_PLUGIN_URL : '',
        ];

        // File system permissions
        $permissions = [
            'root_writable' => is_writable(ABSPATH),
            'wp_content_writable' => is_writable(WP_CONTENT_DIR),
            'uploads_writable' => is_writable(wp_upload_dir()['basedir']),
            'plugins_writable' => is_writable(WP_PLUGIN_DIR),
        ];

        return $this->send_json_success([
            'wordpress' => $wp_info,
            'server' => $server_info,
            'constants' => $constants,
            'permissions' => $permissions,
        ]);
    }
}
