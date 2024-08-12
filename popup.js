let searchHistory = [];
let currentHistoryIndex = -1;

function addToHistory(query) {
  if (query && !searchHistory.includes(query)) {
    searchHistory.unshift(query);
    chrome.runtime.sendMessage({ action: "addSearch", query: query });
  }
}

function performSearch(query) {
  addToHistory(query);
  chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(query)}` });
}

function updateTerminal(text) {
  const terminal = document.getElementById('terminal');
  terminal.innerHTML += `<div>> ${text}</div>`;
  terminal.scrollTop = terminal.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('input');

  chrome.storage.local.get('searchHistory', function(data) {
    searchHistory = data.searchHistory || [];
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const query = input.value.trim();
      if (query) {
        updateTerminal(query);
        performSearch(query);
        input.value = '';
        currentHistoryIndex = -1;
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentHistoryIndex < searchHistory.length - 1) {
        currentHistoryIndex++;
        input.value = searchHistory[currentHistoryIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentHistoryIndex > -1) {
        currentHistoryIndex--;
        input.value = currentHistoryIndex === -1 ? '' : searchHistory[currentHistoryIndex];
      }
    }
  });
});