import React, { useEffect, useState } from 'react';
import { translations } from './translation';

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [currentLang, setCurrentLang] = useState('fr');

  const styles = {
    body: {
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      margin: 0,
      backgroundImage: 'url(assets/Fivem-logo.png)',
      backgroundSize: '90%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden'
    },
    container: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      width: '600px',
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '20px',
    },
    logs: {
      marginTop: '20px',
      padding: '10px',
      height: '200px',
      overflowY: 'auto',
      textAlign: 'left',
      backgroundColor: '#f8f8f8',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '12px'
    },
    credit: {
      fontSize: '12px',
      color: '#666',
      marginTop: '20px',
      textAlign: 'right',
      display: 'block',
      width: '100%',
    },
    languageSelector: {
      position: 'absolute',
      top: '20px',
      right: '20px',
    },
    select: {
      padding: '5px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      cursor: 'pointer',
    }
  };

  useEffect(() => {
    updateLanguage(currentLang);
  }, [currentLang]);

  function updateLanguage(lang) {
    document.title = translations[lang].pageTitle;
  }

  function addLog(message) {
    setLogs(prevLogs => [...prevLogs, {
      time: new Date().toLocaleTimeString(),
      message
    }]);
  }

  const handleCleanClick = () => {
    addLog(translations[currentLang].startCleaning);
    window.electronAPI.cleanLogs(currentLang);
  };

  useEffect(() => {
    const cleanHandler = (event, status) => {
      if (status === 'success') {
        addLog(translations[currentLang].cleanSuccess);
      } else {
        addLog(translations[currentLang].cleanError);
      }
    };

    const messageHandler = (event, message) => {
      addLog(message);
    };

    window.electronAPI.onLogsClean(cleanHandler);
    window.electronAPI.onLogMessage(messageHandler);

    return () => {
      window.electronAPI.removeLogsCleanListener();
      window.electronAPI.removeLogMessageListener();
    };
  }, [currentLang]);

  return (
    <div style={styles.body}>
      <div style={styles.languageSelector}>
        <select 
          style={styles.select}
          value={currentLang}
          onChange={(e) => setCurrentLang(e.target.value)}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>
      <div style={styles.container}>
        <h1>{translations[currentLang].title}</h1>
        <button 
          style={styles.button}
          onClick={handleCleanClick}
        >
          {translations[currentLang].cleanButton}
        </button>
        <div style={styles.logs}>
          {logs.map((log, index) => (
            <div key={index}>
              {`${log.time} - ${log.message}`}
            </div>
          ))}
        </div>
        <span style={styles.credit}>
          {translations[currentLang].credit}{' '}
          <a 
            href="https://logandelmairedev.com/" 
            target="_blank" 
            rel="noopener"
            style={{ textDecoration: 'none', color: '#666' }}
            onClick={(e) => {
              e.preventDefault();
              window.electronAPI.openExternal(e.target.href);
            }}
          >
            logandelmairedev (a.k.a.:TeekRoxx)
          </a>
        </span>
      </div>
    </div>
  );
}
