# AGENTS.md - WP Dev Toolkit

This file provides comprehensive guidance for AI coding agents working on the WP Dev Toolkit WordPress plugin repository.

## Build/Lint/Test Commands

### Frontend Development (React/TypeScript)

- `npm run dev` - Start development server with hot reloading and type checking
- `npm run start` - Start webpack development server with hot reloading
- `npm run build` - Build production assets
- `npm run check-types` - Run TypeScript type checking without emitting files
- `npm run lint` - Lint TypeScript/JavaScript files
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm test` - Run JavaScript unit tests

### Backend Development (PHP)

- `composer install` - Install PHP dependencies
- `composer test` - Run PHPUnit tests
- `composer run phpcs` - Check PHP code style (WordPress standards)
- `composer run phpcbf` - Auto-fix PHP code style issues
- `composer run phpstan` - Run static analysis
- `composer run all` - Run tests, code style check, and static analysis

### Testing Commands

- `composer test` - PHP unit tests
- `npm test` - JavaScript unit tests
- Individual PHP test: `./vendor/bin/phpunit tests/Unit/SpecificTest.php`
- Individual JS test: `npm test -- --testPathPattern=ComponentName.test.tsx`

### Quality Checks (Pre-commit)

```bash
npm run lint && npm run check-types
composer run all
```

## Code Style Guidelines

### TypeScript/JavaScript Standards

- **Formatting**: 2-space indentation, single quotes, 200 character line width
- **Imports**: Organized in groups (React → External → Internal (@/) → Relative)
- **Types**: Strict TypeScript mode, explicit types required, no `any` except when necessary
- **Components**: Use `React.FC<Interface>` pattern with proper prop interfaces
- **UI Library**: Magic UI as primary, shadcn/ui as fallback (no WordPress components)
- **Stores**: Direct store usage following WC Affiliate patterns
- **Error Handling**: Try-catch blocks with console.error logging, graceful fallbacks
- **Naming**: camelCase for variables/functions, PascalCase for components/classes

### PHP Standards

- **Formatting**: 4-space tabs, 100 character line width, WordPress Coding Standards (WPCS)
- **Namespaces**: PSR-4 with `WPDevToolkit\` prefix
- **Classes**: Proper docblocks, type hints, PHPDoc comments
- **Methods**: camelCase naming, descriptive names, return type declarations
- **Error Handling**: WP_Error objects, proper exception handling
- **Security**: Input sanitization, nonce verification, capability checks

### CSS/Tailwind Standards

- **Prefix**: `wdt:` (Tailwind v4 prefix for WordPress compatibility)
- **Architecture**: Pure Tailwind utility classes with shadcn/ui components
- **Responsive**: Mobile-first approach with Tailwind responsive utilities
- **Custom Properties**: CSS variables for theme tokens in `:root`
- **Preflight**: Disabled to preserve WordPress admin styles

### Import Organization

```typescript
// 1. React imports
import React from "react";

// 2. External dependencies
import axios from "axios";

// 3. UI Components (Magic UI primary, shadcn/ui fallback)
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// 4. Internal modules (@/)
import { STORE_NAME } from "@/stores/settings";
import selectors from "@/stores/settings/selectors";

// 5. Relative imports
import Dashboard from "./components/Dashboard";
```

## Architecture Overview

### WordPress Plugin Structure

- **Entry Point**: `wp-dev-toolkit.php` - Plugin bootstrap with constants and initialization
- **Main Class**: `class-wp-dev-toolkit.php` - Main plugin class following singleton pattern (Composer autoloaded)
- **Global Access**: `wp_dev_toolkit()` function provides access to main plugin instance
- **Dependency Access**: All classes use `wp_dev_toolkit()` to access config and other dependencies
- **Core Classes**: Config, Logger, Assets, Menu in `WPDevToolkit\Admin\`
- **Tool System**: Implements `ToolInterface`, factory pattern for tool registration
- **REST API**: Base controller with `/wp-dev-toolkit/v1/` prefix, `manage_options` capability required

### Frontend Architecture (React/TypeScript)

- **Router**: Hash-based routing with React Router
- **Components**: Dashboard, ErrorLog, QueryMonitor, HookInspector, Terminal, Settings, SystemInfo
- **UI Library**: Magic UI as primary, shadcn/ui as fallback (no WordPress components)
- **Styling**: Tailwind CSS v4 with `wdt:` prefix for WordPress compatibility
- **Data**: WordPress data stores with WC Affiliate patterns, API fetch
- **Build**: @wordpress/scripts with webpack, TypeScript compilation

### Store Architecture (WC Affiliate Patterns)

- **Pattern**: Individual stores per feature following WC Affiliate conventions
- **Structure**: Each store in separate directory with actions, constants, reducer, resolvers, selectors, index
- **Actions**: Async/await functions with dispatch destructuring, operation-specific loading states
- **State**: `isResolving` and `errors` objects for granular operation tracking
- **Selectors**: Default exports with extensive null checking and function syntax
- **Resolvers**: Async API calls with proper error handling

**Store Structure:**

```
src/stores/{store-name}/
├── constants.ts    # Action types and store name
├── actions.ts      # Action creators with API calls
├── reducer.ts      # State reducer (default export)
├── selectors.ts    # State selectors (default export)
├── resolvers.ts    # Data resolvers (default export)
└── index.ts        # Store registration and exports
```

## Development Workflow

### Adding New Tools

1. Create tool class implementing `ToolInterface` in `includes/Tools/`
2. Add REST controller extending `WPDevToolkit\Rest\Base`
3. Create data store following WC Affiliate patterns in `src/stores/`
4. Create React component in `src/components/`
5. Register store in `src/stores/index.ts`
6. Register in `Plugin::init_tools()` or via `wp_dev_toolkit_tools` filter
7. Add route to `src/App.tsx` router configuration

### Adding New Stores

1. Create store directory in `src/stores/{store-name}/`
2. Create `constants.ts` with STORE_NAME and action types
3. Create `actions.ts` with async/await functions using WC Affiliate patterns
4. Create `reducer.ts` with default export and isResolving/errors state
5. Create `selectors.ts` with default export and null checking
6. Create `resolvers.ts` with async API calls (optional)
7. Create `index.ts` to register store with WordPress data registry
8. Import and register store in `src/stores/index.ts`

### Adding REST Endpoints

1. Extend `WPDevToolkit\Rest\Base` in `includes/Rest/Controllers/`
2. Implement `register_routes()` method
3. Require `manage_options` capability for all endpoints
4. Register controller in `ControllerLoader::get_controllers()`

### Component Creation Pattern

```typescript
import React from 'react';

interface ComponentNameProps {
  prop: string;
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop }) => {
  return (
    <div className="wdt-flex wdt-items-center">
      {prop}
    </div>
  );
};

export default ComponentName;
```

### WordPress Integration Patterns

```php
// Global plugin access
$config = wp_dev_toolkit()->get_config();
$tools = wp_dev_toolkit()->get_tools();

// Hook registration
add_action('wp_dev_toolkit_init', [$this, 'initialize']);
add_filter('wp_dev_toolkit_tools', [$this, 'register_tools']);

// REST API endpoint
register_rest_route(
    $this->namespace,
    '/endpoint',
    [
        'methods' => 'GET',
        'callback' => [$this, 'handle_request'],
        'permission_callback' => [$this, 'check_permissions'],
    ]
);
```

## Cursor IDE Rules

### TypeScript Rules

- **Formatter**: 2-space indent, 200 char width, single quotes, trailing commas
- **Import Groups**: React → External → UI Components → Internal → Relative
- **Linting**: ESLint with React hooks, import order, JSX accessibility rules
- **Patterns**: React FC components, WordPress data stores, WordPress API fetch, shadcn/ui components

### PHP Rules

- **Formatter**: 4-space tabs, 100 char width, WordPress standards
- **Linting**: WordPress Coding Standards, array spacing, namespace declarations
- **Patterns**: WordPress hooks, classes, REST controllers, tool classes with proper PHPDoc

### SCSS Rules

- **Formatter**: 2-space indent, 100 char width, single quotes
- **Linting**: Color hex case, indentation, max empty lines, selector notation
- **Patterns**: SCSS mixins, media queries, WordPress admin styles, flexbox containers

### General IDE Settings

- Format on save: enabled
- Organize imports on save: enabled
- Default formatter: Cursor
- Line numbers: enabled
- Word wrap: disabled
- Tab size: 2 spaces
- Bracket pair colorization: enabled

## Security & Best Practices

### WordPress Security

- All REST endpoints require `manage_options` capability
- Input sanitization for all user data
- Nonce verification for admin actions
- No sensitive data logging
- Log directory protected with `.htaccess`

### React/TypeScript Best Practices

- Proper error boundaries with fallback UI
- React hooks rules compliance
- TypeScript strict mode adherence
- Magic UI component library usage
- Accessibility considerations

### PHP Best Practices

- PSR-4 autoloading
- Dependency injection pattern
- Interface implementation
- Proper exception handling
- WordPress action/filter hooks

## File Structure Conventions

```
wp-dev-toolkit/
├── class-wp-dev-toolkit.php    # Main plugin class (Composer autoloaded)
├── includes/                   # PHP classes (PSR-4 autoloaded)
│   ├── Admin/                 # Admin functionality (Config, Assets, Menu)
│   ├── Tools/                 # Tool implementations
│   ├── Rest/Controllers/      # REST API controllers
│   ├── Utilities/             # Utility classes (Helpers, Logger)
│   └── Base/                  # Interfaces and base classes
├── src/                       # React/TypeScript frontend
│   ├── components/            # React components
│   ├── stores/                # WordPress data stores (WC Affiliate patterns)
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # CSS/SCSS files
├── tests/                     # Test files
│   ├── Unit/                  # Unit tests
│   └── Integration/           # Integration tests
├── .cursor/rules/             # IDE configuration
└── resources/                 # Static resources
```

wp-dev-toolkit/ ├── class-wp-dev-toolkit.php # Main plugin class ├── includes/ # PHP classes (PSR-4) │ ├── Admin/ # Admin functionality │ ├── Tools/ # Tool implementations │ ├── Rest/Controllers/ #
REST API controllers │ ├── Utilities/ # Utility classes │ └── Base/ # Interfaces and base classes ├── src/ # React/TypeScript frontend │ ├── components/ # React components │ ├── stores/ # WordPress
data stores hooks │ ├── stores/ # WordPress data stores │ ├── types/ # TypeScript definitions │ └── styles/ # CSS/SCSS files ├── tests/ # Test files │ ├── Unit/ # Unit tests │ └── Integration/ #
Integration tests ├── .cursor/rules/ # IDE configuration └── resources/ # Static resources

```

## Commit Message Conventions

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Maintenance tasks

## Performance Considerations

- **CSS**: Tailwind v4 with tree-shaking for unused styles
- **JavaScript**: Code splitting with dynamic imports, modular store architecture
- **PHP**: Efficient database queries, proper caching strategies
- **Assets**: Optimized bundling with @wordpress/scripts
- **Stores**: WC Affiliate patterns with granular operation tracking
- **Images**: Lazy loading and proper sizing

Always run quality checks before committing and ensure all tests pass.
```
