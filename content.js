// Content script for modifying HTML on bina.az
console.log('Bina.az Modifier: Content script loaded');

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('Bina.az Modifier: Initializing modifications');

    // Add price per square meter to listings
    addPricePerSqmToListings();

    // Observe DOM changes for dynamically loaded content
    observeDOMChanges();
}

function extractPrice(listingCard) {
    // Find price element - looks for data-cy="item-card-price-full"
    const priceElement = listingCard.querySelector('[data-cy="item-card-price-full"]');
    if (!priceElement) return null;

    // Extract numeric value (remove spaces and non-breaking spaces)
    const priceText = priceElement.textContent.replace(/\s/g, '').replace(/\u00a0/g, '');
    const price = parseFloat(priceText);

    // Skip if it's a rental (contains "/ay" or "/gün")
    const priceContainer = listingCard.querySelector('.price-container');
    if (priceContainer && (priceContainer.textContent.includes('/ay') || priceContainer.textContent.includes('/gün'))) {
        return null;
    }

    return isNaN(price) ? null : price;
}

function extractArea(listingCard) {
    // Find all text that contains "m²"
    const elements = listingCard.querySelectorAll('span');

    for (const element of elements) {
        const text = element.textContent.trim();
        // Match patterns like "51 m²", "51.4 m²", etc.
        const match = text.match(/^([\d.]+)\s*m²$/);
        if (match) {
            const area = parseFloat(match[1]);
            return isNaN(area) ? null : area;
        }
    }

    return null;
}

function addPricePerSqmToListings() {
    // Find all listing cards
    const listingCards = document.querySelectorAll('.item-card');

    console.log(`Bina.az Modifier: Found ${listingCards.length} listings`);

    let modifiedCount = 0;

    listingCards.forEach((card) => {
        // Skip if already modified
        if (card.querySelector('.price-per-sqm-badge')) {
            return;
        }

        const price = extractPrice(card);
        const area = extractArea(card);

        if (price && area && area > 0) {
            const pricePerSqm = Math.round(price / area);

            // Find the price container to insert our badge after it
            const priceContainer = card.querySelector('.price-container');
            if (priceContainer && priceContainer.parentElement) {
                // Create the price per sqm badge
                const badge = document.createElement('div');
                badge.className = 'price-per-sqm-badge';
                badge.innerHTML = `
          <span class="price-per-sqm-value">${pricePerSqm.toLocaleString('en-US')}</span>
          <span class="price-per-sqm-unit">₼/m²</span>
        `;

                // Insert after the price container
                priceContainer.parentElement.insertBefore(badge, priceContainer.nextSibling);
                modifiedCount++;
            }
        }
    });

    console.log(`Bina.az Modifier: Added price per sqm to ${modifiedCount} listings`);
}

function observeDOMChanges() {
    // Set up a MutationObserver to watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;

        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                // Check if any added nodes contain listing cards
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('item-card')) {
                            shouldUpdate = true;
                        } else if (node.querySelector && node.querySelector('.item-card')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });

        if (shouldUpdate) {
            // Debounce the update
            setTimeout(() => addPricePerSqmToListings(), 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
