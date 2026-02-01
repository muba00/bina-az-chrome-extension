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

    // Add your HTML modification logic here
    modifyPage();

    // Optional: Observe DOM changes if the page dynamically loads content
    observeDOMChanges();
}

function modifyPage() {
    // Example: Add a custom banner or modify existing elements
    // Replace this with your specific modifications

    console.log('Bina.az Modifier: Applying modifications');

    // Example modification (customize as needed):
    // const header = document.querySelector('header');
    // if (header) {
    //   const banner = document.createElement('div');
    //   banner.className = 'bina-modifier-banner';
    //   banner.textContent = 'Modified by Chrome Extension';
    //   header.insertBefore(banner, header.firstChild);
    // }
}

function observeDOMChanges() {
    // Set up a MutationObserver to watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                // Re-apply modifications if new content is added
                // modifyPage();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
