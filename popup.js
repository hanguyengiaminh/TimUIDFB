document.addEventListener("DOMContentLoaded", async () => {
  // 1. Xử lý chuyển đổi Tab
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
    });
  });

  // 2. Tự động điền URL của tab đang mở vào ô nhập liệu
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab?.url && activeTab.url.startsWith("http")) {
    document.getElementById("long-url").value = activeTab.url;
    if (activeTab.url.includes("facebook.com")) {
      document.getElementById("fb-url").value = activeTab.url;
    }
  }

  // 3. Sự kiện Dò UID từ Tab đang mở (đọc trực tiếp DOM, chính xác nhất)
  document.getElementById("btn-scan-tab").addEventListener("click", async () => {
    const statusEl = document.getElementById("uid-status");
    setStatus(statusEl, "Đang quét mã nguồn tab hiện tại...", "");

    if (!activeTab?.id || !activeTab.url?.includes("facebook.com")) {
      setStatus(statusEl, "Tab hiện tại không phải là trang Facebook.", "error");
      return;
    }

    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => ({
          html: document.documentElement.innerHTML,
          url: window.location.href
        })
      });

      const uid = extractFacebookUid(result.html, result.url);
      displayUidResult(uid);
    } catch (err) {
      setStatus(statusEl, "Không thể đọc nội dung tab này.", "error");
    }
  });

  // 4. Sự kiện Dò UID từ Link nhập tay
  document.getElementById("btn-find-uid").addEventListener("click", async () => {
    let url = document.getElementById("fb-url").value.trim();
    const statusEl = document.getElementById("uid-status");

    if (!url) {
      setStatus(statusEl, "Vui lòng nhập đường dẫn Facebook.", "error");
      return;
    }
    if (!url.startsWith("http")) url = "https://" + url;

    // Kiểm tra nhanh tham số ?id= trên URL trước khi fetch
    const directUid = getUidFromUrlParams(url);
    if (directUid) {
      displayUidResult(directUid);
      return;
    }

    setStatus(statusEl, "Đang tải dữ liệu và phân tích...", "");
    try {
      const response = await fetch(url);
      const html = await response.text();
      const uid = extractFacebookUid(html, response.url);
      displayUidResult(uid);
    } catch (err) {
      setStatus(statusEl, "Lỗi kết nối hoặc link không hợp lệ.", "error");
    }
  });

  // 5. Sự kiện Rút gọn Link
  document.getElementById("btn-shorten").addEventListener("click", async () => {
    let longUrl = document.getElementById("long-url").value.trim();
    const statusEl = document.getElementById("shorten-status");
    const resultBox = document.getElementById("shorten-result-box");

    if (!longUrl) {
      setStatus(statusEl, "Vui lòng nhập URL cần rút gọn.", "error");
      return;
    }
    if (!longUrl.startsWith("http")) longUrl = "https://" + longUrl;

    setStatus(statusEl, "Đang tạo link rút gọn...", "");
    resultBox.classList.add("hidden");

    try {
      const shortUrl = await shortenUrl(longUrl);
      document.getElementById("short-output").value = shortUrl;
      resultBox.classList.remove("hidden");
      setStatus(statusEl, "Rút gọn thành công!", "success");
    } catch (err) {
      setStatus(statusEl, "Không thể rút gọn URL này. Hãy thử lại.", "error");
    }
  });

  // 6. Các nút Copy nhanh
  setupCopyButton("btn-copy-uid", "uid-output", "uid-status");
  setupCopyButton("btn-copy-short", "short-output", "shorten-status");
});

// --- CÁC HÀM XỬ LÝ LOGIC ---

function getUidFromUrlParams(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const idParam = parsed.searchParams.get("id");
    if (idParam && /^[1-9]\d{4,}$/.test(idParam)) {
      return idParam;
    }
  } catch (_) {}
  return null;
}

function extractFacebookUid(html, finalUrl) {
  // Bước 1: Kiểm tra lại URL sau khi chuyển hướng (ví dụ link /share/...)
  const paramUid = getUidFromUrlParams(finalUrl);
  if (paramUid) return paramUid;

  // Bước 2: Quét các pattern đặc trưng của đối tượng đích trong giao diện Comet
  // Tuyệt đối không dùng actorID hay viewerID vì đó là ID của tài khoản đang đăng nhập
  const patterns = [
    /fb:\/\/profile\/([1-9]\d{4,})/,
    /fb:\/\/group\/([1-9]\d{4,})/,
    /"entity_id":"([1-9]\d{4,})"/,
    /"userID":"([1-9]\d{4,})"/,
    /"profile_id":([1-9]\d{4,})/,
    /"groupID":"([1-9]\d{4,})"/,
    /"delegate_page":\{"id":"([1-9]\d{4,})"\}/
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match) return match[1];
  }

  return null;
}

function displayUidResult(uid) {
  const resultBox = document.getElementById("uid-result-box");
  const statusEl = document.getElementById("uid-status");

  if (uid) {
    document.getElementById("uid-output").value = uid;
    resultBox.classList.remove("hidden");
    setStatus(statusEl, "Đã tìm thấy UID chính xác.", "success");
  } else {
    resultBox.classList.add("hidden");
    setStatus(statusEl, "Không tìm thấy UID. Hãy thử mở trực tiếp trang đó rồi bấm 'Lấy từ Tab đang mở'.", "error");
  }
}

async function shortenUrl(longUrl) {
  const encoded = encodeURIComponent(longUrl);

  // Ưu tiên dịch vụ is.gd (gọn, không quảng cáo trung gian)
  try {
    const res = await fetch(`https://is.gd/create.php?format=simple&url=${encoded}`);
    if (res.ok) {
      const text = await res.text();
      if (text.startsWith("http")) return text.trim();
    }
  } catch (_) {}

  // Dự phòng bằng TinyURL
  const fallbackRes = await fetch(`https://tinyurl.com/api-create.php?url=${encoded}`);
  if (!fallbackRes.ok) throw new Error("Shorten failed");
  return (await fallbackRes.text()).trim();
}

function setupCopyButton(btnId, inputId, statusId) {
  document.getElementById(btnId).addEventListener("click", async () => {
    const value = document.getElementById(inputId).value;
    if (!value) return;

    await navigator.clipboard.writeText(value);
    const statusEl = document.getElementById(statusId);
    setStatus(statusEl, "Đã sao chép vào bộ nhớ tạm!", "success");
  });
}

function setStatus(element, message, type) {
  element.textContent = message;
  element.className = "status-msg" + (type ? ` ${type}` : "");
}