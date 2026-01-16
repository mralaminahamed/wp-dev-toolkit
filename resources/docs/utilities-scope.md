# WP Dev Toolkit - Utilities Scope

This directory contains utility functions and helper classes used throughout the plugin.

## Files

### Helpers.php

- **Purpose**: General utility functions and WordPress-specific helpers
- **Responsibilities**:
  - Common WordPress utility functions
  - Data sanitization helpers
  - Formatting and validation utilities

### Logger.php

- **Purpose**: Centralized logging system for the entire plugin
- **Responsibilities**:
  - Handle all logging operations
  - Manage log file creation and rotation
  - Integrate with WordPress logging system
  - Provide different log levels (error, warning, info, debug)

## Usage

The utilities scope provides shared functionality used by multiple parts of the plugin. The Logger class is particularly important for debugging and monitoring plugin activity.

## Logging Features

- **Multiple Log Levels**: Error, warning, info, debug
- **Automatic Rotation**: Log files are rotated to prevent disk space issues
- **Secure Storage**: Logs are stored in protected WordPress upload directories
- **WordPress Integration**: Uses WooCommerce logger when available, falls back to file logging

## Dependencies

- WordPress Filesystem API
- WordPress Upload Directory structure
- Optional: WooCommerce Logger (if available)</content> <parameter name="filePath">resources/docs/utilities-scope.md
