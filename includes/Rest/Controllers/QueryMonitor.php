<?php

namespace WPDevToolkit\REST\Controllers;

use WPDevToolkit\REST\Base;

/**
 * Query Monitor REST API Controller
 *
 * @package WPDevToolkit\REST\Controllers
 */
class QueryMonitor extends Base {
	/**
	 * Register routes for this controller
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/query-monitor',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_queries' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'limit'     => array(
							'default'           => 100,
							'sanitize_callback' => 'absint',
						),
						'order'     => array(
							'default' => 'time',
							'enum'    => array( 'time', 'caller', 'query' ),
						),
						'direction' => array(
							'default' => 'desc',
							'enum'    => array( 'asc', 'desc' ),
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/query-monitor/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'enabled'       => array(
							'type'              => 'boolean',
							'validate_callback' => array( $this, 'validate_boolean' ),
						),
						'log_threshold' => array(
							'type'              => 'number',
							'sanitize_callback' => 'absint',
						),
					),
				),
			)
		);
	}

	/**
	 * Get database queries
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function get_queries( $request ) {
		global $wpdb;

		$limit     = $request->get_param( 'limit' );
		$order     = $request->get_param( 'order' );
		$direction = $request->get_param( 'direction' );

		// This is a simplified implementation
		// In a real implementation, we would get the actual queries from the query log
		$queries = $wpdb->queries ?? array();

		// Process and format the queries
		$processed_queries = array();
		foreach ( $queries as $query ) {
			$processed_queries[] = array(
				'query'     => $query[0],
				'time'      => $query[1],
				'caller'    => $query[2],
				'backtrace' => isset( $query[4] ) ? $query[4] : array(),
			);
		}

		// Sort the queries
		if ( $order === 'time' ) {
			usort(
				$processed_queries,
				function ( $a, $b ) use ( $direction ) {
					return $direction === 'desc' ? $b['time'] <=> $a['time'] : $a['time'] <=> $b['time'];
				}
			);
		} elseif ( $order === 'caller' ) {
			usort(
				$processed_queries,
				function ( $a, $b ) use ( $direction ) {
					return $direction === 'desc' ? strcmp( $b['caller'], $a['caller'] ) : strcmp( $a['caller'], $b['caller'] );
				}
			);
		} elseif ( $order === 'query' ) {
			usort(
				$processed_queries,
				function ( $a, $b ) use ( $direction ) {
					return $direction === 'desc' ? strcmp( $b['query'], $a['query'] ) : strcmp( $a['query'], $b['query'] );
				}
			);
		}

		// Limit the results
		$processed_queries = array_slice( $processed_queries, 0, $limit );

		// Calculate stats
		$total_queries = count( $queries );
		$total_time    = array_sum( array_column( $queries, 1 ) );

		return $this->send_json_success(
			array(
				'queries'    => $processed_queries,
				'total'      => $total_queries,
				'total_time' => $total_time,
				'limit'      => $limit,
				'order'      => $order,
				'direction'  => $direction,
			)
		);
	}

	/**
	 * Get query monitor settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings() {
		// Implementation details would go here
		return $this->send_json_success(
			array(
				'enabled'       => true,
				'log_threshold' => 100,
			)
		);
	}

	/**
	 * Update query monitor settings
	 *
	 * @param \WP_REST_Request $request Request object
	 *
	 * @return \WP_REST_Response
	 */
	public function update_settings( $request ) {
		$enabled       = $request->get_param( 'enabled' );
		$log_threshold = $request->get_param( 'log_threshold' );

		// Implementation details would go here
		$success = true; // Placeholder for actual implementation

		if ( $success ) {
			return $this->send_json_success(
				array(
					'enabled'       => $enabled,
					'log_threshold' => $log_threshold,
				)
			);
		}

		return $this->send_json_error( __( 'Failed to update settings', 'wp-dev-toolkit' ) );
	}
}
