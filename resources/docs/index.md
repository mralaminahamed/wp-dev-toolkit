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
│   ├── components/                # React components
│   ├── stores/                    # WordPress data stores (WC Affiliate patterns)
│   ├── types/                     # TypeScript type definitions
│   └── styles/                    # CSS/SCSS files
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

## Frontend Architecture

### 🎨 **React/TypeScript Frontend** (`src/`)

Modern frontend architecture with WordPress data stores:

#### **Components** (`src/components/`)

- React components for each feature
- TypeScript interfaces for props and state
- Magic UI component library integration (shadcn/ui fallback)

#### **Stores** (`src/stores/`) - WC Affiliate Patterns

- Individual data stores per feature following WooCommerce Affiliate conventions
- WordPress data registry integration
- Async/await actions with operation-specific loading states

#### **Types** (`src/types/`)

- TypeScript type definitions
- Store action types and interfaces
- API response types

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

### 5. **WC Affiliate Store Patterns**

- WordPress data stores following WooCommerce Affiliate conventions
- Async/await actions with granular loading/error states
- Modular architecture with separate stores per feature
- Consistent resolver patterns for data fetching

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

1. Create data store following WC Affiliate patterns in `src/stores/`
2. Register store in `src/stores/index.ts`
3. Add React components in `src/components/`
4. Register routes in `src/App.tsx`
5. Update TypeScript types in `src/types/`

### Adding New Stores

1. Create store directory in `src/stores/{store-name}/`
2. Create `constants.ts` with STORE_NAME and action types
3. Create `actions.ts` with async/await functions using WC Affiliate patterns
4. Create `reducer.ts` with default export and isResolving/errors state
5. Create `selectors.ts` with default export and null checking
6. Create `resolvers.ts` with async API calls (optional)
7. Create `index.ts` to register store with WordPress data registry
8. Import and register store in `src/stores/index.ts`

## Documentation Files

- **[AGENTS.md](../AGENTS.md)**: Comprehensive development guidelines for AI coding agents
- **[admin-scope.md](admin-scope.md)**: Admin interface, config, and assets documentation
- **[frontend-scope.md](frontend-scope.md)**: React/TypeScript frontend and store architecture
- **[rest-scope.md](rest-scope.md)**: REST API architecture
- **[tools-scope.md](tools-scope.md)**: Development tools and base classes overview
- **[utilities-scope.md](utilities-scope.md)**: Utility functions and logging

## Standards and Conventions

- **PHP**: PSR-4 autoloading, WordPress Coding Standards
- **TypeScript**: Strict mode, explicit types, WC Affiliate store patterns
- **JavaScript**: ESLint rules, React best practices, async/await patterns
- **CSS**: Tailwind v4 with custom prefix (`wdt`)
- **Stores**: WC Affiliate patterns with granular operation tracking
- **Git**: Conventional commits with scope-based organization
- **Documentation**: Comprehensive inline docs and external guides

This architecture provides a scalable, maintainable foundation for the WP Dev Toolkit plugin while ensuring clean separation of concerns and consistent development practices.</content>
<parameter name="filePath">resources/docs/index.md
