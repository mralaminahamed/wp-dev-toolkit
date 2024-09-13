<?php
namespace WPDevToolkit\API;

use WP_REST_Request;
use WP_REST_Response;
use Psy\Shell;

class Terminal extends RestBase {
	public function register_routes() {
		register_rest_route($this->namespace, '/terminal', [
			[
				'methods' => 'POST',
				'callback' => [$this, 'execute_code'],
				'permission_callback' => [$this, 'permission_callback'],
				'args' => [
					'code' => [
						'required' => true,
						'type' => 'string',
					],
				],
			],
		]);
	}

	public function execute_code(WP_REST_Request $request) {
		$code = $request->get_param('code');

		// Create a new PsySH shell instance
		$shell = new Shell();

		// Capture the output
		ob_start();
		$shell->execute($code);
		$output = ob_get_clean();

		return new WP_REST_Response([
			'output' => $output,
		]);
	}
}