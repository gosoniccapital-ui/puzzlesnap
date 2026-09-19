// Cun Style Advisor Popup Logic

// Fake catalog sản phẩm affiliate cho Extension
const PRODUCT_DATA = {
  casual: [
    {
      name: "Áo Thun Oversize Cotton 250gsm Dáng Suông Unisex",
      price: "249.000đ",
      img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80",
      platform: "Shopee",
      link: "https://shopee.vn/search?keyword=%C3%A1o%20thun%20oversize%20cotton%20250gsm"
    },
    {
      name: "Quần Jean Ống Rộng Wide-Leg Retro Cạp Cao",
      price: "420.000đ",
      img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&auto=format&fit=crop&q=80",
      platform: "Shopee",
      link: "https://shopee.vn/search?keyword=qu%E1%BA%A7n%20jean%20%E1%BB%91ng%20r%E1%BB%99ng%20wide%20leg"
    },
    {
      name: "Sneaker Da Trắng Chunky Sole Siêu Nhẹ",
      price: "680.000đ",
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop&q=80",
      platform: "TikTok Shop",
      link: "https://www.tiktok.com/search?q=sneaker%20tr%E1%BA%AFng%20chunky"
    }
  ],
  work: [
    {
      name: "Áo Sơ Mi Lụa Hàn Cao Cấp Cổ V Thanh Lịch",
      price: "490.000đ",
      img: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=300&auto=format&fit=crop&q=80",
      platform: "Shopee",
      link: "https://shopee.vn/search?keyword=%C3%A1o%20s%C6%A1%20mi%20l%E1%BB%A5a%20h%C3%A0n%20c%E1%BB%95%20v"
    },
    {
      name: "Quần Tây Ống Suông Ly Nổi Tôn Dáng",
      price: "450.000đ",
      img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&auto=format&fit=crop&q=80",
      platform: "Shopee",
      link: "https://shopee.vn/search?keyword=qu%E1%BA%A7n%20t%C3%A2y%20%E1%BB%91ng%20su%C3%B4ng%20ly%20n%E1%BB%95i"
    },
    {
      name: "Blazer Dáng Suông 2 Lớp Vải Tuyết Mưa",
      price: "890.000đ",
      img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&auto=format&fit=crop&q=80",
      platform: "Shopee",
      link: "https://shopee.vn/search?keyword=blazer%20d%C3%A1ng%20su%C3%B4ng%20tuy%E1%BA%BFt%20m%C6%B0a"
    }
  ],
  date: [
    {
      name: "Đầm Midi Voan Tơ Hoa Nhí Chiết Eo Nữ Tính",
      price: "650.000đ",
      img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&auto=format&fit=crop&q=80",
      platform: "TikTok Shop",
      link: "https://www.tiktok.com/search?q=%C4%91%E1%BA%A7m%20midi%20voan%20hoa%20nh%C3%AD"
    },
    {
      name: "Áo Kiểu Peplum Lụa Satin Nơ Cổ Tinh Tế",
      price: "360.000đ",
      img: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=300&auto=format&fit=crop&q=80",
      platform: "Shopee",
      link: "https://shopee.vn/search?keyword=%C3%A1o%20peplum%20l%E1%BB%A5a%20n%C6%A1%20c%E1%BB%95"
    },
    {
      name: "Túi Xách Kẹp Nách Da Nappa Khóa Mạ Vàng",
      price: "520.000đ",
      img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80",
      platform: "Lazada",
      link: "https://www.lazada.vn/catalog/?q=t%C3%BAi%20x%C3%A1ch%20k%E1%BA%B9p%20n%C3%A1ch%20da"
    }
  ],
  party: [
    {
      name: "Đầm Dạ Hội Lụa Đính Đá Cổ Yếm Quyến Rũ",
      price: "1.650.000đ",
      img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&auto=format&fit=crop&q=80",
      platform: "Shopee",
      link: "https://shopee.vn/search?keyword=%C4%91%E1%BA%A7m%20d%E1%BA%A1%20h%E1%BB%99i%20c%E1%BB%95%20y%E1%BA%BFm"
    },
    {
      name: "Giày Cao Gót Mũi Nhọn Quai Mảnh 7cm Da Bóng",
      price: "790.000đ",
      img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&auto=format&fit=crop&q=80",
      platform: "Lazada",
      link: "https://www.lazada.vn/catalog/?q=gi%C3%A0y%20cao%20g%C3%B3t%207cm"
    }
  ],
  travel: [
    {
      name: "Set Đi Biển Áo Croptop & Chân Váy Maxi Boho",
      price: "580.000đ",
      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80",
      platform: "TikTok Shop",
      link: "https://www.tiktok.com/search?q=set%20maxi%20boho%20%C4%91i%20bi%E1%BB%83n"
    },
    {
      name: "Áo Khoác Gió Dù Chống Nước & UV Trượt Nước",
      price: "480.000đ",
      img: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=300&auto=format&fit=crop&q=80",
      platform: "Shopee",
      link: "https://shopee.vn/search?keyword=%C3%A1o%20kho%C3%A1c%20gi%C3%B3%20ch%E1%BB%91ng%20uv"
    },
    {
      name: "Mũ Bucket Vành Tròn Canvas Vintage",
      price: "185.000đ",
      img: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=300&auto=format&fit=crop&q=80",
      platform: "Shopee",
      link: "https://shopee.vn/search?keyword=m%C5%A9%20bucket%20canvas"
    }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  const previewImage = document.getElementById("previewImage");
  const emptyState = document.getElementById("emptyState");
  const fileInput = document.getElementById("fileInput");
  const btnRemoveImage = document.getElementById("btnRemoveImage");
  const imageSourceTag = document.getElementById("imageSourceTag");
  const btnAnalyze = document.getElementById("btnAnalyze");
  const resultsSection = document.getElementById("resultsSection");
  const adviceText = document.getElementById("adviceText");
  const productsList = document.getElementById("productsList");

  let currentImageUrl = null;

  // Kiểm tra ảnh được lưu từ context menu khi lướt web
  if (chrome?.storage?.local) {
    chrome.storage.local.get(["selectedImageUrl", "selectedKeyword", "timestamp"], (res) => {
      if (res?.selectedImageUrl) {
        // Nếu ảnh được chọn trong vòng 10 phút gần đây
        const diff = Date.now() - (res.timestamp || 0);
        if (diff < 10 * 60 * 1000) {
          showImage(res.selectedImageUrl, true);
        }
      }
      if (res?.selectedKeyword) {
        const inputColor = document.getElementById("inputColor");
        if (inputColor && !inputColor.value) {
          inputColor.value = res.selectedKeyword;
        }
      }
    });
  }

  // Upload ảnh thủ công
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

  // Nút xóa ảnh
  btnRemoveImage.addEventListener("click", () => {
    currentImageUrl = null;
    previewImage.src = "";
    previewImage.classList.add("hidden");
    emptyState.classList.remove("hidden");
    btnRemoveImage.classList.add("hidden");
    imageSourceTag.classList.add("hidden");
    fileInput.value = "";
    if (chrome?.storage?.local) {
      chrome.storage.local.remove(["selectedImageUrl"]);
    }
  });

  function showImage(src, fromWeb) {
    currentImageUrl = src;
    previewImage.src = src;
    previewImage.classList.remove("hidden");
    emptyState.classList.add("hidden");
    btnRemoveImage.classList.remove("hidden");

    if (fromWeb) {
      imageSourceTag.classList.remove("hidden");
    } else {
      imageSourceTag.classList.add("hidden");
    }
  }

  // Nút phân tích
  btnAnalyze.addEventListener("click", () => {
    const occasion = document.getElementById("selectOccasion").value;
    const style = document.getElementById("selectStyle").value;
    const budget = document.getElementById("selectBudget").value;
    const color = document.getElementById("inputColor").value || "tông màu trung tính";

    btnAnalyze.innerHTML = "<span>⏳ Đang phân tích phong cách...</span>";
    btnAnalyze.disabled = true;

    setTimeout(() => {
      btnAnalyze.innerHTML = "<span>✨ Phân Tích & Gợi Ý Sản Phẩm</span>";
      btnAnalyze.disabled = false;

      // Hiển thị lời khuyên
      adviceText.innerText = `Dựa trên outfit được chọn cho dịp "${occasion}" với phong cách "${style}", stylist khuyên bạn nên kết hợp với ${color} để outfit thêm nổi bật và hài hòa. Ưu tiên các item bên dưới:`;

      // Render danh sách sản phẩm
      const products = PRODUCT_DATA[occasion] || PRODUCT_DATA.casual;
      productsList.innerHTML = "";

      products.forEach((p) => {
        const item = document.createElement("div");
        item.className = "product-item";
        item.innerHTML = `
          <img src="${p.img}" alt="${p.name}" class="product-img" />
          <div class="product-info">
            <span class="product-platform">${p.platform}</span>
            <h4 class="product-name" title="${p.name}">${p.name}</h4>
            <div class="product-price">${p.price}</div>
          </div>
          <a href="${p.link}" target="_blank" class="btn-buy">Xem Ngay</a>
        `;
        productsList.appendChild(item);
      });

      resultsSection.classList.remove("hidden");
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }, 600);
  });
});