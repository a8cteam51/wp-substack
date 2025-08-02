<?php
/**
 * Block editor functionality
 *
 * @package WPSubstack
 */

namespace WPSubstack;

/**
 * Class Block_Editor
 */
class Block_Editor {

	/**
	 * Initialize the block editor functionality.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Enqueue block editor assets.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		$asset_file = WP_SUBSTACK_PLUGIN_DIR . 'build/js/gutenberg-plugin.asset.php';
		$asset_data = file_exists( $asset_file )
			? require $asset_file
			: array(
				'dependencies' => array( 'wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data' ),
				'version'      => WP_SUBSTACK_VERSION,
			);

		wp_register_script(
			'wp-substack-gutenberg',
			WP_SUBSTACK_PLUGIN_URL . 'build/js/gutenberg-plugin.js',
			$asset_data['dependencies'],
			$asset_data['version'],
			true
		);

		wp_enqueue_script( 'wp-substack-gutenberg' );
	}
}
