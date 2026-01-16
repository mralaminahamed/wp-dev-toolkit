# WP Dev Toolkit - Tools Scope

This directory contains all development tool implementations and base classes for the WP Dev Toolkit plugin.

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

### ToolBase.php

- **Purpose**: Abstract base class providing common functionality for tools
- **Features**:
  - Configuration access via `wp_dev_toolkit()->get_config()`
  - Permission checking utilities
  - Tool key management and validation
  - Common tool properties and methods

### ToolInterface.php

- **Purpose**: Interface defining the contract for all development tools
- **Methods**:
  - `init()`: Initialize the tool functionality
  - `register_rest_routes()`: Register REST API endpoints

## Tool Architecture

The tool system follows a consistent pattern:

```
ToolInterface (Contract)
    ↑
ToolBase (Abstract Implementation)
    ↑
Concrete Tools (ErrorLogger, QueryMonitor, etc.)
```

## Usage

Tools are automatically registered through the Factory and initialized during plugin startup. Each tool provides specific development and debugging functionality accessible through the admin
interface.

## Dependencies

- Main plugin class for global access
- WordPress core APIs (hooks, database, logging, etc.)
- PSR-4 autoloading for class resolution</content> <parameter name="filePath">resources/docs/tools-scope.md
