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
                // Create the price per sqm badge with gray color initially
                const badge = document.createElement('div');
                badge.className = 'price-per-sqm-badge price-per-sqm-loading';
                badge.setAttribute('data-price-per-sqm', pricePerSqm);
                badge.setAttribute('data-total-price', price); // Store for tiebreaker
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

    // Asynchronously compare prices and update colors
    if (modifiedCount > 0) {
        setTimeout(() => updateBadgeColorsAsync(), 100);
    }
}

async function updateBadgeColorsAsync() {
    console.log('Bina.az Modifier: Starting price comparison...');

    // Collect all badges and their prices
    const badges = document.querySelectorAll('.price-per-sqm-badge');
    const pricesData = [];

    badges.forEach(badge => {
        const pricePerSqm = parseInt(badge.getAttribute('data-price-per-sqm'));
        const totalPrice = parseInt(badge.getAttribute('data-total-price'));
        if (pricePerSqm && totalPrice) {
            pricesData.push({ badge, pricePerSqm, totalPrice });
        }
    });

    if (pricesData.length === 0) {
        console.log('Bina.az Modifier: No prices to compare');
        return;
    }

    // Sort prices to calculate percentiles
    const sortedPrices = pricesData.map(d => d.pricePerSqm).sort((a, b) => a - b);

    // Calculate thresholds using percentiles
    const p10Index = Math.floor(sortedPrices.length * 0.10);
    const q1Index = Math.floor(sortedPrices.length * 0.25);
    const q3Index = Math.floor(sortedPrices.length * 0.75);

    const goodThreshold = sortedPrices[p10Index]; // Bottom 10% = best prices (green)
    const lightGoodThreshold = sortedPrices[q1Index]; // Bottom 10-25% = good prices (light green)
    const expensiveThreshold = sortedPrices[q3Index]; // Top 25% = expensive

    console.log(`Bina.az Modifier: Price analysis - Best: ≤${goodThreshold}, Good: ≤${lightGoodThreshold}, Expensive: ≥${expensiveThreshold}`);

    // Count how many "great" prices we have and identify top 5
    const greatPrices = pricesData.filter(({ pricePerSqm }) => pricePerSqm <= goodThreshold);
    const shouldShowRanks = greatPrices.length > 10;

    // Sort great prices to find top 5 best (with tiebreaker by total price)
    const top5 = shouldShowRanks
        ? greatPrices.sort((a, b) => {
            // Primary: sort by price per sqm (lower is better)
            if (a.pricePerSqm !== b.pricePerSqm) {
                return a.pricePerSqm - b.pricePerSqm;
            }
            // Tiebreaker: if same ₼/m², lower total price wins
            return a.totalPrice - b.totalPrice;
        }).slice(0, 5)
        : [];

    console.log(`Bina.az Modifier: Found ${greatPrices.length} great prices${shouldShowRanks ? ', showing top 5 ranks' : ''}`);

    // Update each badge color based on its price
    pricesData.forEach(({ badge, pricePerSqm }) => {
        // Remove all existing color classes and rank badges
        badge.classList.remove('price-per-sqm-loading', 'price-per-sqm-good', 'price-per-sqm-light-good', 'price-per-sqm-average', 'price-per-sqm-expensive');
        const existingRank = badge.querySelector('.price-per-sqm-rank');
        if (existingRank) {
            existingRank.remove();
        }

        // Add appropriate color class
        if (pricePerSqm <= goodThreshold) {
            badge.classList.add('price-per-sqm-good');

            // Add rank if this is in top 5 and we have enough great prices
            if (shouldShowRanks) {
                const rankIndex = top5.findIndex(item => item.badge === badge);
                if (rankIndex !== -1) {
                    const rankBadge = document.createElement('span');
                    rankBadge.className = 'price-per-sqm-rank';
                    rankBadge.textContent = `${rankIndex + 1}`;
                    badge.insertBefore(rankBadge, badge.firstChild);
                }
            }
        } else if (pricePerSqm <= lightGoodThreshold) {
            badge.classList.add('price-per-sqm-light-good');
        } else if (pricePerSqm >= expensiveThreshold) {
            badge.classList.add('price-per-sqm-expensive');
        } else {
            badge.classList.add('price-per-sqm-average');
        }
    });

    console.log(`Bina.az Modifier: Updated colors for ${pricesData.length} listings`);

    // Store statistics for the popup
    const minPrice = sortedPrices[0];
    const maxPrice = sortedPrices[sortedPrices.length - 1];

    const stats = {
        totalListings: pricesData.length,
        minPricePerSqm: minPrice,
        maxPricePerSqm: maxPrice,
        goodThreshold: goodThreshold,
        lightGoodThreshold: lightGoodThreshold,
        expensiveThreshold: expensiveThreshold,
        lastUpdated: new Date().toISOString()
    };

    // Save to chrome storage
    chrome.storage.local.set({ priceStats: stats }, () => {
        console.log('Bina.az Modifier: Statistics saved', stats);
    });
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
