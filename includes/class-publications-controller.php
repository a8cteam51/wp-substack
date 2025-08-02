<?php
/**
 * Publications controller functionality
 *
 * @package WPSubstack
 */

namespace WPSubstack;

use WP_REST_Response;

/**
 * Class Publications_Controller
 */
class Publications_Controller {

	/**
	 * Initialize the controller.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			'wp/v2',
			'/substack_publications',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_publications' ),
				'permission_callback' => array( $this, 'check_permissions' ),
			)
		);
	}

	/**
	 * Check if user has permission to access the endpoint.
	 *
	 * @return bool
	 */
	public function check_permissions() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Get the list of Substack publications.
	 *
	 * @return WP_REST_Response
	 */
	public function get_publications() {
		$publications     = get_option( Plugin::OPTION_NAME_PUBLICATIONS, '' );
		$publication_list = array_filter( array_map( 'trim', explode( "\n", $publications ) ) );

		return rest_ensure_response( $publication_list );
	}
}
