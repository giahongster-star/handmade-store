let isSelectionActive = false;

document.addEventListener("DOMContentLoaded", () => {
  loadRules();

  const toggleSelectBtn = document.getElementById("btn-toggle-select");
  const exportBtn = document.getElementById("btn-export");
  const clearBtn = document.getElementById("btn-clear");

  // Toggle selection inspector mode
  toggleSelectBtn.addEventListener("click", () => {
    isSelectionActive = !isSelectionActive;
    
    if (isSelectionActive) {
      toggleSelectBtn.classList.add("active");
      toggleSelectBtn.innerHTML = `<span>⏹️</span> <span>Hủy chọn phần tử</span>`;
      
      // Notify content script to start inspecting
      sendMessageToActiveTab({ action: "toggleSelectionMode", enabled: true });
      
      // Auto close popup to let user click on page
      setTimeout(() => {
        window.close();
      }, 300);
    } else {
      toggleSelectBtn.classList.remove("active");
      toggleSelectBtn.innerHTML = `<span>🎯</span> <span>Chọn phần tử trên trang</span>`;
      sendMessageToActiveTab({ action: "toggleSelectionMode", enabled: false });
    }
  });

  // Export JSON file
  exportBtn.addEventListener("click", () => {
    chrome.storage.local.get({ rules: [] }, (result) => {
      if (result.rules.length === 0) {
        alert("Chưa có cấu hình nào để xuất.");
        return;
      }

      const jsonStr = JSON.stringify(result.rules, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = "auracraft_tracking_rules.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  // Clear all rules
  clearBtn.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả cấu hình theo dõi?")) {
      chrome.storage.local.set({ rules: [] }, () => {
        loadRules();
        alert("Đã xóa toàn bộ cấu hình.");
      });
    }
  });
});

function loadRules() {
  const container = document.getElementById("rules-container");
  
  chrome.storage.local.get({ rules: [] }, (result) => {
    const rules = result.rules;
    if (rules.length === 0) {
      container.innerHTML = `<div class="empty-state">Chưa cấu hình sự kiện nào.</div>`;
      return;
    }

    container.innerHTML = "";
    rules.forEach((rule) => {
      const item = document.createElement("div");
      item.className = "rule-item";
      item.innerHTML = `
        <div class="rule-header">
          <span class="rule-name">${escapeHTML(rule.ruleName)}</span>
          <span class="rule-type">${escapeHTML(rule.interactionType)}</span>
        </div>
        <div class="rule-selector" title="${escapeHTML(rule.cssSelector)}">
          ${escapeHTML(rule.cssSelector)}
        </div>
      `;
      container.appendChild(item);
    });
  });
}

function sendMessageToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        // Handle response if needed
        if (chrome.runtime.lastError) {
          // Silent catch if page does not have content script loaded
        }
      });
    }
  });
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
