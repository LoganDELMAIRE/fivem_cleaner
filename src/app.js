const { translations } = require('./translation');

function updateLanguage(lang) {
  document.querySelector('h1').textContent = translations[lang].title;
  document.getElementById('cleanLogs').textContent = translations[lang].cleanButton;
  document.title = translations[lang].pageTitle;
  const creditText = document.getElementById('credit');

  creditText.innerHTML = `${translations[lang].credit} <a href="https://logandelmairedev.com/" target="_blank" rel="noopener">logandelmairedev (a.k.a.:TeekRoxx)</a>`;
}

function addLog(message) {
  const logsDiv = document.getElementById('logs');
  const logEntry = document.createElement('div');
  logEntry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  logsDiv.appendChild(logEntry);
  logsDiv.scrollTop = logsDiv.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialiser la langue
  const languageSelect = document.getElementById('languageSelect');
  updateLanguage(languageSelect.value);

  // Gérer le changement de langue
  languageSelect.addEventListener('change', (e) => {
    updateLanguage(e.target.value);
  });

  document.getElementById('cleanLogs').addEventListener('click', () => {
    const lang = languageSelect.value;
    addLog(translations[lang].startCleaning);
    window.electronAPI.cleanLogs();
  });

  window.electronAPI.onLogsClean((event, status) => {
    const lang = languageSelect.value;
    if (status === 'success') {
      addLog(translations[lang].cleanSuccess);
    } else {
      addLog(translations[lang].cleanError);
    }
  });

  window.electronAPI.onLogMessage((event, message) => {
    addLog(message);
  });

  // External link
  document.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.href && window.electronAPI) {
      event.preventDefault();
      window.electronAPI.openExternal(event.target.href);
    }
  });
});