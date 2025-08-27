# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands for Development

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
- Individual test: `./vendor/bin/phpunit tests/Unit/SpecificTest.php`

## Architecture Overview

### WordPress Plugin Structure
This is a modern WordPress plugin with a React-based admin interface:

**Main Entry Point:** `wp-dev-toolkit.php` - Plugin bootstrap file that:
- Defines plugin constants
- Loads Composer autoloader  
- Initializes the plugin via `WPDevToolkit\Core\Plugin`
- Sets up activation/deactivation hooks

**Core Classes:**
- `WPDevToolkit\Core\Plugin` - Main plugin controller, handles tool registration and REST API
- `WPDevToolkit\Core\Config` - Configuration management
- `WPDevToolkit\Core\Logger` - Centralized logging system
- `WPDevToolkit\Core\Assets` - Asset management for scripts/styles
- `WPDevToolkit\Admin\Menu` - WordPress admin menu integration

**Tool System:**
- Tools implement `WPDevToolkit\Base\ToolInterface`  
- `WPDevToolkit\Tools\Factory` - Creates tool instances
- Built-in tools: ErrorLogger, QueryMonitor, HookInspector
- Tools are registered in `Plugin::init_tools()` and can be added via hooks

**REST API:**
- Base controller: `WPDevToolkit\Rest\Base`
- Controllers in `WPDevToolkit\Rest\Controllers\*`
- All endpoints prefixed with `/wp-dev-toolkit/v1/`
- Permission checks require `manage_options` capability

### Frontend Architecture (React/TypeScript)

**Main App:** `src/App.tsx` - Hash-based router with sidebar navigation
- Uses React Router for client-side routing
- Main layout with sidebar navigation and content area
- Components: Dashboard, ErrorLog, QueryMonitor, HookInspector, Terminal, Settings, SystemInfo

**Styling:** 
- Tailwind CSS with custom prefix `wdt-` to avoid conflicts
- SCSS entry point: `src/styles/index.scss`
- Configuration: `tailwind.config.js` and `postcss.config.js`

**Data Management:**
- WordPress API fetch integration via `@wordpress/api-fetch`
- Custom hook: `src/hooks/useWPDevToolkit.ts`
- Store: `src/store/index.ts`

**Build Process:**
- Webpack configuration in `webpack.config.js`
- Uses `@wordpress/scripts` for WordPress-optimized builds
- TypeScript configuration in `tsconfig.json`

## Code Standards and Quality

### PHP Standards
- Follows WordPress Coding Standards (WPCS)
- PHP 7.4+ compatibility required
- PSR-4 autoloading with `WPDevToolkit\` namespace
- PHPStan level 2 static analysis
- All classes must have proper docblocks and type hints

### TypeScript/JavaScript Standards  
- TypeScript strict mode enabled
- ESLint with WordPress and React rules
- Prettier formatting (2 spaces, single quotes)
- All components must be typed React.FC interfaces
- Use WordPress Components library where possible

### Testing Requirements
- PHP: PHPUnit 9.6+ with coverage reporting
- JavaScript: Jest via `@wordpress/scripts`
- Test directories: `tests/Unit/` and `tests/Integration/`

## Development Workflow

### Adding New Tools
1. Create tool class implementing `ToolInterface` in `includes/Tools/`
2. Add REST controller in `includes/Rest/Controllers/` 
3. Create React component in `src/components/`
4. Register tool in `Plugin::init_tools()` or via `wp_dev_toolkit_tools` filter
5. Add route to `src/App.tsx` router configuration

### Adding REST Endpoints
1. Extend `WPDevToolkit\Rest\Base` in `includes/Rest/Controllers/`
2. Implement `register_routes()` method
3. All endpoints require `manage_options` capability
4. Register controller in `ControllerLoader::get_controllers()`

### Code Quality Checks
Always run before committing:
```bash
npm run lint && npm run check-types
composer run all
```

## Key Configuration Files

- **Package Management:** `package.json`, `composer.json`, `yarn.lock`
- **Build:** `webpack.config.js`, `tsconfig.json`, `postcss.config.js`, `tailwind.config.js`
- **Quality:** `phpcs.xml`, `phpunit.xml`, `phpstan.neon.txt`, `.eslintrc.json`
- **IDE:** `.cursor/rules/` - Language-specific rules for Cursor IDE

## WordPress Integration

### Plugin Constants
- `WP_DEV_TOOLKIT_VERSION` - Plugin version
- `WP_DEV_TOOLKIT_PLUGIN_DIR` - Plugin directory path  
- `WP_DEV_TOOLKIT_PLUGIN_URL` - Plugin URL
- `WP_DEV_TOOLKIT_ASSETS_DIR/URL` - Asset paths

### Hooks and Filters
- `wp_dev_toolkit_init` - Fired after plugin initialization
- `wp_dev_toolkit_tools` - Filter to register additional tools
- `wp_dev_toolkit_daily_event`, `wp_dev_toolkit_weekly_event` - Cron hooks

### Database and Logging
- Configuration stored in `wp_dev_toolkit_config` option
- Logs stored in `wp-content/uploads/wp-dev-toolkit/logs/`
- Log rotation handled by daily cron job

## Security Notes

- All REST endpoints require `manage_options` capability
- Log directory protected with `.htaccess`
- Input sanitization required for all user data
- Nonce verification for admin actions
- No sensitive data should be logged or committed