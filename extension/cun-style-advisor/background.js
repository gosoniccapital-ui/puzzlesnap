// Background Service Worker for Cun Style Advisor Chrome Extension (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for images
  chrome.contextMenus.create({
    id: "cun-advisor-image",
    title: "👗 Style Outfit with Cun Style Advisor",
    contexts: ["image"]
  });

  // Create context menu for selected text (garment keyword / style name)
  chrome.contextMenus.create({
    id: "cun-advisor-selection",
    title: "✨ Match Fashion Style for: '%s'",
    contexts: ["selection"]
  });

  console.log("Cun Style Advisor extension installed successfully.");
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "cun-advisor-image" && info.srcUrl) {
    chrome.storage.local.set({
      selectedImageUrl: info.srcUrl,
      sourcePageUrl: tab?.url || "",
      timestamp: Date.now()
    }, () => {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: "showToast",
          message: "👗 Outfit captured! Click Cun Style Advisor icon to view matching Amazon looks.",
          imageUrl: info.srcUrl
        }).catch(() => {
          // Tab does not have content script injected or is restricted
        });
      }
    });
  } else if (info.menuItemId === "cun-advisor-selection" && info.selectionText) {
    chrome.storage.local.set({
      selectedKeyword: info.selectionText,
      sourcePageUrl: tab?.url || "",
      timestamp: Date.now()
    }, () => {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: "showToast",
          message: `✨ Keyword "${info.selectionText}" saved! Click Cun Style Advisor to view styles.`,
        }).catch(() => {});
      }
    });
  }
});