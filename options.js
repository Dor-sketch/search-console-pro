document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['username', 'theme', 'showHeader'], function(data) {
    document.getElementById('username').value = data.username || 'user';
    document.getElementById('theme').value = data.theme || 'dark';
    document.getElementById('showHeader').checked = data.showHeader !== false;
  });

  document.getElementById('save').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const theme = document.getElementById('theme').value;
    const showHeader = document.getElementById('showHeader').checked;
    chrome.storage.local.set({ username, theme, showHeader }, function() {
      alert('Settings saved');
    });
  });
});
