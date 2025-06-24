# WP Dev Toolkit Tools

This directory contains the core toolkit functionality implemented as individual tool classes.

## Files

- `ErrorLogger.php`: Provides error logging and display functionality
- `Factory.php`: Factory class for creating tool instances
- `HookInspector.php`: Monitors and exposes WordPress hook usage
- `QueryMonitor.php`: Tracks and analyzes database queries

## Purpose

The Tools directory contains the actual developer tools that make up the WP Dev Toolkit. Each tool:

1. Implements the ToolInterface from the Base namespace
2. Extends ToolBase to inherit common functionality
3. Provides both backend logic and REST API endpoints for the tool's functionality
4. Can be enabled/disabled independently through the plugin settings

Tool classes are responsible for collecting data, providing functionality, and exposing their capabilities through REST endpoints that the frontend can consume.
