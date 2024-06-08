document.addEventListener('DOMContentLoaded', () => {
  const proxyListDiv = document.getElementById('proxyList');
  const checkResultDiv = document.getElementById('checkResult');

  async function fetchProxies() {
    try {
      const response = await axios.get('http://localhost:3000/app/proxy');
      const proxies = response.data;
      displayProxies(proxies);
    } catch (error) {
      console.error('Error fetching proxies:', error);
    }
  }

  function displayProxies(proxies) {
    proxyListDiv.innerHTML = '';

    proxies.forEach((proxy, index) => {
      const proxyDiv = document.createElement('div');
      proxyDiv.classList.add('proxy');
      proxyDiv.innerHTML = `
        <span>${proxy}</span>
        <button data-proxy="${proxy}" id="checkButton${index}">Check</button>
      `;
      proxyListDiv.appendChild(proxyDiv);

      document.getElementById(`checkButton${index}`).addEventListener('click', () => {
        checkProxy(proxy);
      });
    });
  }

  function checkProxy(proxy) {
    window.electron.ipcRenderer.send('open-webview', proxy);
  }

  fetchProxies();
});
