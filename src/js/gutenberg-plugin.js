import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { Button, SelectControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';

// Function to fetch video details from the API
const fetchVideoDetails = async (videoMediaId) => {
    try {
        const response = await wp.apiFetch({ path: `/wp/v2/media/${videoMediaId}` });
        return response;
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null;  // Fallback in case of an error
    }
};

// Function to fetch the image and convert it to base64
const fetchImageAsBase64 = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // This is the base64 string
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Function to check if HTML content contains images
const containsImages = (htmlContent) => {
    return htmlContent.includes('<img');
};

// Function to process all images in HTML content and convert them to base64
const processImagesInHtml = async (htmlContent) => {
    
    // Quick check - if no img tags, return original content
    if (!containsImages(htmlContent)) {
        return htmlContent;
    }
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Find all img elements
    const imgElements = tempDiv.querySelectorAll('img');
    
    // Process each image
    for (const img of imgElements) {
        const originalSrc = img.src;
        
        // Skip if it's already a base64 image or if it's empty
        if (!originalSrc || originalSrc.startsWith('data:')) {
            continue;
        }
        
        try {
            console.log('Processing image in HTML:', originalSrc);
            const base64Image = await fetchImageAsBase64(originalSrc);
            img.src = base64Image;
            console.log('Successfully converted image to base64');
        } catch (error) {
            console.error('Error converting image to base64:', error);
            // Leave original URL as fallback
        }
    }
    
    return tempDiv.innerHTML;
};

// Function to process image blocks and convert them to base64
const processBlocks = async (blocks) => {
    let content = '';

    for (const block of blocks) {
        switch (block.name) {
            case 'core/paragraph':
                content += `<p>${block.attributes.content}</p>\n\n`;
                break;
            case 'core/heading':
                const headingLevel = block.attributes.level || 2; // Default to h2 if level not specified
                content += `<h${headingLevel}>${block.attributes.content}</h${headingLevel}>\n\n`;
                break;
            case 'core/image':
                const imageUrl = block.attributes.url;
                try {
                    const base64Image = await fetchImageAsBase64(imageUrl);
                    content += `<img src="${base64Image}" alt="Image" />\n\n`;
                } catch (error) {
                    console.error('Error processing image block:', error);
                    content += `<img src="${imageUrl}" alt="Image" />\n\n`;  // Fallback to original URL
                }
                break;
            case 'wp:videopress/video':
            case 'videopress/video':
                const videoData = block.attributes;
                let videoSrc = '';

                if (videoData.src) {
                    videoSrc = videoData.src;
                } else if (videoData.id) {
                    const videoDetails = await fetchVideoDetails(videoData.id);
                    if ( videoDetails && videoDetails.source_url ) {
                        videoSrc = videoDetails.source_url;  // Use URL from API response
                    }
                }

                if (videoSrc) {
                    content += `<video src="${videoSrc}" controls></video>\n\n`;
                } else {
                    console.warn('VideoPress block found, but no video source available');
                }
                break;
            case 'core/video':
                const videoUrl = block.attributes.src;
                content += `<video src="${videoUrl}" controls></video>\n\n`;
                break;
            case 'core/pullquote':
                // For pullquotes, we need to extract from block attributes
                let pullquoteContent = '';
                let citation = '';
                
                // Debug: Log the entire block to see what data is available
                console.log('Pullquote block data:', block);
                console.log('Block innerHTML:', block.innerHTML);
                console.log('Block attributes:', block.attributes);
                console.log('Block innerBlocks:', block.innerBlocks);
                
                // Extract the main content from block.attributes.value
                if (block.attributes.value) {
                    console.log('Using attributes.value method');
                    // Value might be a string or an object with originalHTML
                    if (typeof block.attributes.value === 'string') {
                        pullquoteContent = block.attributes.value.trim();
                    } else if (block.attributes.value.originalHTML) {
                        pullquoteContent = block.attributes.value.originalHTML.trim();
                    } else {
                        pullquoteContent = block.attributes.value.toString().trim();
                    }
                    console.log('Extracted value content:', pullquoteContent);
                }
                
                // Extract citation from block.attributes.citation
                if (block.attributes.citation) {
                    // Citation might be a string or an object with originalHTML
                    if (typeof block.attributes.citation === 'string') {
                        citation = block.attributes.citation.trim();
                    } else if (block.attributes.citation.originalHTML) {
                        citation = block.attributes.citation.originalHTML.trim();
                    } else {
                        citation = block.attributes.citation.toString().trim();
                    }
                    console.log('Extracted citation:', citation);
                }
                
                console.log('Final pullquote content:', pullquoteContent);
                console.log('Final citation:', citation);
                
                // Add citation if it exists, formatted with a dash separator and emphasized
                if (citation.trim() !== '') {
                    pullquoteContent += ` <p><em> ${citation}</em></p>`;
                }
                
                console.log('Final combined content:', pullquoteContent);
                
                // Wrap in a blockquote for consistent handling with regular quotes
                content += `<blockquote class="wp-block-quote"><p>${pullquoteContent}</p></blockquote>\n\n`;
                break;
            case 'core/embed':
                // For embeds, extract the URL and output as plain text for Substack to auto-convert
                let embedUrl = '';
                
                // Try to get URL from block attributes first
                if (block.attributes && block.attributes.url) {
                    embedUrl = block.attributes.url;
                    console.log('Found embed URL in attributes:', embedUrl);
                } else if (block.innerHTML && block.innerHTML.trim() !== '') {
                    // Fallback: extract URL from the HTML content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = block.innerHTML;
                    
                    // Look for URL in the wrapper div
                    const wrapperDiv = tempDiv.querySelector('.wp-block-embed__wrapper');
                    if (wrapperDiv) {
                        embedUrl = wrapperDiv.textContent.trim();
                        console.log('Found embed URL in HTML wrapper:', embedUrl);
                    }
                }
                
                console.log('Final embed URL:', embedUrl);
                
                // Output the URL wrapped in paragraph tags for consistent processing
                if (embedUrl) {
                    content += `<p>${embedUrl}</p>\n\n`;
                } else {
                    console.log('No embed URL found, skipping embed block');
                }
                break;
            case 'core/list':
                const listType = block.attributes.ordered ? 'ol' : 'ul';
                
                // Recursive function to process list items and their nested lists
                const processListItems = (listItems) => {
                    let itemsContent = '';
                    
                    for (const listItem of listItems) {
                        if (listItem.name === 'core/list-item') {
                            let itemContent = listItem.attributes.content || '';
                            
                            // Check if this list item has nested lists
                            if (listItem.innerBlocks && listItem.innerBlocks.length > 0) {
                                for (const nestedBlock of listItem.innerBlocks) {
                                    if (nestedBlock.name === 'core/list') {
                                        const nestedListType = nestedBlock.attributes.ordered ? 'ol' : 'ul';
                                        const nestedItems = processListItems(nestedBlock.innerBlocks);
                                        itemContent += `\n<${nestedListType}>\n${nestedItems}</${nestedListType}>`;
                                    }
                                }
                            }
                            
                            itemsContent += `<li>${itemContent}</li>\n`;
                        }
                    }
                    
                    return itemsContent;
                };
                
                let listContent = `<${listType}>\n`;
                
                // Process all list items
                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    listContent += processListItems(block.innerBlocks);
                }
                
                listContent += `</${listType}>\n\n`;
                content += listContent;
                break;
            case 'core/buttons':
                // Handle button blocks - extract button information and pass to Chrome extension
                console.log('Processing buttons block:', block);
                
                // Process each button in the buttons block
                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    for (const buttonBlock of block.innerBlocks) {
                        if (buttonBlock.name === 'core/button') {
                            console.log('Processing button block:', buttonBlock);
                            
                            let buttonText = '';
                            let buttonUrl = '';
                            
                            // Extract button text from content
                            if (buttonBlock.attributes && buttonBlock.attributes.text) {
                                buttonText = buttonBlock.attributes.text;
                            }
                            
                            // Extract button URL
                            if (buttonBlock.attributes && buttonBlock.attributes.url) {
                                buttonUrl = buttonBlock.attributes.url;
                            }
                            
                            console.log('Button details:', { text: buttonText, url: buttonUrl });
                            
                            if (buttonText && buttonUrl) {
                                // Create a special div with class to trigger button creation in Chrome extension
                                content += `<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${buttonUrl}">${buttonText}</a></div>\n\n`;
                            }
                        }
                    }
                } else {
                    // Fallback to raw content if no inner blocks
                    const rawContent = wp.blocks.serialize([block]);
                    content += `${rawContent}\n\n`;
                }
                break;
            case 'core/button':
                // Handle individual button blocks
                console.log('Processing individual button block:', block);
                
                let buttonText = '';
                let buttonUrl = '';
                
                // Extract button text from content
                if (block.attributes && block.attributes.text) {
                    buttonText = block.attributes.text;
                }
                
                // Extract button URL
                if (block.attributes && block.attributes.url) {
                    buttonUrl = block.attributes.url;
                }
                
                console.log('Individual button details:', { text: buttonText, url: buttonUrl });
                
                if (buttonText && buttonUrl) {
                    // Create a special div with class to trigger button creation in Chrome extension
                    content += `<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${buttonUrl}">${buttonText}</a></div>\n\n`;
                } else {
                    // Fallback to raw content
                    const rawContent = wp.blocks.serialize([block]);
                    content += `${rawContent}\n\n`;
                }
                break;
            case 'core/file':
                // Handle file download blocks
                console.log('Processing file block:', block);
                
                let fileUrl = '';
                let fileName = '';
                let showDownloadButton = true; // Default to true
                
                // Extract file information from block attributes
                if (block.attributes) {
                    fileUrl = block.attributes.href || '';
                    fileName = block.attributes.fileName || '';
                    showDownloadButton = block.attributes.showDownloadButton !== false; // Check explicitly for false
                }
                
                // If we don't have the data from attributes, try to extract from innerHTML
                if (!fileUrl || !fileName) {
                    console.log('Extracting file info from innerHTML');
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = block.innerHTML;
                    
                    const firstLink = tempDiv.querySelector('a');
                    if (firstLink) {
                        fileUrl = firstLink.getAttribute('href') || fileUrl;
                        fileName = firstLink.textContent.trim() || fileName;
                    }
                    
                    // Check if there's a download button in the HTML
                    const downloadButton = tempDiv.querySelector('.wp-block-file__button');
                    showDownloadButton = !!downloadButton;
                }
                
                console.log('File details:', { url: fileUrl, name: fileName, hasButton: showDownloadButton });
                
                if (fileUrl && fileName) {
                    if (showDownloadButton) {
                        // Convert to button format for Chrome extension to handle
                        content += `<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${fileUrl}">${fileName}</a></div>\n\n`;
                    } else {
                        // Convert to simple link
                        content += `<p><a href="${fileUrl}">${fileName}</a></p>\n\n`;
                    }
                } else {
                    // Fallback to raw content if extraction fails
                    console.log('Failed to extract file info, using raw content');
                    const rawContent = wp.blocks.serialize([block]);
                    content += `${rawContent}\n\n`;
                }
                break;
            case 'core/html':
                // Handle custom HTML blocks
                console.log('Processing HTML block:', block);
                
                let htmlContent = '';
                
                // Extract HTML content from block attributes
                if (block.attributes && block.attributes.content) {
                    htmlContent = block.attributes.content.trim();
                    console.log('HTML content from attributes:', htmlContent);
                } else if (block.innerHTML && block.innerHTML.trim() !== '') {
                    // Fallback: extract from innerHTML
                    htmlContent = block.innerHTML.trim();
                    console.log('HTML content from innerHTML:', htmlContent);
                }
                
                if (htmlContent) {
                    // Check if content is already wrapped in block-level tags
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;
                    
                    // Check if the first child is a block-level element
                    const firstChild = tempDiv.firstChild;
                    const blockLevelTags = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'li', 'section', 'article', 'header', 'footer', 'main', 'aside'];
                    
                    let needsWrapping = true;
                    if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE) {
                        const tagName = firstChild.tagName.toLowerCase();
                        if (blockLevelTags.includes(tagName) && tempDiv.children.length === 1) {
                            needsWrapping = false;
                            console.log('HTML content already properly wrapped in block-level tag:', tagName);
                        }
                    }
                    
                    if (needsWrapping) {
                        console.log('Wrapping HTML content in <p> tags');
                        content += `<p>${htmlContent}</p>\n\n`;
                    } else {
                        console.log('Using HTML content as-is');
                        content += `${htmlContent}\n\n`;
                    }
                } else {
                    console.log('No HTML content found, using raw content');
                    const rawContent = wp.blocks.serialize([block]);
                    content += `${rawContent}\n\n`;
                }
                break;
            case 'core/details':
                // Handle details/accordion blocks
                console.log('Processing details block:', block);
                
                let summaryContent = '';
                let detailsContent = '';
                
                // Extract summary content from block attributes
                if (block.attributes && block.attributes.summary) {
                    summaryContent = block.attributes.summary.trim();
                    console.log('Details summary from attributes:', summaryContent);
                }
                
                // Process inner blocks (the expandable content)
                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    console.log('Processing details inner blocks:', block.innerBlocks.length);
                    detailsContent = await processBlocks(block.innerBlocks);
                    console.log('Processed details content:', detailsContent);
                }
                
                // If we don't have the summary from attributes, try to extract from HTML
                if (!summaryContent && block.innerHTML) {
                    console.log('Extracting details info from innerHTML');
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = block.innerHTML;
                    
                    const summaryElement = tempDiv.querySelector('summary');
                    if (summaryElement) {
                        summaryContent = summaryElement.textContent.trim();
                        console.log('Extracted summary from HTML:', summaryContent);
                    }
                }
                
                if (summaryContent) {
                    // Format the summary as bold with a disclosure triangle marker
                    content += `<p><strong>▶ ${summaryContent}</strong></p>\n\n`;
                    
                    // Add the details content in italic if it exists
                    if (detailsContent && detailsContent.trim()) {
                        // Wrap the details content in italic styling
                        // We need to wrap each block in the details content with italic tags
                        const wrappedDetailsContent = detailsContent
                            .replace(/<p>/g, '<p><em>')
                            .replace(/<\/p>/g, '</em></p>')
                            .replace(/<h([1-6])>/g, '<h$1><em>')
                            .replace(/<\/h([1-6])>/g, '</em></h$1>')
                            .replace(/<li>/g, '<li><em>')
                            .replace(/<\/li>/g, '</em></li>');
                        
                        content += wrappedDetailsContent;
                    }
                } else {
                    console.log('No summary content found, using raw content');
                    const rawContent = wp.blocks.serialize([block]);
                    content += `${rawContent}\n\n`;
                }
                break;
            case 'core/media-text':
                // Handle media and text blocks - these commonly contain images
                console.log('Processing media-text block:', block);
                
                // Process inner blocks recursively (text content, etc.)
                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    console.log('Processing media-text inner blocks:', block.innerBlocks.length);
                    const innerContent = await processBlocks(block.innerBlocks);
                    
                    // Get the media (image) from block attributes
                    let mediaContent = '';
                    if (block.attributes && block.attributes.mediaUrl) {
                        try {
                            const base64Image = await fetchImageAsBase64(block.attributes.mediaUrl);
                            mediaContent = `<img src="${base64Image}" alt="${block.attributes.mediaAlt || 'Media'}" />\n\n`;
                        } catch (error) {
                            console.error('Error processing media-text image:', error);
                            mediaContent = `<img src="${block.attributes.mediaUrl}" alt="${block.attributes.mediaAlt || 'Media'}" />\n\n`;
                        }
                    }
                    
                    // Combine media and text content
                    content += `${mediaContent}${innerContent}`;
                } else {
                    // Fallback to serialized content with image processing
                    const mediaTextRawContent = wp.blocks.serialize([block]);
                    const mediaTextProcessedContent = await processImagesInHtml(mediaTextRawContent);
                    content += `${mediaTextProcessedContent}\n\n`;
                }
                break;
            case 'core/columns':
                // Handle columns blocks - process each column
                console.log('Processing columns block:', block);
                
                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    console.log('Processing columns inner blocks:', block.innerBlocks.length);
                    const columnsContent = await processBlocks(block.innerBlocks);
                    content += columnsContent;
                } else {
                    // Fallback to serialized content with image processing
                    const columnsRawContent = wp.blocks.serialize([block]);
                    const columnsProcessedContent = await processImagesInHtml(columnsRawContent);
                    content += `${columnsProcessedContent}\n\n`;
                }
                break;
            case 'core/column':
                // Handle individual column blocks
                console.log('Processing column block:', block);
                
                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    console.log('Processing column inner blocks:', block.innerBlocks.length);
                    const columnContent = await processBlocks(block.innerBlocks);
                    content += columnContent;
                } else {
                    // Fallback to serialized content with image processing
                    const columnRawContent = wp.blocks.serialize([block]);
                    const columnProcessedContent = await processImagesInHtml(columnRawContent);
                    content += `${columnProcessedContent}\n\n`;
                }
                break;
            case 'core/group':
                // Handle group blocks - process inner blocks and background images
                console.log('Processing group block:', block);
                console.log('Group block attributes:', block.attributes);
                
                let groupContent = '';
                
                // First check for background image in attributes
                if (block.attributes?.style?.background?.backgroundImage?.url) {
                    const bgImageUrl = block.attributes.style.background.backgroundImage.url;
                    try {
                        console.log('Processing group background image:', bgImageUrl);
                        const base64Image = await fetchImageAsBase64(bgImageUrl);
                        groupContent += `<img src="${base64Image}" alt="Group background" />\n\n`;
                    } catch (error) {
                        console.error('Error processing group background image:', error);
                        groupContent += `<img src="${bgImageUrl}" alt="Group background" />\n\n`;
                    }
                }
                
                // Then process inner blocks
                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    console.log('Processing group inner blocks:', block.innerBlocks.length);
                    const innerContent = await processBlocks(block.innerBlocks);
                    groupContent += innerContent;
                } else {
                    // Fallback to serialized content with image processing
                    const groupRawContent = wp.blocks.serialize([block]);
                    const groupProcessedContent = await processImagesInHtml(groupRawContent);
                    groupContent += `${groupProcessedContent}\n\n`;
                }
                
                content += groupContent;
                break;
            case 'core/cover':
                // Handle cover blocks - these use background images
                console.log('Processing cover block:', block);
                
                let coverContent = '';
                
                // Process the background image
                if (block.attributes && block.attributes.url) {
                    try {
                        const base64Image = await fetchImageAsBase64(block.attributes.url);
                        // For cover blocks, we'll add the background image as a regular image
                        // since Substack doesn't have an equivalent cover block
                        coverContent += `<img src="${base64Image}" alt="${block.attributes.alt || 'Cover Image'}" />\n\n`;
                    } catch (error) {
                        console.error('Error processing cover image:', error);
                        coverContent += `<img src="${block.attributes.url}" alt="${block.attributes.alt || 'Cover Image'}" />\n\n`;
                    }
                }
                
                // Process inner blocks (text content over the cover)
                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    console.log('Processing cover inner blocks:', block.innerBlocks.length);
                    const innerContent = await processBlocks(block.innerBlocks);
                    coverContent += innerContent;
                }
                
                content += coverContent;
                break;
            case 'core/gallery':
                // Handle gallery blocks - use Substack's native gallery interface
                console.log('Processing gallery block:', block);
                console.log('Gallery block attributes:', block.attributes);
                console.log('Gallery block innerBlocks:', block.innerBlocks);
                console.log('Gallery block innerHTML:', block.innerHTML);
                
                // Try to extract images from different possible locations
                let galleryImages = [];
                
                // Method 1: From block.attributes.images (newer format)
                if (block.attributes && block.attributes.images && Array.isArray(block.attributes.images)) {
                    console.log('Found images in block.attributes.images:', block.attributes.images.length);
                    galleryImages = block.attributes.images.map(img => ({
                        url: img.url,
                        alt: img.alt || '',
                        caption: img.caption || ''
                    }));
                }
                
                // Method 2: From inner blocks (some gallery formats)
                if (galleryImages.length === 0 && block.innerBlocks && block.innerBlocks.length > 0) {
                    console.log('Looking for images in inner blocks:', block.innerBlocks.length);
                    for (const innerBlock of block.innerBlocks) {
                        if (innerBlock.name === 'core/image' && innerBlock.attributes && innerBlock.attributes.url) {
                            galleryImages.push({
                                url: innerBlock.attributes.url,
                                alt: innerBlock.attributes.alt || '',
                                caption: innerBlock.attributes.caption || ''
                            });
                        }
                    }
                }
                
                // Method 3: Parse from serialized HTML (fallback)
                if (galleryImages.length === 0) {
                    console.log('Parsing images from serialized HTML');
                    const galleryRawContent = wp.blocks.serialize([block]);
                    console.log('Gallery serialized content:', galleryRawContent);
                    
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = galleryRawContent;
                    const imgElements = tempDiv.querySelectorAll('img');
                    
                    imgElements.forEach(img => {
                        if (img.src) {
                            galleryImages.push({
                                url: img.src,
                                alt: img.alt || '',
                                caption: ''
                            });
                        }
                    });
                }
                
                console.log('Final gallery images found:', galleryImages.length);
                console.log('Gallery images data:', galleryImages);
                
                if (galleryImages.length > 0) {
                    // Convert images to base64 for upload
                    const processedImages = [];
                    for (const image of galleryImages) {
                        try {
                            const base64Image = await fetchImageAsBase64(image.url);
                            processedImages.push({
                                base64: base64Image,
                                alt: image.alt,
                                caption: image.caption
                            });
                        } catch (error) {
                            console.error('Error processing gallery image:', error);
                            // Keep original URL as fallback
                            processedImages.push({
                                base64: image.url,
                                alt: image.alt,
                                caption: image.caption
                            });
                        }
                    }
                    
                    // Create a special marker for the Chrome extension to detect and handle
                    const galleryData = JSON.stringify(processedImages);
                    content += `<div class="wp-substack-gallery" data-gallery='${galleryData.replace(/'/g, '&apos;')}' style="display: none;">GALLERY_MARKER</div>\n\n`;
                } else {
                    console.log('No gallery images found, skipping gallery block');
                }
                break;
            case 'core/table':
                // Handle table blocks by deconstructing into paragraphs
                console.log('Processing table block:', block);
                
                // Create a temporary div to parse the table HTML
                const tempDiv = document.createElement('div');
                const tableRawContent = wp.blocks.serialize([block]);
                tempDiv.innerHTML = tableRawContent;
                
                let tableContent = '';
                
                // Get table headers if they exist
                const headerCells = tempDiv.querySelectorAll('th');
                if (headerCells.length > 0) {
                    const headerTexts = Array.from(headerCells).map(cell => cell.textContent.trim());
                    // Add headers as bold text
                    tableContent += `<p><strong>${headerTexts.join(' | ')}</strong></p>\n\n`;
                }
                
                // Process each row
                const rows = tempDiv.querySelectorAll('tr');
                for (const row of rows) {
                    // Skip header row if it was already processed
                    if (row.querySelector('th')) continue;
                    
                    const cells = row.querySelectorAll('td');
                    if (cells.length === 0) continue;
                    
                    const cellContents = [];
                    const rowImages = [];
                    
                    for (const cell of cells) {
                        // First handle any images in the cell
                        const images = cell.querySelectorAll('img');
                        for (const img of images) {
                            try {
                                const base64Image = await fetchImageAsBase64(img.src);
                                rowImages.push({
                                    html: `<img src="${base64Image}" alt="${img.alt || 'Table cell image'}" />`,
                                    originalNode: img
                                });
                            } catch (error) {
                                console.error('Error processing table cell image:', error);
                                rowImages.push({
                                    html: img.outerHTML,
                                    originalNode: img
                                });
                            }
                            // Remove the image from the cell's content
                            img.remove();
                        }
                        
                        // Now get any remaining text content
                        const textContent = cell.textContent.trim();
                        cellContents.push(textContent || 'blank');
                    }
                    
                    // Add the text content row if it has content
                    if (cellContents.some(content => content !== 'blank')) {
                        tableContent += `<p>${cellContents.join(' | ')}</p>\n\n`;
                    }
                    
                    // Add each image from this row as a separate chunk
                    for (const img of rowImages) {
                        tableContent += `${img.html}\n\n`;
                    }
                }
                
                // Add a divider line after the table content
                content += `${tableContent}<p>---</p>\n\n`;
                break;
            default:
                // For blocks not explicitly handled, serialize them and process any images
                console.log('Processing block via default case:', block.name);
                const defaultRawContent = wp.blocks.serialize([block]);
                
                // Process any images in the serialized content
                const defaultProcessedContent = await processImagesInHtml(defaultRawContent);
                content += `${defaultProcessedContent}\n\n`;
                break;
        }
    }

    return content;
};

// Function to fetch the featured image and convert it to base64
const getFeaturedImageAsBase64 = async (featuredImageUrl) => {
    if (!featuredImageUrl) return null;
    try {
        return await fetchImageAsBase64(featuredImageUrl);
    } catch (error) {
        console.error('Error fetching featured image as base64:', error);
        return null;
    }
};

const MySidebar = ({ postTitle, postBlocks, featuredImageUrl, postExcerpt }) => {
    const [publications, setPublications] = useState([]);
    const [selectedPublication, setSelectedPublication] = useState('');
    const [debugMode, setDebugMode] = useState(false);

    useEffect(() => {
        const fetchPublications = async () => {
            const response = await wp.apiFetch({ path: '/wp/v2/substack_publications' });
            if (response) {
                setPublications(response.map((pub) => ({
                    label: pub,
                    value: pub,
                })));
            }
        };

        fetchPublications();
    }, []);

    const handleClick = async () => {
        console.log('Initial content:', postBlocks);
        let content = await processBlocks(postBlocks);
        console.log('After processing blocks:', content);

        const featuredImageBase64 = await getFeaturedImageAsBase64(featuredImageUrl);
        console.log('Final content being sent:', content);

        window.postMessage({
            action: 'wp2substackSaveContent',
            data: {
                title: postTitle,
                content: content,
                publication: selectedPublication || publications[0].value,
                featuredImageBase64: featuredImageBase64,
                postExcerpt: postExcerpt,
                debugMode: debugMode,
            }
        }, '*');
    };

    return (
        <PluginDocumentSettingPanel className="publish_to_substack" title={__('Publish to Substack', 'a8csp-wp-substack')}>
            <SelectControl
                label={__('Select Substack Publication', 'a8csp-wp-substack')}
                value={selectedPublication}
                options={publications}
                onChange={(value) => setSelectedPublication(value)}
            />
            <div>
                <label>
                    <input 
                        type="checkbox"
                        checked={debugMode}
                        onChange={() => setDebugMode(!debugMode)}
                    />
                    {__('Open in debug mode', 'a8csp-wp-substack')}
                </label>
            </div>
            <Button isPrimary onClick={handleClick}>
                {__('Send to Substack', 'a8csp-wp-substack')}
            </Button>
        </PluginDocumentSettingPanel>
    );
};

const MySidebarWithData = withSelect((select) => {
    const editor = select('core/editor');
    const blocks = select('core/block-editor').getBlocks();
    const featuredImageId = editor.getEditedPostAttribute('featured_media');
    let featuredImageUrl = '';

    if (featuredImageId) {
        const media = select('core').getMedia(featuredImageId);
        if (media) {
            featuredImageUrl = media.source_url;
        }
    }

    const postExcerpt = editor.getEditedPostAttribute('excerpt');

    return {
        postTitle: editor.getEditedPostAttribute('title'),
        postBlocks: blocks,
        featuredImageUrl: featuredImageUrl,
        postExcerpt: postExcerpt ?? '',
    };
})(MySidebar);

registerPlugin('a8csp-wp-substack', {
    render: MySidebarWithData,
});
