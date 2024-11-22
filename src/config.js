// src/config.js
const loadConfig = () => {
  return new Promise((resolve, reject) => {
    // Check if the configuration is already loaded
    if (window.__CONFIG__) {
      resolve(window.__CONFIG__);
      return;
    }

    const script = document.createElement('script');
    script.src = '/config.js';
    script.async = true;

    script.onload = () => {
      if (window.__CONFIG__) {
        resolve(window.__CONFIG__);
      } else {
        reject(new Error('Configuration not found in window.__CONFIG__'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load /config.js'));
    };

    document.head.appendChild(script);
  });
};

export default loadConfig;
