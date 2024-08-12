chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ searchHistory: [] });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "addSearch") {
    chrome.storage.local.get('searchHistory', (data) => {
      let history = data.searchHistory || [];
      if (!history.includes(request.query)) {
        history.unshift(request.query);
        history = history.slice(0, 50);  // Keep last 50 searches
        chrome.storage.local.set({ searchHistory: history });
      }
    });
  }
});
