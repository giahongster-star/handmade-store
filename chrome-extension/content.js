let isSelectionMode = false;
let hoveredElement = null;

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleSelectionMode") {
    isSelectionMode = request.enabled;
    if (isSelectionMode) {
      startInspector();
    } else {
      stopInspector();
    }
  }
});

function startInspector() {
  document.addEventListener("mouseover", handleMouseOver, true);
  document.addEventListener("mouseout", handleMouseOut, true);
  document.addEventListener("click", handleElementClick, true);
  console.log("AuraCraft Event Inspector: Selector Mode Enabled");
}

function stopInspector() {
  document.removeEventListener("mouseover", handleMouseOver, true);
  document.removeEventListener("mouseout", handleMouseOut, true);
  document.removeEventListener("click", handleElementClick, true);
  if (hoveredElement) {
    hoveredElement.classList.remove("auracraft-inspector-hover");
    hoveredElement = null;
  }
}

function handleMouseOver(e) {
  if (!isSelectionMode) return;
  e.preventDefault();
  e.stopPropagation();
  
  if (hoveredElement) {
    hoveredElement.classList.remove("auracraft-inspector-hover");
  }
  
  hoveredElement = e.target;
  // Ignore our injected elements
  if (hoveredElement.id === "auracraft-modal-root" || hoveredElement.closest("#auracraft-modal-root")) {
    hoveredElement = null;
    return;
  }
  
  hoveredElement.classList.add("auracraft-inspector-hover");
}

function handleMouseOut(e) {
  if (!isSelectionMode) return;
  if (hoveredElement === e.target) {
    hoveredElement.classList.remove("auracraft-inspector-hover");
    hoveredElement = null;
  }
}

function handleElementClick(e) {
  if (!isSelectionMode) return;
  e.preventDefault();
  e.stopPropagation();

  const target = e.target;
  stopInspector();
  isSelectionMode = false;

  // Generate CSS Selector
  const selector = generateCSSSelector(target);
  
  // Show editor modal overlay
  showEditorModal(selector);
}

function generateCSSSelector(el) {
  // 1. If element has data-testid, return it directly
  const testId = el.getAttribute('data-testid');
  if (testId) {
    return `[data-testid="${testId}"]`;
  }

  // 2. If element has an id, return it directly
  if (el.id) {
    return `#${el.id}`;
  }
  
  let path = [];
  let currentEl = el;
  while (currentEl && currentEl.nodeType === Node.ELEMENT_NODE) {
    // If we find an element with data-testid along the path, stop there and prepend it!
    const pathTestId = currentEl.getAttribute('data-testid');
    if (pathTestId) {
      path.unshift(`[data-testid="${pathTestId}"]`);
      break;
    }
    
    // If we find an element with id along the path, stop there and prepend it!
    if (currentEl.id) {
      path.unshift(`#${currentEl.id}`);
      break;
    }

    let selector = currentEl.nodeName.toLowerCase();
    
    // Ignore extension injected classes
    const classes = Array.from(currentEl.classList)
      .filter(c => c !== "auracraft-inspector-hover")
      .map(c => typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(c) : c.replace(/([#:\.\[\]\(\)\/])/g, '\\$1'))
      .join(".");
      
    if (classes) {
      selector += `.${classes}`;
    }
    
    // Check if unique in siblings
    let siblings = currentEl.parentNode ? Array.from(currentEl.parentNode.children).filter(c => c.nodeName === currentEl.nodeName) : [];
    if (siblings.length > 1) {
      const index = siblings.indexOf(currentEl) + 1;
      selector += `:nth-of-type(${index})`;
    }
    
    path.unshift(selector);
    currentEl = currentEl.parentNode;
    
    // Stop at body or HTML
    if (selector.startsWith("body") || selector.startsWith("html")) {
      break;
    }
  }
  
  return path.join(" > ");
}

function showEditorModal(selector) {
  // Remove existing modals if any
  const existing = document.getElementById("auracraft-modal-root");
  if (existing) existing.remove();

  const root = document.createElement("div");
  root.id = "auracraft-modal-root";
  document.body.appendChild(root);

  // Attach Shadow DOM for style isolation
  const shadow = root.attachShadow({ mode: "open" });

  // Modal HTML & CSS matching the user design screenshot
  shadow.innerHTML = `
    <style>
      :host {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
      }
      .modal-content {
        background: #ffffff;
        border-radius: 12px;
        width: 650px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        display: flex;
        flex-content: column;
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .card-section {
        border: 1px solid #edf2f7;
        border-radius: 8px;
        margin: 16px;
        padding: 16px;
        background: #fafafa;
      }
      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 700;
        color: #2d3748;
        margin-bottom: 12px;
        border-bottom: 1px solid #edf2f7;
        padding-bottom: 8px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .form-group-full {
        grid-column: span 2;
      }
      label {
        font-size: 11px;
        font-weight: 600;
        color: #718096;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      input, select {
        padding: 8px 12px;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 13px;
        background: #fff;
        color: #2d3748;
        outline: none;
        transition: border 0.2s;
      }
      input:focus, select:focus {
        border-color: #d97706;
      }
      .radio-group {
        margin-top: 6px;
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #4a5568;
      }
      .radio-label {
        display: flex;
        align-items: center;
        gap: 4px;
        text-transform: none;
        font-size: 13px;
        color: #2d3748;
        cursor: pointer;
      }
      .btn-container {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 0 16px 16px;
      }
      button {
        padding: 10px 18px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-cancel {
        background: #e2e8f0;
        color: #4a5568;
      }
      .btn-cancel:hover {
        background: #cbd5e0;
      }
      .btn-save {
        background: #d97706;
        color: #ffffff;
      }
      .btn-save:hover {
        background: #b45309;
      }
    </style>

    <div class="modal-backdrop">
      <div class="modal-content">
        <form id="tracker-form">
          <!-- 1. Event Identification -->
          <div class="card-section">
            <div class="header-title">
              <span style="background:#e6fffa; padding:4px; border-radius:50%; display:inline-flex;">🔍</span>
              Event Identification
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Rule Name *</label>
                <input type="text" id="ruleName" value="VIEW_P" required />
              </div>
              <div class="form-group">
                <label>Interaction Type *</label>
                <select id="interactionType">
                  <option value="view_product">View product</option>
                  <option value="add_to_favorite">Add product to favorite</option>
                  <option value="add_to_wishlist">Add product to wishlist</option>
                  <option value="add_to_cart" selected>Add product to cart</option>
                  <option value="checkout">Purchase / Checkout</option>
                  <option value="rate_product">Rating product</option>
                  <option value="review_product">Review product</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 2. Target Element -->
          <div class="card-section">
            <div class="header-title">
              <span style="background:#ebf8ff; padding:4px; border-radius:50%; display:inline-flex;">🎯</span>
              Target Element
            </div>
            <div class="form-group form-group-full">
              <label>CSS Selector *</label>
              <input type="text" id="cssSelector" value="${selector}" required />
            </div>
          </div>

          <!-- 3. Payload Mapping -->
          <div class="card-section">
            <div class="header-title">
              <span style="background:#f0fff4; padding:4px; border-radius:50%; display:inline-flex;">📦</span>
              Payload Mapping
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Data Field</label>
                <input type="text" id="dataField" value="itemId" />
              </div>
              <div class="form-group">
                <label>Source</label>
                <select id="mappingSource">
                  <option value="request_url" selected>request_url</option>
                  <option value="dom_element">dom_element</option>
                  <option value="page_meta">page_meta</option>
                </select>
              </div>
              <div class="form-group form-group-full">
                <label>Configuration</label>
                <input type="text" id="mappingConfig" value="/api/song/:id/player" />
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" name="sourceType" value="pathname" checked /> PathName
                  </label>
                  <label class="radio-label">
                    <input type="radio" name="sourceType" value="query" /> Query Parameter
                  </label>
                </div>
              </div>
              <div class="form-group form-group-full">
                <label>Index (Path segment index)</label>
                <input type="number" id="pathIndex" value="3" />
                <p style="font-size:10px; color:#a0aec0; margin:4px 0 0;">Specify segment index. Example: /api/product/123/details -> index 3 gets '123'</p>
              </div>
            </div>
          </div>

          <div class="btn-container">
            <button type="button" class="btn-cancel" id="btn-cancel">Hủy</button>
            <button type="submit" class="btn-save">Lưu Lại</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Bind close buttons and form submission
  shadow.getElementById("btn-cancel").addEventListener("click", () => {
    root.remove();
  });

  shadow.getElementById("tracker-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const rule = {
      id: crypto.randomUUID(),
      ruleName: shadow.getElementById("ruleName").value,
      interactionType: shadow.getElementById("interactionType").value,
      cssSelector: shadow.getElementById("cssSelector").value,
      dataField: shadow.getElementById("dataField").value,
      mappingSource: shadow.getElementById("mappingSource").value,
      mappingConfig: shadow.getElementById("mappingConfig").value,
      sourceType: shadow.querySelector('input[name="sourceType"]:checked').value,
      pathIndex: parseInt(shadow.getElementById("pathIndex").value) || 0,
      createdAt: new Date().toISOString()
    };

    // Save rules to chrome storage
    chrome.storage.local.get({ rules: [] }, (result) => {
      const rules = result.rules;
      rules.push(rule);
      chrome.storage.local.set({ rules }, () => {
        console.log("AuraCraft Event Tracker: Rule Saved", rule);
        root.remove();
        alert("Đã lưu cấu hình sự kiện thành công!");
      });
    });
  });
}
