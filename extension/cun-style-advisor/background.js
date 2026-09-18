// Background Service Worker for Cun Style Advisor Chrome Extension (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  // Tạo context menu cho hình ảnh
  chrome.contextMenus.create({
    id: "cun-advisor-image",
    title: "👗 Tư vấn phối đồ với Cun Style Advisor",
    contexts: ["image"]
  });

  // Tạo context menu cho đoạn văn bản bôi đen (tên sản phẩm / phong cách)
  chrome.contextMenus.create({
    id: "cun-advisor-selection",
    title: "✨ Gợi ý phong cách cho: '%s'",
    contexts: ["selection"]
  });

  console.log("Cun Style Advisor extension installed successfully.");
});

// Xử lý khi người dùng click vào Context Menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "cun-advisor-image" && info.srcUrl) {
    // Lưu link ảnh vào storage
    chrome.storage.local.set({
      selectedImageUrl: info.srcUrl,
      sourcePageUrl: tab?.url || "",
      timestamp: Date.now()
    }, () => {
      // Gửi message tới active tab để hiện thông báo toast
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: "showToast",
          message: "👗 Đã nhận diện trang phục! Mở icon Cun Style Advisor để xem gợi ý phối đồ.",
          imageUrl: info.srcUrl
        }).catch(() => {
          // Tab chưa inject content script hoặc restricted page
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
          message: `✨ Đã lưu từ khóa "${info.selectionText}". Mở Cun Style Advisor để xem outfit phù hợp!`,
        }).catch(() => {});
      }
    });
  }
});