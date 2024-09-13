<?php

namespace WPDevToolkit\API;

abstract class RestBase {
	protected $namespace = 'wp-dev-toolkit/v1';

	abstract public function register_routes();

	protected function permission_callback(): bool {
		return current_user_can('manage_options');
	}
}