<?php

namespace WPDevToolkit\Rest\Controllers;

use WPDevToolkit\Rest\Base;

/**
 * Query Monitor REST API Controller
 *
 * @package WPDevToolkit\Rest\Controllers
 */
class QueryMonitor extends Base {
	/**
	 * Register routes for this controller
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route($this->namespace, '/query-monitor', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_queries'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'limit' => [
						'default' => 100,
						'sanitize_callback' => 'absint',
					],
					'order' => [
						'default' => 'time',
						'enum' => ['time', 'caller', 'query'],
					],
					'direction' => [
						'default' => 'desc',
						'enum' => ['asc', 'desc'],
					],
				],
			],
		]);

		register_rest_route($this->namespace, '/query-monitor/settings', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_settings'],
				'permission_callback' => [$this, 'permission_callback'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'update_settings'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'enabled' => [
						'type' => 'boolean',
						'validate_callback' => [$this, 'validate_boolean'],
					],
					'log_threshold' => [
						'type' => 'number',
						'sanitize_callback' => 'absint',
					],
				],
			],
		]);
	}

	/**
	 * Get database queries
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function get_queries($request) {
		global $wpdb;

		$limit = $request->get_param('limit');
		$order = $request->get_param('order');
		$direction = $request->get_param('direction');

		// This is a simplified implementation
		// In a real implementation, we would get the actual queries from the query log
		$queries = $wpdb->queries ?? [];

		// Process and format the queries
		$processed_queries = [];
		foreach ($queries as $query) {
			$processed_queries[] = [
				'query' => $query[0],
				'time' => $query[1],
				'caller' => $query[2],
				'backtrace' => isset($query[4]) ? $query[4] : [],
			];
		}

		// Sort the queries
		if ($order === 'time') {
			usort($processed_queries, function($a, $b) use ($direction) {
				return $direction === 'desc' ? $b['time'] <=> $a['time'] : $a['time'] <=> $b['time'];
			});
		} elseif ($order === 'caller') {
			usort($processed_queries, function($a, $b) use ($direction) {
				return $direction === 'desc' ? strcmp($b['caller'], $a['caller']) : strcmp($a['caller'], $b['caller']);
			});
		} elseif ($order === 'query') {
			usort($processed_queries, function($a, $b) use ($direction) {
				return $direction === 'desc' ? strcmp($b['query'], $a['query']) : strcmp($a['query'], $b['query']);
			});
		}

		// Limit the results
		$processed_queries = array_slice($processed_queries, 0, $limit);

		// Calculate stats
		$total_queries = count($queries);
		$total_time = array_sum(array_column($queries, 1));

		return $this->send_json_success([
			'queries' => $processed_queries,
			'total' => $total_queries,
			'total_time' => $total_time,
			'limit' => $limit,
			'order' => $order,
			'direction' => $direction,
		]);
	}

	/**
	 * Get query monitor settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings() {
		// Implementation details would go here
		return $this->send_json_success([
			'enabled' => true,
			'log_threshold' => 100,
		]);
	}

	/**
	 * Update query monitor settings
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function update_settings($request) {
		$enabled = $request->get_param('enabled');
		$log_threshold = $request->get_param('log_threshold');

		// Implementation details would go here
		$success = true; // Placeholder for actual implementation

		if ($success) {
			return $this->send_json_success([
				'enabled' => $enabled,
				'log_threshold' => $log_threshold,
			]);
		}

		return $this->send_json_error(__('Failed to update settings', 'wp-dev-toolkit'));
	}
}
