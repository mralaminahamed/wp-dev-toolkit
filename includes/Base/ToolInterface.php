<?php
/**
 * Tool Interface for WordPress Development Toolkit
 *
 * @package WPDevToolkit\Base
 * @since   1.0.0
 */

namespace WPDevToolkit\Base;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tool Interface
 *
 * Interface that defines the contract for all development tools in the toolkit.
 * All tools must implement these methods to be properly integrated.
 *
 * @package WPDevToolkit\Base
 * @since   1.0.0
 */
interface ToolInterface {

	/**
	 * Initialize the tool
	 *
	 * This method is called during the plugin initialization to set up
	 * the tool's functionality, register hooks, and prepare for operation.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function init(): void;

	/**
	 * Register REST API routes for the tool
	 *
	 * This method should register all REST API endpoints that the tool
	 * needs to communicate with the frontend interface.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function register_rest_routes(): void;
}
