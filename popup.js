let searchHistory = [];
let terminalHistory = [];
let currentHistoryIndex = -1;
let autoCompleteIndex = -1;
let ctrlRMode = false;
let ctrlRSearch = '';
let ctrlRMatches = [];
let ctrlRMatchIndex = -1;
let username = 'user';
let theme = 'dark';
let showHeader = true;

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
  terminalHistory.push(isCommand ? `${username}@Terminal ~ % ${text}` : text);
  const terminal = document.getElementById('terminal');
  terminal.innerHTML = terminalHistory.join('<br>');
  terminal.scrollTop = terminal.scrollHeight;
  chrome.storage.local.set({ terminalHistory: terminalHistory });
}

function autocomplete(input) {
  const lowerInput = input.toLowerCase();
  return searchHistory.find(h => h.toLowerCase().startsWith(lowerInput)) || '';
}

function renderAutocomplete(suggestion) {
  const autocompleteSpan = document.getElementById('autocomplete');
  autocompleteSpan.textContent = suggestion;
}

function enterCtrlRMode() {
  ctrlRMode = true;
  ctrlRSearch = '';
  ctrlRMatches = [];
  ctrlRMatchIndex = -1;
  updateCtrlRDisplay();
}

function updateCtrlRDisplay() {
  const ctrlRElement = document.getElementById('ctrl-r-display');
  ctrlRElement.textContent = `(reverse-i-search)\`${ctrlRSearch}\`: ${ctrlRMatches[ctrlRMatchIndex] || ''}`;
  ctrlRElement.style.display = ctrlRMode ? 'block' : 'none';
}

function handleCtrlRInput(e) {
  if (e.key === 'r' && e.ctrlKey) {
    e.preventDefault();
    if (ctrlRMatches.length > 0) {
      ctrlRMatchIndex = (ctrlRMatchIndex + 1) % ctrlRMatches.length;
      input.value = ctrlRMatches[ctrlRMatchIndex];
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    exitCtrlRMode();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    exitCtrlRMode();
    input.value = '';
  } else if (e.key.length === 1) {
    ctrlRSearch += e.key;
    ctrlRMatches = searchHistory.filter(h => h.toLowerCase().includes(ctrlRSearch.toLowerCase()));
    ctrlRMatchIndex = ctrlRMatches.length > 0 ? 0 : -1;
    if (ctrlRMatches.length > 0) {
      input.value = ctrlRMatches[ctrlRMatchIndex];
    }
  }
  updateCtrlRDisplay();
}

function exitCtrlRMode() {
  ctrlRMode = false;
  updateCtrlRDisplay();
}

document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('input');
  const prompt = document.getElementById('prompt');
  const terminalHeader = document.getElementById('terminal-header');

  chrome.storage.local.get(['searchHistory', 'terminalHistory', 'username', 'theme', 'showHeader'], function(data) {
    searchHistory = data.searchHistory || [];
    terminalHistory = data.terminalHistory || [];
    username = data.username || 'user';
    theme = data.theme || 'dark';
    showHeader = data.showHeader !== false;

    document.body.className = theme;
    prompt.textContent = `${username}@Terminal ~ % `;
    terminalHeader.style.display = showHeader ? 'flex' : 'none';

    const terminal = document.getElementById('terminal');
    terminal.innerHTML = terminalHistory.join('<br>');
    terminal.scrollTop = terminal.scrollHeight;
  });

  input.addEventListener('keydown', function(e) {
    if (ctrlRMode) {
      handleCtrlRInput(e);
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
    } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
      e.preventDefault();
      if (currentHistoryIndex < searchHistory.length - 1) {
        currentHistoryIndex++;
        input.value = searchHistory[currentHistoryIndex];
      }
    } else if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
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