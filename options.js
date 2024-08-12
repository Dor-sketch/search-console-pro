document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.local.get(['username', 'theme', 'showHeader'], function(data) {
    document.getElementById('username').value = data.username || 'user';
    document.getElementById('theme').value = data.theme || 'dark';
    document.getElementById('showHeader').checked = data.showHeader !== false;
  });

  // Save settings
  document.getElementById('save').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const theme = document.getElementById('theme').value;
    const showHeader = document.getElementById('showHeader').checked;

    chrome.storage.local.set({
      username: username,
      theme: theme,
      showHeader: showHeader
    }, function() {
      alert('Settings saved!');
    });
  });

  // Open Chrome's keyboard shortcuts page
  document.getElementById('openShortcutPage').addEventListener('click', function() {
    chrome.tabs.create({url: 'chrome://extensions/shortcuts'});
  });

  // Display current shortcut
  chrome.commands.getAll(function(commands) {
    const command = commands.find(cmd => cmd.name === "_execute_action");
    if (command && command.shortcut) {
      document.getElementById('currentShortcut').textContent = command.shortcut;
    }
  });
});