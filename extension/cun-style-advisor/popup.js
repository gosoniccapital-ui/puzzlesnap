// Cun Style Advisor Extension - Popup Logic (Manifest V3)
// Live Connected to https://cunfashion.com/api/style-advisor/analyze
// Amazon Associates StoreID: cuncute-20

const PRIMARY_API_ENDPOINT = "https://cunfashion.com/api/style-advisor/analyze";
const DEV_API_ENDPOINT = "http://localhost:3000/api/style-advisor/analyze";
const AMAZON_TAG = "cuncute-20";

// Curated Emergency Offline Fallback (strictly Amazon US with cuncute-20)
const EMERGENCY_AMAZON_CATALOG = [
  {
    id: "amz-trench-classic",
    name: "Double-Breasted Classic Trench Coat with Belt",
    price: "$89.99",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=80",
    platform: "Amazon US",
    affiliateUrl: `https://www.amazon.com/dp/B08XWN7L3Q?tag=${AMAZON_TAG}&ascsubtag=ext-fallback`
  },
  {
    id: "amz-suede-boots",
    name: "Pointed Toe Slouchy Suede Knee High Boots",
    price: "$78.50",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80",
    platform: "Amazon US",
    affiliateUrl: `https://www.amazon.com/dp/B09K7Z5J2R?tag=${AMAZON_TAG}&ascsubtag=ext-fallback`
  },
  {
    id: "amz-lounge-set",
    name: "Waffle Knit Long Sleeve 2-Piece Lounge Set",
    price: "$45.99",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80",
    platform: "Amazon US",
    affiliateUrl: `https://www.amazon.com/dp/B07T2K8F9M?tag=${AMAZON_TAG}&ascsubtag=ext-fallback`
  },
  {
    id: "amz-leather-bag",
    name: "Minimalist Soft Vegan Leather Shoulder Hobo Bag",
    price: "$38.00",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80",
    platform: "Amazon US",
    affiliateUrl: `https://www.amazon.com/dp/B0BLT9QW3P?tag=${AMAZON_TAG}&ascsubtag=ext-fallback`
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const previewImage = document.getElementById("previewImage");
  const emptyState = document.getElementById("emptyState");
  const fileInput = document.getElementById("fileInput");
  const btnRemoveImage = document.getElementById("btnRemoveImage");
  const imageSourceTag = document.getElementById("imageSourceTag");
  const inputKeyword = document.getElementById("inputKeyword");
  const selectOccasion = document.getElementById("selectOccasion");
  const selectStyle = document.getElementById("selectStyle");
  const selectBudget = document.getElementById("selectBudget");
  const inputColor = document.getElementById("inputColor");
  const btnAnalyze = document.getElementById("btnAnalyze");
  const resultsSection = document.getElementById("resultsSection");
  const adviceText = document.getElementById("adviceText");
  const productsList = document.getElementById("productsList");

  let currentImageUrl = null;

  // 1. Check storage for image/keyword sent from right-click context menu
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    chrome.storage.local.get(["selectedImageUrl", "selectedKeyword", "timestamp"], (res) => {
      if (res?.selectedImageUrl) {
        const diff = Date.now() - (res.timestamp || 0);
        // Valid if selected in the last 15 minutes
        if (diff < 15 * 60 * 1000) {
          showImage(res.selectedImageUrl, true);
        }
      }
      if (res?.selectedKeyword && inputKeyword && !inputKeyword.value) {
        inputKeyword.value = res.selectedKeyword;
      }
    });
  }

  // 2. Manual local image upload
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          showImage(ev.target.result, false);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 3. Remove/Clear image button
  if (btnRemoveImage) {
    btnRemoveImage.addEventListener("click", () => {
      currentImageUrl = null;
      if (previewImage) {
        previewImage.src = "";
        previewImage.classList.add("hidden");
      }
      if (emptyState) emptyState.classList.remove("hidden");
      btnRemoveImage.classList.add("hidden");
      if (imageSourceTag) imageSourceTag.classList.add("hidden");
      if (fileInput) fileInput.value = "";
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.remove(["selectedImageUrl"]);
      }
    });
  }

  function showImage(src, fromWeb) {
    currentImageUrl = src;
    if (previewImage) {
      previewImage.src = src;
      previewImage.classList.remove("hidden");
    }
    if (emptyState) emptyState.classList.add("hidden");
    if (btnRemoveImage) btnRemoveImage.classList.remove("hidden");

    if (imageSourceTag) {
      if (fromWeb) {
        imageSourceTag.classList.remove("hidden");
      } else {
        imageSourceTag.classList.add("hidden");
      }
    }
  }

  // 4. Analyze & Search Handler
  if (btnAnalyze) {
    btnAnalyze.addEventListener("click", async () => {
      const keyword = (inputKeyword?.value || "").trim();
      const occasion = selectOccasion?.value || "casual";
      const style = selectStyle?.value || "minimal";
      const budget = selectBudget?.value || "low";
      const color = (inputColor?.value || "").trim();

      btnAnalyze.innerHTML = `<span>⏳ Analyzing outfit via AI...</span>`;
      btnAnalyze.disabled = true;

      const payload = {
        image: currentImageUrl,
        keyword: keyword,
        occasion: occasion,
        style: style,
        budget: budget,
        color: color,
        market: "US"
      };

      try {
        let response = null;
        try {
          response = await fetch(PRIMARY_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } catch (netErr) {
          // Attempt dev fallback if local dev server is active
          try {
            response = await fetch(DEV_API_ENDPOINT, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
          } catch (devErr) {
            response = null;
          }
        }

        if (response && response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            renderResults(resJson.data);
            return;
          }
        }

        // Offline or Network Fallback: render emergency Amazon US catalog
        renderFallbackResults({
          keyword: keyword || `${style} ${occasion}`,
          occasion: occasion,
          style: style,
          color: color || "neutral tones"
        });
      } catch (err) {
        console.error("Extension analyze error:", err);
        renderFallbackResults({
          keyword: keyword || `${style} ${occasion}`,
          occasion: occasion,
          style: style,
          color: color || "neutral tones"
        });
      } finally {
        btnAnalyze.innerHTML = `<span>✨ Analyze & Match Looks</span>`;
        btnAnalyze.disabled = false;
      }
    });
  }

  function renderResults(data) {
    if (!resultsSection) return;

    // Stylist Advice Text
    if (adviceText) {
      adviceText.innerText = data.stylistAdvice || "Here are hand-picked luxury styling matches curated for your outfit mood:";
    }

    // Render Products List
    const items = data.suggestedProducts || data.keyMatchedProducts || EMERGENCY_AMAZON_CATALOG;
    displayProducts(items);

    resultsSection.classList.remove("hidden");
    resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  function renderFallbackResults(params) {
    if (!resultsSection) return;

    if (adviceText) {
      adviceText.innerText = `For a ${params.style} look suited for ${params.occasion} with ${params.color}, we recommend pairing key pieces with refined silhouettes and balanced textures. Here are top Amazon US matches:`;
    }

    displayProducts(EMERGENCY_AMAZON_CATALOG);

    resultsSection.classList.remove("hidden");
    resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  function displayProducts(products) {
    if (!productsList) return;
    productsList.innerHTML = "";

    const list = Array.isArray(products) && products.length > 0 ? products : EMERGENCY_AMAZON_CATALOG;

    list.slice(0, 6).forEach((p) => {
      let rawUrl = p.affiliateUrl || p.link || `https://www.amazon.com/s?k=${encodeURIComponent(p.name)}&tag=${AMAZON_TAG}`;
      // Ensure cuncute-20 is always present
      if (!rawUrl.includes("tag=")) {
        rawUrl += (rawUrl.includes("?") ? "&" : "?") + `tag=${AMAZON_TAG}&ascsubtag=ext-popup`;
      }

      const item = document.createElement("div");
      item.className = "product-item";
      item.innerHTML = `
        <img src="${p.image || p.img}" alt="${escapeHtml(p.name)}" class="product-img" />
        <div class="product-info">
          <span class="product-platform">${p.platform || "Amazon US"}</span>
          <h4 class="product-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h4>
          <div class="product-price">${p.price || "$49.99"}</div>
        </div>
        <a href="${rawUrl}" target="_blank" rel="noopener noreferrer" class="btn-buy">Shop Now</a>
      `;
      productsList.appendChild(item);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});