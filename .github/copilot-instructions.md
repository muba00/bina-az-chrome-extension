# Bina.az Chrome Extension - AI Agent Guide

## Project Overview

Chrome Manifest V3 extension that analyzes real estate listings on bina.az, displaying price-per-square-meter calculations with color-coded affordability indicators (green=cheap, yellow=average, red=expensive) using quartile-based thresholds.

## Architecture

### Content Script Flow ([content.js](../content.js))

1. **Injection**: Runs on `https://bina.az/*` pages at `document_end`
2. **DOM Parsing**: Extracts prices from `[data-cy="item-card-price-full"]` and areas from spans matching `/^([\d.]+)\s*m²$/`
3. **Badge Insertion**: Inserts `.price-per-sqm-badge` after `.price-container` with initial gray/loading state
4. **Async Color Update**: After 100ms, calculates quartiles (Q1=good, Q3=expensive) and updates badge CSS classes
5. **MutationObserver**: Watches for dynamically loaded listings and re-runs badge injection

### Data Flow

- **Content → Storage**: Saves `priceStats` object (totalListings, min/max, thresholds) to `chrome.storage.local`
- **Storage → Popup**: [popup.js](../popup.js) reads stats and renders affordability breakdown
- **No background service worker**: All logic runs in content script + popup

## Key Patterns

### Price Extraction

```javascript
// Filters out rentals containing "/ay" or "/gün"
const priceText = priceElement.textContent
  .replace(/\s/g, "")
  .replace(/\u00a0/g, "");
```

### Quartile-Based Color Coding

- Bottom 25% = green (`.price-per-sqm-good`)
- Middle 50% = yellow (`.price-per-sqm-average`)
- Top 25% = red (`.price-per-sqm-expensive`)

### DOM Insertion Strategy

Always insert badges _after_ `.price-container` using `insertBefore(badge, priceContainer.nextSibling)` to maintain layout consistency.

## Development Workflow

### Testing Changes

1. Modify code → Go to `chrome://extensions/` → Click reload button on extension card
2. Refresh any open bina.az tabs
3. Check console for `Bina.az Modifier:` logs
4. For popup changes: Just reopen popup (no reload needed)

### Adding New Features

- **New data extraction**: Add to `extractPrice()`/`extractArea()` functions
- **Additional stats**: Extend `priceStats` object in `updateBadgeColorsAsync()`
- **UI changes**: Modify [popup.html](../popup.html) inline styles or [styles.css](../styles.css)

## Critical Details

### Selectors

- Listings: `.item-card` (multiple per page)
- Price: `[data-cy="item-card-price-full"]` (official bina.az data attribute)
- Area: Any `<span>` with text matching `/^([\d.]+)\s*m²$/`

### Localization

- UI text is in Azerbaijani (e.g., "Əlverişli Qiymət", "₼/m²")
- Keep currency symbol `₼` (Azerbaijani manat)
- Use `.toLocaleString('en-US')` for number formatting (thousand separators)

### Performance

- Debounce MutationObserver updates with 100ms setTimeout
- Async color update prevents blocking initial badge render
- No external API calls—everything computed client-side

## Common Modifications

### Change Color Thresholds

Modify quartile indices in `updateBadgeColorsAsync()`:

```javascript
const q1Index = Math.floor(sortedPrices.length * 0.25); // Adjust percentage here
```

### Add New Badge Types

1. Define CSS class in [styles.css](../styles.css) (e.g., `.price-per-sqm-premium`)
2. Add conditional logic in `updateBadgeColorsAsync()` after line 139
3. Update popup legend in [popup.js](../popup.js) `loadStatistics()` function

### Extend to Other Pages

Add URL pattern to [manifest.json](../manifest.json):

```json
"matches": ["https://bina.az/*", "https://tap.az/*"]
```
