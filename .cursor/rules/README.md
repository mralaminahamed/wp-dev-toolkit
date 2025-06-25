# WP Dev Toolkit Cursor Rules

This directory contains configuration rules for the Cursor IDE to enhance your development experience with the WordPress Development Toolkit plugin.

## Available Rules

- **PHP Rules** (`php.json`): Formatting and linting rules for PHP files following WordPress coding standards
- **TypeScript Rules** (`typescript.json`): Rules for TypeScript and React components
- **JavaScript Rules** (`javascript.json`): Rules for JavaScript files
- **SCSS Rules** (`scss.json`): Rules for SCSS/CSS styling
- **JSON Rules** (`json.json`): Formatting rules for JSON files
- **Markdown Rules** (`markdown.json`): Formatting rules for Markdown files
- **Config** (`config.json`): Main Cursor configuration

## Code Snippets

The rules include helpful code snippets for common patterns:

### PHP Snippets

- WordPress Hook
- WordPress Class
- WordPress Tool Class
- WordPress REST Controller
- WordPress Function

### TypeScript/React Snippets

- React Functional Component
- React Hook
- WordPress API Fetch
- WordPress Component

### SCSS Snippets

- SCSS Mixin
- SCSS Media Query
- WordPress Admin Styles
- Flexbox Container

### JavaScript Snippets

- WordPress AJAX Request
- WordPress DOM Ready
- WordPress Localized Script
- Event Listener

### Markdown Snippets

- WordPress Plugin Header
- Code Block
- Feature List

## Formatting Rules

The formatting rules are set to match the project's existing code style:

- PHP: 4-space tabs, 100 character line width
- TypeScript/JavaScript: 2-space indentation, single quotes, 200 character line width
- SCSS: 2-space indentation, 100 character line width
- JSON: 2-space indentation, 100 character line width
- Markdown: 100 character line width

## Import Organization

Imports are automatically organized into groups:

1. Built-in modules (React)
2. WordPress modules (@wordpress/*)
3. External dependencies
4. Internal modules (@/*)
5. Relative imports

## Linting Rules

Linting rules are configured to enforce code quality and consistency:

- PHP: WordPress coding standards
- TypeScript/JavaScript: ESLint rules aligned with the project's .eslintrc.js
- SCSS: StyleLint rules for consistent styling 