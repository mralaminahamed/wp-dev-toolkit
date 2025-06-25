# WordPress Development Toolkit

WordPress Development Toolkit is a comprehensive plugin designed to assist WordPress developers in their plugin development process. It provides a set of tools and utilities to streamline development, debugging, and performance optimization.

## Features

- Development Mode Toggle
- Error Logging and Viewer
- Database Query Monitor
- WordPress Hook Inspector
- Terminal Interface for Commands
- React-based Admin Interface with Tailwind CSS
- REST API Integration
- Extensible Architecture

## Tailwind CSS Configuration

This plugin uses Tailwind CSS 3 with a custom prefix (`wdt-`) to avoid conflicts with WordPress styles. Here's how it's configured:

### Key Features

- Custom prefix (`wdt-`) for all Tailwind classes to prevent conflicts with WordPress core
- Extended color palette based on WordPress admin colors
- Custom fonts matching WordPress admin interface
- PostCSS configuration for optimal processing
- Responsive design utility classes

### Usage Example

```jsx
// Using Tailwind with prefix
<div className="wdt-flex wdt-items-center wdt-gap-3 wdt-p-4">
  <div className="wdt-bg-primary-500 wdt-text-white wdt-p-3 wdt-rounded-lg">
    Primary Color Box
  </div>
</div>
```

### Files

- `tailwind.config.js` - Main Tailwind configuration
- `postcss.config.js` - PostCSS configuration for Tailwind
- `src/styles/index.scss` - Main stylesheet with Tailwind imports and custom styles
- `src/components/TailwindTest.tsx` - Example component demonstrating Tailwind usage

## Installation

1. Download the plugin zip file or clone the repository:
   ```bash
   git clone https://github.com/mralaminahamed/wp-dev-toolkit.git
   ```

2. Navigate to the plugin directory and install dependencies:
   ```bash
   cd wp-dev-toolkit
   composer install
   npm install
   ```

3. Build the assets:
   ```bash
   npm run build
   ```

4. Activate the plugin through the WordPress admin interface.

## Requirements

- WordPress 5.8 or higher
- PHP 7.4 or higher
- Node.js 14 or higher
- Composer

## Usage

After activation, you'll find a new "Dev Toolkit" menu item in your WordPress admin panel. From there, you can access various development tools:

1. **Dashboard**: Toggle development mode and view overall statistics.
2. **Error Log**: View and manage the WordPress error log.
3. **Query Monitor**: Inspect database queries made during page loads.
4. **Hook Inspector**: View all WordPress hooks fired during page execution.
5. **Terminal**: Execute commands in a controlled environment.
6. **Settings**: Configure the toolkit options.

## Configuration

You can configure the plugin through the Settings interface or programmatically:

```php
use WPDevToolkit\Core\Config;

$config = new Config();
$config->update([
    'error_logger' => true,
    'query_monitor' => true,
    'hook_inspector' => true,
]);
```

## Extending the Toolkit

You can add your own tools to the toolkit using the provided hook:

```php
add_action('wp_dev_toolkit_init', function($plugin) {
    $plugin->register_tool('my_custom_tool', MyCustomTool::class);
});
```

Your custom tool class should implement the `WPDevToolkit\Tools\ToolInterface` interface.

## Development

### Frontend Development

The admin interface is built with React and Tailwind CSS:

```bash
# Watch for changes during development
npm run start

# Build for production
npm run build
```

### Backend Development

The plugin follows WordPress coding standards. Run code quality checks with:

```bash
# PHP CodeSniffer
composer run phpcs

# PHPStan analysis
composer run phpstan
```

## Contributing

We welcome contributions to the WordPress Development Toolkit! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to get started.

## License

This project is licensed under the GPL v2 or later. See the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/mralaminahamed/wp-dev-toolkit/issues) on our GitHub repository.

## Acknowledgements

This plugin was developed with the help of the WordPress community and uses various open-source libraries and tools. We're grateful for their contributions to the ecosystem.
