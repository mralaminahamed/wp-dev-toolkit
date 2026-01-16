# WP Dev Toolkit - Includes Directory

This directory contains all PHP classes for the WP Dev Toolkit plugin, organized by functional scope for improved maintainability and code discovery.

## Directory Structure

```
includes/
├── Admin/           # WordPress admin interface components
├── Frontend/        # Frontend assets and functionality
├── REST/           # REST API controllers and base classes
├── Utilities/      # Helper functions and logging system
├── Tools/          # Development tool implementations
├── Base/           # Base classes and interfaces
└── Core/           # Core functionality (Config.php)
```

## Scope Organization

### Admin (`Admin/`)

Contains WordPress admin interface integration:

- Menu registration and page rendering
- Admin hooks and functionality

### Frontend (`Frontend/`)

Manages frontend assets and client-side functionality:

- Asset registration and enqueuing
- Script localization
- Frontend dependencies

### REST (`REST/`)

Handles all REST API functionality:

- API controllers for each feature
- Base controller classes
- API endpoint management

### Utilities (`Utilities/`)

Shared utility functions and services:

- Logging system
- Helper functions
- Common utilities

### Tools (`Tools/`)

Development tool implementations:

- Error logging, query monitoring, hook inspection
- Tool factory and registration
- Individual tool classes

### Base (`Base/`)

Foundational classes and interfaces:

- ToolInterface (contract for all tools)
- ToolBase (abstract base class)
- Common interfaces

### Core (`Core/`)

Essential plugin functionality:

- Configuration management
- Core plugin systems

## Architecture Notes

- **PSR-4 Autoloading**: All classes follow PSR-4 namespace conventions
- **Global Access**: Use `wp_dev_toolkit()` for accessing main plugin instance
- **Dependency Injection**: Replaced with global access pattern for simplicity
- **Scope Separation**: Clear functional boundaries improve maintainability

## Development Guidelines

- New features should be added to appropriate scope directories
- Follow existing naming conventions and patterns
- Update documentation when adding new functionality
- Use the global `wp_dev_toolkit()` function for plugin access

## See Also

- [AGENTS.md](../AGENTS.md) - Development guidelines for AI coding agents
- [resources/docs/](../resources/docs/) - Detailed scope documentation
