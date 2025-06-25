<?php

// src/Tools/QueryMonitor.php
namespace WPDevToolkit\Tools;

use WP_REST_Server;
use WPDevToolkit\Base\ToolBase;
use function add_filter;
use function current_user_can;
use function register_rest_route;
use function rest_ensure_response;
use function set_transient;

class QueryMonitor extends ToolBase {
	const TOOL_KEY = 'query_monitor';

	private $queries = array();

	public function init() {
		if ( $this->is_enabled() ) {
			add_filter( 'query', array( $this, 'log_query' ) );
		}
	}

	public function register_rest_routes() {
		register_rest_route(
			'wp-dev-toolkit/v1',
			'/queries',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_queries' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
			)
		);
	}

	public function log_query( $query ) {
		$this->queries[] = $query;
		return $query;
	}

	public function get_queries() {
		$cached_queries = $this->get_cached_data( 'queries' );
		if ( $cached_queries !== null ) {
			return rest_ensure_response( array( 'queries' => $cached_queries ) );
		}

		$this->set_cached_data( 'queries', $this->queries );
		return rest_ensure_response( array( 'queries' => $this->queries ) );
	}

	public function check_admin_permissions() {
		return current_user_can( 'manage_options' );
	}

	private function get_cached_data( $key ) {
		$cache = get_transient( 'wp_dev_toolkit_' . $key );
		if ( $cache === false ) {
			return null;
		}
		return $cache;
	}

	private function set_cached_data( $key, $data, $expiration = 300 ) {
		set_transient( 'wp_dev_toolkit_' . $key, $data, $expiration );
	}
}
