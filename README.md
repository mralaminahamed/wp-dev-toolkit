# WordPress Development Toolkit

WordPress Development Toolkit is a comprehensive plugin designed to assist WordPress developers in their plugin development process. It provides a set of tools and utilities to streamline development, debugging, and performance optimization.

## Features

- Development Mode Toggle
- Error Logging and Viewer
- Database Query Monitor
- WordPress Hook Inspector
- React-based Admin Interface
- REST API Integration
- Extensible Architecture

## Installation

1. Download the plugin zip file or clone the repository into your WordPress plugins directory.
2. Navigate to the plugin directory and run `composer install` to install PHP dependencies.
3. Run `npm install` to install JavaScript dependencies.
4. Run `npm run build` to compile the React application.
5. Activate the plugin through the WordPress admin interface.

## Usage

After activation, you'll find a new "Dev Toolkit" menu item in your WordPress admin panel. From there, you can access various development tools:

1. **Dashboard**: Toggle development mode and view overall statistics.
2. **Error Log**: View and manage the WordPress error log.
3. **Query Monitor**: Inspect database queries made during page loads.
4. **Hook Inspector**: View all WordPress hooks fired during page execution.

## Configuration

You can configure the plugin by modifying the `wp-config.php` file or using the provided Config class:

```php
use WPDevToolkit\Core\Config;

$config = Config::get_instance();
$config->set('dev_mode', true);
$config->set('error_logging', true);
```

## Extending the Toolkit

You can add your own tools to the toolkit using the provided hook:

```php
add_action('wp_dev_toolkit_init', function($plugin) {
    $plugin->register_tool('my_custom_tool', MyCustomTool::class);
});
```

## Contributing

We welcome contributions to the WordPress Development Toolkit! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to get started.

## License

This project is licensed under the GPL v2 or later. See the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/mralaminahamed/wp-dev-toolkit/issues) on our GitHub repository.

## Acknowledgements

This plugin was developed with the help of the WordPress community and uses various open-source libraries and tools. We're grateful for their contributions to the ecosystem.
