document.querySelector('form').addEventListener('submit', function() {
  const query = document.querySelector('textarea[name="q"], input[name="q"]').value.trim();
  if (query) {
    chrome.runtime.sendMessage({ action: "addSearch", query: query });
  }
});
