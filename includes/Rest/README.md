# WP Dev Toolkit REST API Components

This directory contains REST API controllers and base classes for the WordPress Development Toolkit.

## Files

- `Base.php`: Base REST controller class with shared functionality
- `ControllerLoader.php`: Manages registration of all REST controllers

## Controllers

The `Controllers/` subdirectory contains individual REST API controllers:

- `DevMode.php`: Handles development mode settings
- `ErrorLog.php`: Provides error log access and management
- `HookInspector.php`: Exposes WordPress hook information
- `QueryMonitor.php`: Provides database query monitoring
- `Settings.php`: Manages plugin settings
- `Terminal.php`: Provides command execution capabilities

## Purpose

The REST API components provide the backend endpoints that power the React-based admin interface. These controllers
follow REST principles and handle data retrieval, updates, and actions required by the frontend.
