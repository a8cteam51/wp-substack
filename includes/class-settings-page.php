<?php
/**
 * Settings page functionality
 *
 * @package WPSubstack
 */

namespace WPSubstack;

/**
 * Class Settings_Page
 */
class Settings_Page {

	/**
	 * Initialize the settings page.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Add the settings page to the WordPress admin menu.
	 *
	 * @return void
	 */
	public function add_settings_page() {
		add_options_page(
			__( 'WP <-> Substack Settings', 'wp-substack' ),
			__( 'WP <-> Substack Settings', 'wp-substack' ),
			'manage_options',
			'wp_substack-settings',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register settings section and fields.
	 *
	 * @return void
	 */
	public function register_settings() {
		register_setting(
			Plugin::OPTION_GROUP,
			Plugin::OPTION_NAME_PUBLICATIONS,
			array(
				'type'              => 'string',
				'description'       => __( 'Substack publications', 'wp-substack' ),
				'sanitize_callback' => 'sanitize_textarea_field',
				'show_in_rest'      => true,
			)
		);

		add_settings_section(
			'wp_substack_main_section',
			__( 'Substack Publications', 'wp-substack' ),
			array( $this, 'render_section_description' ),
			'wp_substack'
		);

		add_settings_field(
			'substack_publications_field',
			__( 'Your Substack Publications', 'wp-substack' ),
			array( $this, 'render_publications_field' ),
			'wp_substack',
			'wp_substack_main_section'
		);
	}

	/**
	 * Render the settings page.
	 *
	 * @return void
	 */
	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form method="post" action="options.php">
				<?php
				settings_fields( Plugin::OPTION_GROUP );
				do_settings_sections( 'wp_substack' );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Render the section description.
	 *
	 * @return void
	 */
	public function render_section_description() {
		echo '<p>' . esc_html__( 'Enter the URLs of your Substack publications, one per line:', 'wp-substack' ) . '</p>';
	}

	/**
	 * Render the publications field.
	 *
	 * @return void
	 */
	public function render_publications_field() {
		$publications = get_option( Plugin::OPTION_NAME_PUBLICATIONS, '' );
		?>
		<textarea
			id="<?php echo esc_attr( Plugin::OPTION_NAME_PUBLICATIONS ); ?>"
			name="<?php echo esc_attr( Plugin::OPTION_NAME_PUBLICATIONS ); ?>"
			rows="10"
			cols="50"
			class="large-text"
		><?php echo esc_textarea( $publications ); ?></textarea>
		<?php
	}
}
