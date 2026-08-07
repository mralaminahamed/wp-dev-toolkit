<div align="center">

# WordPress Development Toolkit — Developer Guide

**Error log, query monitor and hook inspector behind one React admin — and a registry that lets a plugin add a fourth tool without touching this one.**

[![Version](https://img.shields.io/badge/version-1.0.0-2563eb.svg)](https://github.com/mralaminahamed/wp-dev-toolkit)
[![WordPress](https://img.shields.io/badge/WordPress-5.8%2B-21759b.svg?logo=wordpress&logoColor=white)](https://wordpress.org/)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777BB4.svg?logo=php&logoColor=white)](https://php.net/)
[![License: GPL-2.0-or-later](https://img.shields.io/badge/License-GPL--2.0--or--later-green.svg)](LICENSE)

</div>

## What it is

Debugging a WordPress site means three habits: reading the error log, watching
what the page asked the database, and finding out which callback is on the hook
that is misbehaving. Each has a plugin of its own, each brings its own admin
page, and none of them agrees with the others about where anything lives.

This is those three behind one screen. The part that matters architecturally is
that "those three" is not a fixed list: a tool is any class implementing a
two-method interface, the factory holds a registry of them, and
`wp_dev_toolkit_default_tools` lets another plugin add its own — which then
appears in the same UI, with the same REST plumbing, without this plugin knowing
its name.

## Features

- **Error logger** — read and filter the log without SSH
- **Query monitor** — what the request asked the database, and how long it took
- **Hook inspector** — what is attached to a hook, in priority order
- **React admin** for all three, so a tool ships a UI without building an admin page
- **Extensible** — register a tool from your own plugin through one filter
- REST routes per tool, declared by the tool itself

## Requirements

- WordPress 5.8+
- PHP 7.4+

Development additionally needs Node for the admin bundle.

## Installation

```bash
git clone https://github.com/mralaminahamed/wp-dev-toolkit.git
cd wp-dev-toolkit
composer install
yarn install && yarn build
```

## Development

```bash
composer phpcs      # WordPress coding standards
composer phpcbf     # auto-fix what it can
composer phpstan    # static analysis
composer test       # PHPUnit

yarn dev            # asset watch
yarn build          # production bundle
yarn check-types    # tsc --noEmit
yarn lint           # ESLint
yarn test           # Jest
```

## Architecture

```
wp-dev-toolkit.php            entry point and constants
class-wp-dev-toolkit.php      singleton; boots the admin and the tools
includes/
├── Tools/
│   ├── ToolInterface.php     init() and register_rest_routes() — the entire contract
│   ├── ToolBase.php          shared behaviour for the tools that want it
│   ├── Factory.php           the registry: register(), create(), get_registered_tools()
│   ├── ErrorLogger.php
│   ├── QueryMonitor.php
│   └── HookInspector.php
├── Admin/
│   ├── Menu.php              the admin page
│   ├── Assets.php            the React bundle
│   └── Config.php            what the frontend is told about the tools
└── Utilities/Helpers.php
resources/docs/               scope notes — see Documentation below
```

### A tool is two methods

```php
interface ToolInterface {
    public function init(): void;
    public function register_rest_routes(): void;
}
```

That is the whole contract. A tool sets up its own hooks and declares its own
REST routes; nothing else in the plugin knows what any particular tool does. The
factory validates on registration — the class must exist and must implement the
interface — so a typo in a third-party registration fails at registration with a
clear exception rather than fataling later on a missing method.

### Adding a tool from another plugin

```php
add_filter( 'wp_dev_toolkit_default_tools', function ( array $tools ) {
    $tools['my_tool'] = My_Plugin\\Tools\\My_Tool::class;
    return $tools;
} );
```

The filter runs over the default map before anything is registered, so a third
party can add to it, replace one of the built-ins, or remove one entirely by
unsetting its key.

### Data

No custom tables. The tools read what WordPress and the database already expose —
the log file, the query log, the global hook array — and store nothing of their
own, which is what makes the plugin safe to deactivate on a site that is
misbehaving.

## Documentation

Scope notes for each layer live in [`resources/docs/`](resources/docs/index.md):
[tools](resources/docs/tools-scope.md) ·
[admin](resources/docs/admin-scope.md) ·
[REST](resources/docs/rest-scope.md) ·
[frontend](resources/docs/frontend-scope.md)

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and the
[code of conduct](CODE_OF_CONDUCT.md).

## License

GPL-2.0-or-later. See [`LICENSE`](LICENSE).
