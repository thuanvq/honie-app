const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const nameFilterInput = document.getElementById('nameFilter');
  const wordpressFilterCheckbox = document.getElementById('wordpressFilter');

  const filterButton = document.getElementById('filterButton');
  filterButton.addEventListener('click', fetchAndRenderData);

  nameFilterInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      fetchAndRenderData();
    }
  });

  wordpressFilterCheckbox.addEventListener('change', fetchAndRenderData);

  async function fetchAndRenderData() {
    const name = nameFilterInput.value.trim();
    const wordpress = wordpressFilterCheckbox.checked;
    const query = new URLSearchParams({ status });

    if (name) {
      query.set('name', name);
    }
    if (wordpress) {
      query.set('wordpress', 'true');
    }

    try {
      const response = await fetch(
        `http://localhost:3000/adsense/websites?${query.toString()}`,
      );
      const data = await response.json();

      const tableBody = document.querySelector('#websites-table tbody');
      tableBody.innerHTML = ''; // Clear previous content

      data.forEach((website, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${website.name}</td>
          <td><a href="#" class="pid-link" data-pid="${website.pid}">${
          website.pid
        }</a></td>
          <td>${website.email}</td>
          <td>${new Date(website.fetchedAt).toLocaleString()}</td>
        `;
        tableBody.appendChild(tr);
      });

      document.querySelectorAll('.pid-link').forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          const pid = event.target.getAttribute('data-pid');
          ipcRenderer.send('open-detail-window', pid);
        });
      });
    } catch (error) {
      console.error('Error fetching websites data:', error);
    }
  }

  fetchAndRenderData();
});
