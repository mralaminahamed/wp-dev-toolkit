<?php
namespace WPDevToolkit\API;

class HookInspector extends RestBase {
	public function register_routes() {
		register_rest_route($this->namespace, '/hooks', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_hooks'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'type' => [
						'default' => 'all',
						'enum' => ['all', 'action', 'filter'],
					],
					'search' => [
						'default' => '',
					],
				],
			],
		]);

		register_rest_route($this->namespace, '/hooks/(?P<hook>[\w-]+)', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_hook_details'],
				'permission_callback' => [$this, 'permission_callback'],
			],
		]);
	}

	public function get_hooks($request) {
		global $wp_filter;
		$type = $request->get_param('type');
		$search = $request->get_param('search');

		$hooks = [];
		foreach ($wp_filter as $tag => $hook_obj) {
			if ($this->should_include_hook($tag, $type, $search)) {
				$hooks[] = [
					'name' => $tag,
					'type' => $this->get_hook_type($tag),
					'callback_count' => count($hook_obj->callbacks),
				];
			}
		}

		return $this->send_json_success(['hooks' => $hooks]);
	}

	public function get_hook_details($request) {
		global $wp_filter;
		$hook_name = $request->get_param('hook');

		if (!isset($wp_filter[$hook_name])) {
			return $this->send_json_error('Hook not found', 404);
		}

		$hook_obj = $wp_filter[$hook_name];
		$callbacks = [];

		foreach ($hook_obj->callbacks as $priority => $priority_callbacks) {
			foreach ($priority_callbacks as $callback) {
				$callbacks[] = [
					'priority' => $priority,
					'callback' => $this->get_callback_name($callback['function']),
					'accepted_args' => $callback['accepted_args'],
				];
			}
		}

		$hook_details = [
			'name' => $hook_name,
			'type' => $this->get_hook_type($hook_name),
			'callbacks' => $callbacks,
		];

		return $this->send_json_success(['hook' => $hook_details]);
	}

	private function should_include_hook($tag, $type, $search) {
		if ($type !== 'all' && $this->get_hook_type($tag) !== $type) {
			return false;
		}
		if ($search && stripos($tag, $search) === false) {
			return false;
		}
		return true;
	}

	private function get_hook_type($tag) {
		return (strpos($tag, 'filter') !== false) ? 'filter' : 'action';
	}

	private function get_callback_name($callback) {
		if (is_string($callback)) {
			return $callback;
		} elseif (is_array($callback)) {
			if (is_object($callback[0])) {
				return get_class($callback[0]) . '->' . $callback[1];
			} else {
				return $callback[0] . '::' . $callback[1];
			}
		} elseif ($callback instanceof \Closure) {
			return 'Closure';
		}
		return 'Unknown';
	}
}