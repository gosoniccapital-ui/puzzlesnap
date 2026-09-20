// Content Script for Cun Style Advisor

// Lắng nghe message từ Background Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showToast") {
    showCunToast(request.message, request.imageUrl);
    sendResponse({ status: "success" });
  }
});

function showCunToast(message, imageUrl) {
  let existing = document.getElementById("cun-advisor-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "cun-advisor-toast";

  let imgHtml = "";
  if (imageUrl) {
    imgHtml = `<img src="${imageUrl}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover; border: 1px solid #3f3f46;" />`;
  }

  toast.innerHTML = `
    ${imgHtml}
    <div style="flex: 1; line-height: 1.4;">${message}</div>
    <span style="cursor: pointer; opacity: 0.6; font-size: 16px;" onclick="this.parentElement.remove()">✕</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.transition = "opacity 0.4s ease";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }
  }, 4500);
}

// Thêm nút nổi nhỏ gọn ở góc trang web để mở nhanh
function initFloatingBadge() {
  // Chỉ hiển thị badge trên các trang web thông thường, không chèn trùng lặp
  if (document.getElementById("cun-advisor-floating-badge")) return;

  const badge = document.createElement("div");
  badge.id = "cun-advisor-floating-badge";
  badge.title = "Click to open Cun Style Advisor fashion looks";
  badge.innerHTML = `
    <span class="cun-icon">👗</span>
    <span>Cun Style</span>
  `;

  badge.addEventListener("click", () => {
    // Mở trang web Style Advisor trên cunfashion.com
    window.open("https://cunfashion.com/style-advisor", "_blank");
  });

  document.body.appendChild(badge);
}

// Khởi tạo nhẹ nhàng sau khi trang tải xong
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFloatingBadge);
} else {
  initFloatingBadge();
}