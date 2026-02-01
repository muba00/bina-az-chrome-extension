// Popup script for the extension
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshBtn');
    const statsContent = document.getElementById('statsContent');

    // Load and display statistics
    loadStatistics();

    refreshBtn.addEventListener('click', async () => {
        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Reload the tab
        chrome.tabs.reload(tab.id);

        // Optional: Close the popup after action
        // window.close();
    });
});

function loadStatistics() {
    chrome.storage.local.get(['priceStats'], (result) => {
        const statsContent = document.getElementById('statsContent');

        if (!result.priceStats) {
            statsContent.innerHTML = '<div class="no-data">No data available. Visit a bina.az listing page to see statistics.</div>';
            return;
        }

        const stats = result.priceStats;

        statsContent.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Listings Analyzed</span>
                <span class="stat-value">${stats.totalListings}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Lowest Price/m²</span>
                <span class="stat-value">${stats.minPricePerSqm.toLocaleString('en-US')} ₼</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Highest Price/m²</span>
                <span class="stat-value">${stats.maxPricePerSqm.toLocaleString('en-US')} ₼</span>
            </div>
            
            <div class="threshold-group">
                <div class="stats-title" style="font-size: 12px; margin-bottom: 8px;">Price Categories</div>
                
                <div class="threshold-item">
                    <div class="color-indicator color-good"></div>
                    <div class="threshold-text">
                        <strong>Good Price:</strong> ≤ ${stats.goodThreshold.toLocaleString('en-US')} ₼/m²
                        <div style="font-size: 11px; color: #888; margin-top: 2px;">
                            Bottom 25% of listings
                        </div>
                    </div>
                </div>
                
                <div class="threshold-item">
                    <div class="color-indicator color-average"></div>
                    <div class="threshold-text">
                        <strong>Average Price:</strong> ${(stats.goodThreshold + 1).toLocaleString('en-US')} - ${(stats.expensiveThreshold - 1).toLocaleString('en-US')} ₼/m²
                        <div style="font-size: 11px; color: #888; margin-top: 2px;">
                            Middle 50% of listings
                        </div>
                    </div>
                </div>
                
                <div class="threshold-item">
                    <div class="color-indicator color-expensive"></div>
                    <div class="threshold-text">
                        <strong>Expensive:</strong> ≥ ${stats.expensiveThreshold.toLocaleString('en-US')} ₼/m²
                        <div style="font-size: 11px; color: #888; margin-top: 2px;">
                            Top 25% of listings
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}
