# WP Dev Toolkit - Architecture Documentation

This documentation provides a comprehensive overview of the WP Dev Toolkit plugin architecture and organization.

## Directory Structure

```
wp-dev-toolkit/
├── wp-dev-toolkit.php              # Main plugin bootstrap file
├── class-wp-dev-toolkit.php        # Main plugin class (singleton)
├── includes/                       # PSR-4 autoloaded PHP classes
│   ├── Admin/                     # WordPress admin interface, config, and assets
│   ├── REST/                      # REST API controllers and base classes
│   ├── Utilities/                 # Helper functions and logging system
│   ├── Tools/                     # Development tools and base classes
├── src/                           # React/TypeScript frontend
├── resources/docs/                # Documentation files
└── AGENTS.md                      # Development guidelines for AI agents
```

## Scope-Based Organization

The codebase is organized by functional scopes to improve maintainability and code discovery:

### 🎛️ **Admin Scope** (`includes/Admin/`)

Handles WordPress admin interface, configuration, and asset management:

- Admin menu registration and page rendering
- Plugin configuration and settings management
- Frontend asset registration and enqueuing
- Admin interface components

### 🔌 **REST Scope** (`includes/REST/`)

Contains all REST API controllers, base classes, and API management:

- API controllers for each feature
- Base controller classes
- API endpoint management

### 🛠️ **Tools Scope** (`includes/Tools/`)

Houses development tool implementations and base classes:

- Error logging, query monitoring, hook inspection
- Tool factory and registration
- Base classes and interfaces for tools

### 🔧 **Utilities Scope** (`includes/Utilities/`)

Provides shared utility functions, helpers, and logging system:

- Centralized logging system
- Helper functions for common tasks

## Architecture Principles

### 1. **Global Access Pattern**

- Use `wp_dev_toolkit()` function for accessing main plugin instance
- Eliminates dependency injection complexity
- Provides centralized access to configuration and tools

### 2. **PSR-4 Autoloading**

- All classes follow PSR-4 namespace conventions
- Composer handles automatic class loading
- Clean namespace hierarchy matching directory structure

### 3. **Scope Separation**

- Functional areas are clearly separated
- Easy to locate and maintain related code
- Reduces coupling between different plugin features

### 4. **Tool Interface Pattern**

- All tools implement `ToolInterface`
- Consistent API for tool initialization and REST registration
- Extensible architecture for adding new tools

## Key Classes

### Main Plugin Class (`WP_Dev_Toolkit`)

- **Location**: `class-wp-dev-toolkit.php`
- **Pattern**: Singleton
- **Responsibilities**:
  - Plugin initialization and lifecycle management
  - Component coordination and dependency management
  - Global access point for configuration and tools

### Tool System

- **Interface**: `ToolInterface` (contract for all tools)
- **Base Class**: `ToolBase` (common functionality)
- **Factory**: `Factory` (tool instantiation and registration)

### Configuration System

- **Class**: `Config` (settings management)
- **Storage**: WordPress options API
- **Access**: Global via `wp_dev_toolkit()->get_config()`

## Development Workflow

### Adding New Tools

1. Create tool class extending `ToolBase`
2. Implement `ToolInterface` methods
3. Register in `Factory::register_default_tools()`
4. Add configuration keys if needed

### Adding REST Endpoints

1. Create controller extending `REST\Base`
2. Implement required methods
3. Register in `ControllerLoader`
4. Add routes in `register_rest_routes()` method

### Adding Frontend Features

1. Update `Frontend\Assets` for new scripts/styles
2. Add React components in `src/components/`
3. Register routes in `src/App.tsx`

## Documentation Files

- **[AGENTS.md](../AGENTS.md)**: Comprehensive development guidelines for AI coding agents
- **[admin-scope.md](admin-scope.md)**: Admin interface, config, and assets documentation
- **[rest-scope.md](rest-scope.md)**: REST API architecture
- **[tools-scope.md](tools-scope.md)**: Development tools and base classes overview
- **[utilities-scope.md](utilities-scope.md)**: Utility functions and logging

## Standards and Conventions

- **PHP**: PSR-4 autoloading, WordPress Coding Standards
- **JavaScript**: ESLint rules, React best practices
- **CSS**: Tailwind v4 with custom prefix (`wdt`)
- **Git**: Conventional commits with scope-based organization
- **Documentation**: Comprehensive inline docs and external guides

This architecture provides a scalable, maintainable foundation for the WP Dev Toolkit plugin while ensuring clean separation of concerns and consistent development practices.</content>
<parameter name="filePath">resources/docs/index.md
