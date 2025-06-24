# WP Dev Toolkit REST API Controllers

This directory contains individual REST API controllers for the WordPress Development Toolkit.

## Controllers

- `DevMode.php`: Manages development mode settings and state
- `ErrorLog.php`: Provides access to error logs with filtering and clearing capabilities
- `HookInspector.php`: Exposes WordPress hooks and their callbacks
- `QueryMonitor.php`: Tracks and analyzes database queries 
- `Settings.php`: Manages global plugin settings
- `Terminal.php`: Provides secure command execution capabilities

## Adding New Controllers

To add a new REST API controller:

1. Create a new controller class that extends `WPDevToolkit\Rest\Base`
2. Implement the required methods including `register_routes()`
3. Register the controller in `WPDevToolkit\Rest\ControllerLoader`

## Security Considerations

All controllers should:

1. Use the `permission_callback` method to verify user capabilities
2. Validate and sanitize all input parameters
3. Follow REST API best practices for responses
