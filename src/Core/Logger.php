<?php
// Create a new file: src/Core/Logger.php

namespace WPDevToolkit\Core;

class Logger {
    public static function log($message, $level = 'info') {
        if (!WP_DEBUG) {
            return;
        }

        $log_file = WP_CONTENT_DIR . '/wp-dev-toolkit-debug.log';
        $timestamp = date('Y-m-d H:i:s');
        $log_message = "[$timestamp] [$level] $message" . PHP_EOL;

        error_log($log_message, 3, $log_file);
    }
}

// Usage example:
use WPDevToolkit\Core\Logger;

Logger::log('Development mode enabled');
Logger::log('An error occurred', 'error');