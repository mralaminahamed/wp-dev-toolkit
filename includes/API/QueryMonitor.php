<?php
namespace WPDevToolkit\API;

class QueryMonitor extends RestBase {
	public function register_routes() {
		register_rest_route($this->namespace, '/queries', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_queries'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'limit' => [
						'default' => 100,
						'sanitize_callback' => 'absint',
					],
					'min_time' => [
						'default' => 0,
						'sanitize_callback' => 'floatval',
					],
					'search' => [
						'default' => '',
					],
				],
			],
		]);

		register_rest_route($this->namespace, '/queries/stats', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_query_stats'],
				'permission_callback' => [$this, 'permission_callback'],
			],
		]);
	}

	public function get_queries($request) {
		global $wpdb;
		$limit = $request->get_param('limit');
		$min_time = $request->get_param('min_time');
		$search = $request->get_param('search');

		$queries = array_filter($wpdb->queries, function($query) use ($min_time, $search) {
			return $query[1] >= $min_time &&
			       (empty($search) || stripos($query[0], $search) !== false);
		});

		$queries = array_slice($queries, 0, $limit);

		$formatted_queries = array_map(function($query) {
			return [
				'sql' => $query[0],
				'time' => $query[1],
				'caller' => $query[2],
				'trace' => $this->get_stack_trace($query[2]),
			];
		}, $queries);

		return $this->send_json_success(['queries' => $formatted_queries]);
	}

	public function get_query_stats() {
		global $wpdb;

		$total_queries = count($wpdb->queries);
		$total_time = array_sum(array_column($wpdb->queries, 1));
		$avg_time = $total_queries > 0 ? $total_time / $total_queries : 0;

		$slow_queries = array_filter($wpdb->queries, function($query) {
			return $query[1] > 1.0; // Consider queries taking more than 1 second as slow
		});

		$stats = [
			'total_queries' => $total_queries,
			'total_time' => $total_time,
			'avg_time' => $avg_time,
			'slow_queries' => count($slow_queries),
			'unique_queries' => count(array_unique(array_column($wpdb->queries, 0))),
		];

		return $this->send_json_success(['stats' => $stats]);
	}

	private function get_stack_trace($caller) {
		if (preg_match('/(?:.*?)(?:\/wp-content\/|\/wp-includes\/)(.*?):\s*(\d+)$/', $caller, $matches)) {
			return [
				'file' => $matches[1],
				'line' => intval($matches[2]),
			];
		}
		return null;
	}

	public function analyze_query_performance($query) {
		// This is a placeholder for query performance analysis
		// In a real-world scenario, you might want to use EXPLAIN or other MySQL tools
		$performance = [
			'issues' => [],
			'suggestions' => [],
		];

		if (stripos($query, 'SELECT *') !== false) {
			$performance['issues'][] = 'Using SELECT * may retrieve unnecessary data';
			$performance['suggestions'][] = 'Specify only the columns you need';
		}

		if (stripos($query, 'ORDER BY RAND()') !== false) {
			$performance['issues'][] = 'ORDER BY RAND() can be slow on large datasets';
			$performance['suggestions'][] = 'Consider alternative methods for random selection';
		}

		// Add more performance checks as needed

		return $performance;
	}
}