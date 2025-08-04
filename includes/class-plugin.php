<?php
/**
 * Main plugin class
 *
 * This class serves as the main plugin container and holds shared configuration
 * like option names and groups used across the plugin.
 *
 * @package A8CSPWPSubstack
 */

namespace A8CSPWPSubstack;

use A8CSPWPSubstack\Settings_Page;
use A8CSPWPSubstack\Block_Editor;
use A8CSPWPSubstack\Publications_Controller;

/**
 * Main plugin class
 */
class Plugin {
	/**
	 * The single instance of the class.
	 *
	 * @var Plugin|null
	 */
	private static $instance = null;

	/**
	 * Option name for publications.
	 *
	 * @var string
	 */
	public const OPTION_NAME_PUBLICATIONS = 'a8csp_wp_substack_substack_publications';

	/**
	 * Option group name for settings.
	 *
	 * @var string
	 */
	public const OPTION_GROUP = 'a8csp_wp_substack_options_group';

	/**
	 * Settings page instance.
	 *
	 * @var Settings_Page
	 */
	private $settings_page;

	/**
	 * Block editor instance.
	 *
	 * @var Block_Editor
	 */
	private $block_editor;

	/**
	 * Publications controller instance.
	 *
	 * @var Publications_Controller
	 */
	private $publications_controller;

	/**
	 * Protected constructor to prevent creating a new instance of the
	 * class via the `new` operator from outside of this class.
	 */
	protected function __construct() {
	}

	/**
	 * Prevent cloning of the instance.
	 *
	 * @return void
	 */
	protected function __clone() {
	}

	/**
	 * Prevent unserializing of the instance.
	 *
	 * @return void
	 */
	public function __wakeup() {
		throw new \Exception( 'Cannot unserialize singleton' );
	}

	/**
	 * Initialize the plugin.
	 *
	 * @return void
	 */
	public function init() {
		// Initialize components.
		$this->settings_page           = new Settings_Page();
		$this->block_editor            = new Block_Editor();
		$this->publications_controller = new Publications_Controller();

		// Initialize components.
		$this->settings_page->init();
		$this->block_editor->init();
		$this->publications_controller->init();
	}

	/**
	 * Get the plugin instance.
	 *
	 * @return Plugin
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}
