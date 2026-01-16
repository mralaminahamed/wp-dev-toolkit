# WP Dev Toolkit - Base Scope

This directory contains base classes and interfaces that provide the foundation for the plugin architecture.

## Files

### ToolInterface.php

- **Purpose**: Defines the contract for all development tools
- **Methods**:
  - `init()`: Initialize the tool functionality
  - `register_rest_routes()`: Register REST API endpoints for the tool
- **Usage**: All tools must implement this interface to ensure consistent API

### ToolBase.php

- **Purpose**: Abstract base class providing common functionality for tools
- **Features**:
  - Configuration access via `wp_dev_toolkit()->get_config()`
  - Permission checking utilities
  - Tool key management and validation
  - Common tool properties and methods

## Architecture

The base scope establishes the plugin's architectural patterns:

### Tool System Design

```
ToolInterface (Contract)
    ↑
ToolBase (Abstract Implementation)
    ↑
Concrete Tools (ErrorLogger, QueryMonitor, etc.)
```

### Key Benefits

1. **Consistency**: All tools follow the same interface and initialization pattern
2. **Reusability**: Common functionality is centralized in ToolBase
3. **Maintainability**: Changes to base functionality affect all tools automatically
4. **Extensibility**: New tools can easily extend ToolBase and implement ToolInterface

## Usage

When creating new development tools:

1. Implement `ToolInterface`
2. Extend `ToolBase` for common functionality
3. Register the tool in the Factory
4. Add configuration keys as needed

## Dependencies

- Main plugin class for global access
- WordPress core APIs for permissions and configuration</content> <parameter name="filePath">resources/docs/base-scope.md
