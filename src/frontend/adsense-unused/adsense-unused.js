const { ipcRenderer } = require('electron');

function formatCurrency(value) {
  return value !== undefined && value !== null ? `${value.toFixed(2)} $` : '';
}

function formatNumber(value) {
  return value ? value.toLocaleString() : '';
}

document.addEventListener('DOMContentLoaded', async () => {
  const emailFilterInput = document.getElementById('emailFilter');
  const siteFilterInput = document.getElementById('siteFilter');
  const filterButton = document.getElementById('filterButton');

  filterButton.addEventListener('click', fetchAndRenderData);

  emailFilterInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      fetchAndRenderData();
    }
  });

  siteFilterInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      fetchAndRenderData();
    }
  });

  async function fetchAndRenderData() {
    const email = emailFilterInput.value.trim();
    const site = siteFilterInput.value.trim();
    const query = new URLSearchParams();

    if (email) {
      query.set('email', email);
    }
    if (site) {
      query.set('site', site);
    }

    try {
      const response = await fetch(`http://localhost:3000/adsense/unused?${query.toString()}`);
      const data = await response.json();

      const tableBody = document.querySelector('#adsense-unused-table tbody');
      tableBody.innerHTML = ''; // Clear previous content

      data.forEach((item, index) => {
        const actionIcon = item.done ? '../assets/done-icon.svg' : '../assets/run-icon.svg';
        const clickable = item.done ? '' : 'clickable';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.email || ''}</td>
          <td><a href="#" class="pid-link" data-pid="${item.pid}">${item.pid || ''}</a></td>
          <td>${item.limit || ''}</td>
          <td class="center-icon"><img src="${actionIcon}" class="action-icon ${clickable}" data-pid="${item.pid}"></td>
          <td class="align-right">${formatCurrency(item.rpm)}</td>
          <td class="align-right">${formatNumber(item.views)}</td>
          <td class="align-right">${formatCurrency(item.today)}</td>
          <td class="align-right">${formatCurrency(item.yesterday)}</td>
          <td class="align-right">${formatCurrency(item.month)}</td>
          <td class="align-right">${formatCurrency(item.balance)}</td>
          <td>${item.sites || ''}</td>
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

      document.querySelectorAll('.run-icon.clickable').forEach((icon) => {
        icon.addEventListener('click', async (event) => {
          const pid = event.target.getAttribute('data-pid');
          try {
            const response = await fetch(`http://localhost:3000/adsense/run?pid=${pid}`, {
              method: 'POST',
            });
            if (response.status === 201) {
              event.target.src = '../assets/done-icon.svg';
              event.target.classList.remove('run-icon', 'clickable');
              event.target.classList.add('done-icon');
            }
          } catch (error) {
            console.error('Error running action:', error);
          }
        });
      });
    } catch (error) {
      console.error('Error fetching unused adsense data:', error);
    }
  }

  fetchAndRenderData();
});
