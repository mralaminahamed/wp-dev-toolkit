# WP Dev Toolkit - Tools Scope

This directory contains all development tool implementations for the WP Dev Toolkit plugin.

## Files

### ErrorLogger.php

- **Purpose**: Comprehensive error logging and monitoring system
- **Features**:
  - PHP error and exception catching
  - Fatal error handling
  - Log file management and rotation
  - REST API integration for frontend display

### Factory.php

- **Purpose**: Factory class for creating and managing tool instances
- **Responsibilities**:
  - Register and instantiate development tools
  - Handle tool dependencies and configuration
  - Provide centralized tool management

### HookInspector.php

- **Purpose**: WordPress hook inspection and analysis tool
- **Features**:
  - Monitor WordPress action and filter hooks
  - Track hook execution order and timing
  - REST API for real-time hook inspection

### QueryMonitor.php

- **Purpose**: Database query monitoring and analysis
- **Features**:
  - Track all database queries
  - Monitor query execution time
  - Identify slow or problematic queries
  - REST API for query analysis

## Tool Interface

All tools implement the `ToolInterface` which defines:

- `init()`: Initialize the tool
- `register_rest_routes()`: Register REST API endpoints

## Base Classes

Tools extend `ToolBase` which provides:

- Configuration access via `wp_dev_toolkit()`
- Permission checking methods
- Common tool utilities

## Usage

Tools are automatically registered through the Factory and initialized during plugin startup. Each tool provides specific development and debugging functionality accessible through the admin
interface.

## Dependencies

- ToolInterface and ToolBase classes
- Main plugin configuration
- WordPress core APIs (hooks, database, etc.)</content> <parameter name="filePath">resources/docs/tools-scope.md
