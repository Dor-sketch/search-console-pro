chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    searchHistory: [],
    terminalHistory: [],
    username: 'user',
    theme: 'dark'
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "addSearch") {
    chrome.storage.local.get(['searchHistory', 'terminalHistory'], (data) => {
      let history = data.searchHistory || [];
      if (!history.includes(request.query)) {
        history.unshift(request.query);
        history = history.slice(0, 50);  // Keep last 50 searches
        chrome.storage.local.set({ searchHistory: history });
      }

      let terminalHistory = data.terminalHistory || [];
      terminalHistory.push(`> ${request.query}`);
      chrome.storage.local.set({ terminalHistory: terminalHistory });
    });
  }
});

// Listen for the command to open the popup
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    chrome.action.openPopup();
  }
});