<?php
/**
 * Plugin Name:     WordPress to Substack publishing
 * Plugin URI:      https://github.com/a8cteam51/wp-substack
 * Description:     Publish WordPress posts to Substack
 * Author:          WordPress.com Special Projects Team
 * Author URI:      https://wordpress.com
 * Text Domain:     wp-substack
 * Domain Path:     /languages
 * Version:         0.1.0
 *
 * @package         wp-substack
 */

namespace WPSubstack;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Require the main plugin class.
require_once __DIR__ . '/includes/class-plugin.php';
require_once __DIR__ . '/includes/class-settings-page.php';
require_once __DIR__ . '/includes/class-block-editor.php';
require_once __DIR__ . '/includes/class-publications-controller.php';

/**
 * Plugin initialization.
 *
 * @return void
 */
function init() {
	// Define plugin constants.
	define( 'WP_SUBSTACK_VERSION', '0.1.0' );
	define( 'WP_SUBSTACK_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
	define( 'WP_SUBSTACK_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

	// Initialize the main plugin class.
	$plugin = Plugin::get_instance();
	$plugin->init();
}

// Initialize the plugin.
add_action( 'plugins_loaded', __NAMESPACE__ . '\\init' );
