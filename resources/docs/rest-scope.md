# WP Dev Toolkit - REST API Scope

This directory contains all REST API related functionality for the WP Dev Toolkit plugin.

## Files

### Base.php

- **Purpose**: Base REST controller class with common functionality
- **Responsibilities**:
  - Provide authentication and permission checking
  - Handle common REST API response formatting
  - Define shared REST API utilities

### ControllerLoader.php

- **Purpose**: Manages registration of all REST API controllers
- **Responsibilities**:
  - Initialize and register controller instances
  - Handle controller dependencies
  - Coordinate REST API endpoint registration

### Controllers/

- **DevMode.php**: Handles development mode settings
- **ErrorLog.php**: REST API for error logging functionality
- **HookInspector.php**: API endpoints for WordPress hook inspection
- **QueryMonitor.php**: REST API for database query monitoring
- **Settings.php**: Configuration and settings management endpoints
- **SystemInfo.php**: System information and diagnostics API
- **Terminal.php**: Command-line interface API endpoints

## API Endpoints

All endpoints are prefixed with `/wp-dev-toolkit/v1/` and require `manage_options` capability.

### Settings Endpoints

- `GET /wp-dev-toolkit/v1/config` - Get configuration
- `POST /wp-dev-toolkit/v1/config` - Update configuration

### Tool-Specific Endpoints

- Error logging, query monitoring, hook inspection APIs
- System information and diagnostics
- Terminal command execution

## Usage

The REST scope provides the API layer for the React frontend to communicate with WordPress backend functionality. All development tools expose their functionality through REST endpoints.

## Dependencies

- WordPress REST API
- Main plugin configuration
- Individual tool implementations</content> <parameter name="filePath">resources/docs/rest-scope.md
