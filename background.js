// It makes tab to be activated, only on 'youtube' website
// This piece of code makes side-panel open in specific websites only.

const YOUTUBE_ORIGIN = "https://www.youtube.com";

// 1. Open side panel when clicking the extension action icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Helper function to update panel and action state per tab
async function updateTabState(tabId, urlString) {
  if (!urlString) return;

  try {
    const url = new URL(urlString);

    if (url.origin === YOUTUBE_ORIGIN) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: "sidePanel.html",
        enabled: true
      });
      await chrome.action.enable(tabId);
    } else {
      // Disable on non-YouTube sites
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
      });
      await chrome.action.disable(tabId);
    }
  } catch (err) {
    // Ignore invalid system/chrome URLs
  }
}

// 2. Fire state check when page loads/updates
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status === "complete" || tab.url) {
    updateTabState(tabId, tab.url);
  }
});

// 3. Fire state check when switching between active tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateTabState(tab.id, tab.url);
});
// Activation on "youtube.com" only function terminated here.