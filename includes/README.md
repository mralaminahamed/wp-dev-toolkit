# WordPress Development Toolkit - Core Components

This directory contains the core components of the WordPress Development Toolkit plugin, organized into logical
subdirectories.

## Directory Structure

- `Admin/`: Admin interface components and menu handling
- `Base/`: Base classes and interfaces for tool implementation
- `Core/`: Core functionality including plugin main class and configuration
- `Rest/`: REST API controllers and endpoints
- `Tools/`: Individual developer tools implementation
- `Utilities/`: Helper functions and utility classes

## Organization Philosophy

The codebase follows these design principles:

1. **Separation of Concerns**: Each directory contains components with a specific responsibility
2. **Consistent Namespacing**: Namespaces match directory structure for easier navigation
3. **Extensibility**: Core functionality is designed to be extended through hooks and interfaces
4. **Component-Based Design**: Functionality is broken into discrete, reusable components

## Adding New Tools

To extend the toolkit with new tools:

1. Create a new tool class in the `Tools/` directory that extends `WPDevToolkit\Base\ToolBase`
2. Create a matching REST controller in `Rest/Controllers/` if needed
3. Register your tool in the `init_tools()` method of the `Plugin` class

See the documentation in individual directories for more specific information.
