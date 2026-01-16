# WP Dev Toolkit - Admin Scope

This directory contains all admin interface, configuration, and asset management functionality for the WP Dev Toolkit plugin.

## Files

### Assets.php

- **Purpose**: Manages registration and enqueuing of CSS, JavaScript, and other frontend assets
- **Responsibilities**:
  - Register and enqueue React application scripts
  - Handle CSS compilation and loading
  - Manage asset dependencies and versioning
  - Localize JavaScript with WordPress data

### Config.php

- **Purpose**: Configuration management and settings storage
- **Responsibilities**:
  - Store and retrieve plugin settings
  - Handle WordPress options API integration
  - Validate and sanitize configuration data
  - Provide default configuration values

### Menu.php

- **Purpose**: Handles WordPress admin menu registration and page rendering
- **Responsibilities**:
  - Register admin menu pages
  - Render admin page containers for React app
  - Handle menu page routing

## Usage

The admin scope provides the complete backend infrastructure for the plugin, including the admin interface, configuration management, and frontend asset handling. It serves as the central hub for all
admin-related functionality.

## Dependencies

- WordPress Admin API
- WordPress Options API
- WordPress Scripts API
- Main plugin class for global access</content> <parameter name="filePath">resources/docs/admin-scope.md
