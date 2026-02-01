# Bina.az Chrome Extension

A Chrome extension that modifies HTML content on bina.az website.

## Project Structure

```
bina-az-chrome-extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── content.js          # Content script that modifies the page
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
├── styles.css          # Styles for injected content
├── icons/              # Extension icons (16x16, 48x48, 128x128)
└── README.md           # This file
```

## Development Setup

### 1. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `bina-az-chrome-extension` folder

### 2. Test the Extension

1. Navigate to `https://bina.az`
2. The content script will automatically run and modify the page
3. Check the browser console (F12) for log messages
4. Click the extension icon in the toolbar to open the popup

### 3. Making Changes

After making changes to any file:

- **Content script or styles**: Reload the extension on `chrome://extensions/` and refresh the target page
- **Popup**: Just close and reopen the popup
- **Manifest**: Reload the extension on `chrome://extensions/`

## Customization

### Modify Target Website

Edit the `matches` pattern in [manifest.json](manifest.json):

```json
"matches": ["https://bina.az/*"]
```

### Add HTML Modifications

Edit the `modifyPage()` function in [content.js](content.js) to implement your specific HTML changes.

### Add Additional Permissions

If you need more permissions (e.g., storage, tabs), add them to the `permissions` array in [manifest.json](manifest.json).

## Files to Customize

- **[content.js](content.js)**: Add your HTML modification logic
- **[styles.css](styles.css)**: Add custom styles for injected elements
- **[popup.html](popup.html)** / **[popup.js](popup.js)**: Customize the extension popup interface
- **[manifest.json](manifest.json)**: Configure permissions, content scripts, and metadata

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Content Scripts Guide](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

## License

MIT
