chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleSelectionMode") {
    // Forward selection mode message to the active tab content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, request);
      }
    });
  }
  return true;
});
