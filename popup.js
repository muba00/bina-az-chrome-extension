// Popup script for the extension
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshBtn');

    refreshBtn.addEventListener('click', async () => {
        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Reload the tab
        chrome.tabs.reload(tab.id);

        // Optional: Close the popup after action
        // window.close();
    });
});
