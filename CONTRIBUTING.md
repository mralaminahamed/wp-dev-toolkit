# Contributing to WordPress Development Toolkit

We're excited that you're interested in contributing to the WordPress Development Toolkit! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How to Contribute

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```
   git clone https://github.com/mralaminahamed/wp-dev-toolkit.git
   ```
3. Create a new branch for your feature or bug fix:
   ```
   git checkout -b feature/your-feature-name
   ```
4. Make your changes and commit them with a clear commit message.
5. Push your changes to your fork on GitHub:
   ```
   git push origin feature/your-feature-name
   ```
6. Open a pull request from your fork to the main repository.

## Development Setup

1. Ensure you have Composer and Node.js installed on your system.
2. Install PHP dependencies:
   ```
   composer install
   ```
3. Install JavaScript dependencies:
   ```
   npm install
   ```
4. Run the build process:
   ```
   npm run build
   ```

## Coding Standards

We follow the [WordPress Coding Standards](https://make.wordpress.org/core/handbook/best-practices/coding-standards/) for PHP code and the [WordPress JavaScript Coding Standards](https://make.wordpress.org/core/handbook/best-practices/coding-standards/javascript/) for JavaScript and TypeScript code.

Please ensure your code adheres to these standards before submitting a pull request.

## Testing

We encourage writing unit tests for new features and bug fixes. To run the tests:

1. For PHP tests:
   ```
   composer test
   ```
2. For JavaScript tests:
   ```
   npm test
   ```

## Reporting Bugs

If you encounter a bug, please file an issue on our [GitHub issue tracker](https://github.com/yourusername/wp-dev-toolkit/issues). When filing an issue, please include:

1. A clear, descriptive title
2. A detailed description of the problem
3. Steps to reproduce the issue
4. The expected behavior
5. The actual behavior
6. Your WordPress version and PHP version

## Suggesting Enhancements

We welcome suggestions for new features or enhancements. Please file an issue on our GitHub issue tracker with the "enhancement" label. Provide a clear description of the feature and why it would be beneficial to the project.

## Pull Request Process

1. Ensure your code adheres to the project's coding standards.
2. Update the README.md with details of changes to the interface, if applicable.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
4. Your pull request will be reviewed by the maintainers. They may suggest changes or improvements.
5. Once approved, your pull request will be merged into the main branch.

Thank you for contributing to the WordPress Development Toolkit!