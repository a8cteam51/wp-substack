<?php
/**
 * Plugin Name:     WordPress to Substack publishing
 * Plugin URI:      https://github.com/a8cteam51/wp-substack
 * Update URI:      https://github.com/a8cteam51/wp-substack/
 * Description:     Publish WordPress posts to Substack
 * Author:          WordPress.com Special Projects Team
 * Author URI:      https://wordpress.com
 * Text Domain:     a8csp-wp-substack
 * Domain Path:     /languages
 * Version:         0.0.1
 *
 * @package         wp-substack
 */

namespace A8CSPWPSubstack;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'A8CSP_WP_SUBSTACK_VERSION', '0.1.0' );
define( 'A8CSP_WP_SUBSTACK_BASENAME', plugin_basename( __FILE__ ) );
define( 'A8CSP_WP_SUBSTACK_DIR_PATH', plugin_dir_path( __FILE__ ) );
define( 'A8CSP_WP_SUBSTACK_DIR_URL', plugin_dir_url( __FILE__ ) );

// Require the main plugin class.
require_once A8CSP_WP_SUBSTACK_DIR_PATH . '/includes/class-plugin.php';
require_once A8CSP_WP_SUBSTACK_DIR_PATH . '/includes/class-settings-page.php';
require_once A8CSP_WP_SUBSTACK_DIR_PATH . '/includes/class-block-editor.php';
require_once A8CSP_WP_SUBSTACK_DIR_PATH . '/includes/class-publications-controller.php';

// Instruct WordPress to fetch update information from GitHub.
add_action(
	'update_plugins_github.com',
	static function ( $update, array $plugin_data, string $plugin_file ) {
		if ( A8CSP_WP_SUBSTACK_BASENAME !== $plugin_file || false !== $update ) {
			return $update;
		}

		$latest_release_info = wp_remote_get( 'https://api.github.com/repos/a8cteam51/wp-substack/releases/latest' );
		if ( is_wp_error( $latest_release_info ) || 200 !== wp_remote_retrieve_response_code( $latest_release_info ) ) {
			return $update;
		}

		$latest_release_info    = json_decode( wp_remote_retrieve_body( $latest_release_info ), true );
		$latest_release_version = ltrim( $latest_release_info['tag_name'], 'v' );
		if ( version_compare( $plugin_data['Version'], $latest_release_version, '<' ) ) {
			$update = array(
				'slug'    => $plugin_data['TextDomain'],
				'version' => $latest_release_version,
				'url'     => $latest_release_info['html_url'],
				'package' => $latest_release_info['assets'][0]['browser_download_url'],
			);
		} else {
			$update = false;
		}

		return $update;
	},
	10,
	3
);

/**
 * Plugin initialization.
 *
 * @return void
 */
function init() {
	// Initialize the main plugin class.
	$plugin = Plugin::get_instance();
	$plugin->init();
}

// Initialize the plugin.
add_action( 'plugins_loaded', __NAMESPACE__ . '\\init' );
