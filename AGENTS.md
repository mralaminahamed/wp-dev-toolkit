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
- **Imports**: Organized in groups (React → WordPress → External → Internal → Relative)
- **Types**: Strict TypeScript mode, explicit types required, no `any` except when necessary
- **Components**: Use `React.FC<Interface>` pattern with proper prop interfaces
- **Hooks**: Custom hooks prefixed with `use`, follow Rules of Hooks
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

- **Prefix**: `wdt` (Tailwind v4 prefix for WordPress compatibility)
- **Architecture**: BEM-style naming with `wp-dev-toolkit-` prefix for components
- **Responsive**: Mobile-first approach with Tailwind responsive utilities
- **Custom Properties**: CSS variables for theme tokens in `:root`
- **Preflight**: Disabled to preserve WordPress admin styles

### Import Organization

```typescript
// 1. React imports
import React from 'react';

// 2. WordPress imports
import { Button } from '@wordpress/components';

// 3. External dependencies
import axios from 'axios';

// 4. Internal modules (@/)
import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';

// 5. Relative imports
import Dashboard from './components/Dashboard';
```

## Architecture Overview

### WordPress Plugin Structure

- **Entry Point**: `wp-dev-toolkit.php` - Plugin bootstrap with constants and initialization
- **Main Class**: `class-wp-dev-toolkit.php` - Main plugin class following singleton pattern (autoloaded)
- **Global Access**: `wp_dev_toolkit()` function provides access to main plugin instance
- **Dependency Access**: All classes use `wp_dev_toolkit()` to access config and other dependencies
- **Core Classes**: Config, Logger, Assets, Menu in `WPDevToolkit\Core\`
- **Tool System**: Implements `ToolInterface`, factory pattern for tool registration
- **REST API**: Base controller with `/wp-dev-toolkit/v1/` prefix, `manage_options` capability required

### Frontend Architecture (React/TypeScript)

- **Router**: Hash-based routing with React Router
- **Components**: Dashboard, ErrorLog, QueryMonitor, HookInspector, Terminal, Settings, SystemInfo
- **Styling**: Tailwind CSS v4 with CSS-first configuration
- **Data**: WordPress API fetch, custom hooks, Zustand store
- **Build**: @wordpress/scripts with webpack, TypeScript compilation

## Development Workflow

### Adding New Tools

1. Create tool class implementing `ToolInterface` in `includes/Tools/`
2. Add REST controller extending `WPDevToolkit\Rest\Base`
3. Create React component in `src/components/`
4. Register in `Plugin::init_tools()` or via `wp_dev_toolkit_tools` filter
5. Add route to `src/App.tsx` router configuration

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
- **Import Groups**: React → WordPress → External → Internal → Relative
- **Linting**: ESLint with React hooks, import order, JSX accessibility rules
- **Patterns**: React FC components, custom hooks, WordPress API fetch, WordPress components

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
- WordPress component library usage
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
│   ├── Core/                  # Core functionality
│   ├── Tools/                 # Tool implementations
│   ├── Rest/Controllers/      # REST API controllers
│   └── Base/                  # Interfaces and base classes
├── src/                       # React/TypeScript frontend
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # State management
│   └── styles/                # CSS/SCSS files
├── tests/                     # Test files
│   ├── Unit/                  # Unit tests
│   └── Integration/           # Integration tests
├── .cursor/rules/             # IDE configuration
└── resources/                 # Static resources
```

wp-dev-toolkit/ ├── class-wp-dev-toolkit.php # Main plugin class ├── includes/ # PHP classes (PSR-4) │ ├── Core/ # Core functionality │ ├── Tools/ # Tool implementations │ ├── Rest/Controllers/ # REST
API controllers │ └── Base/ # Interfaces and base classes ├── src/ # React/TypeScript frontend │ ├── components/ # React components │ ├── hooks/ # Custom React hooks │ ├── store/ # State management │
└── styles/ # CSS/SCSS files ├── tests/ # Test files │ ├── Unit/ # Unit tests │ └── Integration/ # Integration tests ├── .cursor/rules/ # IDE configuration └── resources/ # Static resources

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
- **JavaScript**: Code splitting with dynamic imports where appropriate
- **PHP**: Efficient database queries, proper caching strategies
- **Assets**: Optimized bundling with @wordpress/scripts
- **Images**: Lazy loading and proper sizing

Always run quality checks before committing and ensure all tests pass.
```
