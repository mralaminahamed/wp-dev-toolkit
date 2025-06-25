<?php

namespace WPDevToolkit\Base;

/**
 * Tool Interface
 *
 * Interface for all tools in the toolkit
 *
 * @package WPDevToolkit\Base
 */
interface ToolInterface {
	/**
	 * Initialize the tool
	 *
	 * @return void
	 */
	public function init();

	/**
	 * Register REST routes for the tool
	 *
	 * @return void
	 */
	public function register_rest_routes();
}
