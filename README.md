⚠️ Archived Repository
This repository is no longer maintained and has been archived.
Please visit the actively maintained version here: [WordPress to Substack Plugin](https://github.com/a8cteam51/wp-substack)

# WordPress to Substack Plugin

## Overview

The WordPress to Substack plugin enables seamless content publishing from WordPress to Substack. It allows WordPress users to easily cross-post their content to Substack newsletters without duplicating work or copying and pasting content manually.

**Note:** This plugin requires the [WPSubstack Chrome Extension](https://github.com/a8cteam51/WPSubstackChromeExtension) to work properly. Follow the [Setup Instructions](https://github.com/a8cteam51/WPSubstackChromeExtension#setup-instructions) for installation and usage.

### Key Features

- One-click publishing from WordPress to Substack
- Support for various WordPress block types including paragraphs, headings, images, and videos
- VideoPress integration for video content
- Featured image support
- Debug mode for troubleshooting
- Multiple Substack publication support

## Installation

### Requirements

- WordPress 5.0 or higher
- PHP 7.2 or higher

### Installation Steps

1. Download the plugin's [latest release](https://github.com/a8cteam51/wp-substack/releases/latest/download/wp-substack.zip) ZIP file.
2. In your WordPress admin panel, navigate to Plugins > Add New
3. Click the "Upload Plugin" button at the top of the page
4. Choose the downloaded ZIP file and click "Install Now"
5. After installation, click "Activate Plugin"

## Configuration

1. Navigate to Settings > WP to Substack in your WordPress admin panel
2. Add your Substack publication name(s)
3. Save your settings

## Usage

1. Create or edit a post in WordPress
2. In the right sidebar, locate the "Publish to Substack" panel
3. Select your target Substack publication (if you have multiple)
4. Click "Send to Substack" to publish your content
5. If something isn't working you can check the "Debug" checkbox: it will send extra debugging information to the console on the Substack side of things

## Development

### Setup Development Environment

1. Clone the repository:
   ```
   git clone https://github.com/a8cteam51/wp-substack.git
   cd wp-substack
   ```

2. Install dependencies:
   ```
   composer install
   npm install
   ```

### Build Process

- Development build (with source maps):
   ```
   npm run dev
   ```

- Production build:
   ```
   npm run build
   ```

- Watch for changes during development:
   ```
   npm run watch
   ```

### Project Structure

- `/build` - Compiled JavaScript and CSS files
- `/src` - Source JavaScript and CSS files
- `/includes` - PHP files for the plugin functionality
- `/assets` - Static assets like images and icons

## Troubleshooting

- Enable debug mode in the Substack publication panel to see detailed information about the publishing process
- Check the browser console for any JavaScript errors
- Verify you're logged into Substack in another browser tab
- Verify your publications are properly entered into the plugin settings. Example: `https://mypublicationname.substack.com`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

GPL v2 or later