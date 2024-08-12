let searchHistory = [];
let currentHistoryIndex = -1;
let autoCompleteIndex = -1;
let ctrlRMode = false;
let ctrlRSearch = '';

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

function updateTerminal(text, isCommand = true) {
  const terminal = document.getElementById('terminal');
  terminal.innerHTML += `<div>${isCommand ? '> ' : ''}${text}</div>`;
  terminal.scrollTop = terminal.scrollHeight;
}

function autocomplete(input) {
  return searchHistory.find(h => h.startsWith(input)) || '';
}

function renderAutocomplete(suggestion) {
  const autocompleteSpan = document.getElementById('autocomplete');
  autocompleteSpan.textContent = suggestion;
}

function enterCtrlRMode() {
  ctrlRMode = true;
  ctrlRSearch = '';
  updateTerminal('(reverse-i-search)``: ', false);
}

function updateCtrlRSearch() {
  const terminal = document.getElementById('terminal');
  const lastLine = terminal.lastChild;
  lastLine.innerHTML = `(reverse-i-search)\`${ctrlRSearch}\`: ${searchHistory.find(h => h.includes(ctrlRSearch)) || ''}`;
}

document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('input');

  chrome.storage.local.get('searchHistory', function(data) {
    searchHistory = data.searchHistory || [];
  });

  input.addEventListener('keydown', function(e) {
    if (ctrlRMode) {
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        const matches = searchHistory.filter(h => h.includes(ctrlRSearch));
        if (matches.length > 0) {
          currentHistoryIndex = (currentHistoryIndex + 1) % matches.length;
          updateCtrlRSearch();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        ctrlRMode = false;
        input.value = searchHistory.find(h => h.includes(ctrlRSearch)) || '';
        updateTerminal(input.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        ctrlRMode = false;
        input.value = '';
        updateTerminal('');
      } else if (e.key.length === 1) {
        ctrlRSearch += e.key;
        updateCtrlRSearch();
      }
      return;
    }

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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const suggestion = autocomplete(input.value);
      if (suggestion) {
        input.value = suggestion;
      }
    } else if (e.key === 'r' && e.ctrlKey) {
      e.preventDefault();
      enterCtrlRMode();
    }
  });

  input.addEventListener('input', function() {
    if (!ctrlRMode) {
      const suggestion = autocomplete(input.value);
      renderAutocomplete(suggestion.slice(input.value.length));
    }
  });
});