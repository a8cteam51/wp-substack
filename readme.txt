=== WordPress to Substack publishing ===
Contributors: wpspecialprojects
Tags: substack, newsletter, publishing, cross-posting, content-syndication
Requires at least: 5.0
Tested up to: 6.8.1
Requires PHP: 7.2
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Seamlessly publish your WordPress content to Substack newsletters with one click, supporting various content types and multiple publications.

== Description ==

The WordPress to Substack plugin enables seamless content publishing from WordPress to Substack. It allows WordPress users to easily cross-post their content to Substack newsletters without duplicating work or copying and pasting content manually.

**Important Note:** This plugin requires the [WPSubstack Chrome Extension](https://github.com/a8cteam51/WPSubstackChromeExtension) to work properly.

= Key Features =

* One-click publishing from WordPress to Substack
* Support for various WordPress block types including:
  * Paragraphs
  * Headings
  * Images
  * Videos
* VideoPress integration for video content
* Featured image support
* Debug mode for troubleshooting
* Multiple Substack publication support

== Installation ==

1. Download the plugin ZIP file [latest release](https://github.com/a8cteam51/wp-substack/releases/latest/download/wp-substack.zip)
2. In your WordPress admin panel, navigate to Plugins > Add New
3. Click the "Upload Plugin" button at the top of the page
4. Choose the downloaded ZIP file and click "Install Now"
5. After installation, click "Activate Plugin"

= Configuration =

1. Navigate to Settings > WP to Substack in your WordPress admin panel
2. Add your Substack publication name(s)
3. Save your settings

== Usage ==

1. Create or edit a post in WordPress
2. In the right sidebar under **Post**, locate the "Publish to Substack" panel
3. Select your target Substack publication (if you have multiple)
4. Click "Send to Substack" to publish your content

== Frequently Asked Questions ==

= What are the system requirements? =

* WordPress 5.0 or higher
* PHP 7.2 or higher
* A modern web browser (Chrome recommended)

= How do I add multiple Substack publications? =

In the plugin settings, you can add multiple publication URLs, one per line. Example format:
`https://mypublicationname.substack.com`

= Why isn't my content publishing to Substack? =

Make sure you:
* Have installed and configured the WPSubstack Chrome Extension
* Are logged into Substack in another browser tab
* Have properly entered your publication URLs in the plugin settings
* Have enabled debug mode to see detailed information about the publishing process

== Troubleshooting ==

If you encounter issues:

1. Enable debug mode in the Substack publication panel to see detailed information about the publishing process
2. Check the browser console for any JavaScript errors
3. Verify you're logged into Substack in another browser tab
4. Verify your publications are properly entered into the plugin settings (Example: `https://mypublicationname.substack.com`)

== Changelog ==

= 0.1.0 =
* Initial release
* Support for basic content types (paragraphs, headings, images, videos)
* Multiple publication support
* Debug mode
* VideoPress integration
