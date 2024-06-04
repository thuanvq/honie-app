const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function () {
  let currentPage = 1;
  const limit = 100;
  let currentSort = { column: 'rpm', order: 'desc' };

  function fetchSummary(inviteFilter = '') {
    fetch(`http://localhost:3000/adsense/summary?invite=${inviteFilter}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById('total-today').textContent = formatCurrency(
          data.today,
        );
        document.getElementById('total-yesterday').textContent = formatCurrency(
          data.yesterday,
        );
        document.getElementById('total-month').textContent = formatCurrency(
          data.month,
        );
        document.getElementById('total-balance').textContent = formatCurrency(
          data.balance,
        );
      })
      .catch((error) => console.error('Error fetching summary data:', error));
  }

  function fetchData(
    page = 1,
    sortBy = 'rpm',
    order = 'desc',
    inviteFilter = '',
  ) {
    fetch(
      `http://localhost:3000/adsense/data?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&invite=${inviteFilter}`,
    )
      .then((response) => response.json())
      .then((data) => {
        populateTable(data);
        updateSortIcons();
      })
      .catch((error) => console.error('Error fetching adsense data:', error));
  }

  function populateTable(data) {
    const tbody = document.querySelector('#adsense-table tbody');
    tbody.innerHTML = '';
    data.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${(currentPage - 1) * 100 + index + 1}</td>
        <td>${row.invite}</td>
        <td><a href="#" onclick="openDetail('${row.pid}')">${row.pid}</a></td>
        <td>${row.country || ''}</td>
        <td style="text-align: right;">${row.utc || ''}</td>
        <td style="text-align: right;">${row.limit || ''}</td>
        <td style="text-align: right;">${formatNumber(row.blogs) || ''}</td>
        <td>${row.wait || ''}</td>
        <td style="text-align: right;">${formatCurrency(row.rpm)}</td>
        <td style="text-align: right;">${formatNumber(row.views)}</td>
        <td style="text-align: right;">${formatNumber(row.impressions)}</td>
        <td style="text-align: right;">${row.clicks || ''}</td>
        <td style="text-align: right;">${formatCurrency(row.today)}</td>
        <td style="text-align: right;">${formatCurrency(row.yesterday)}</td>
        <td style="text-align: right;">${formatCurrency(row.month)}</td>
        <td style="text-align: right;">${formatCurrency(row.balance)}</td>
        <td>${row.updated || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function updateSortIcons() {
    document.querySelectorAll('#adsense-table th').forEach((header) => {
      const sortBy = header.getAttribute('data-sort');
      if (sortBy === currentSort.column) {
        header.innerHTML = `${header.getAttribute(
          'data-label',
        )} <span style="font-size: 12px; color: #aaa;">${
          currentSort.order === 'asc' ? '▲' : '▼'
        }</span>`;
      } else {
        header.innerHTML = header.getAttribute('data-label');
      }
    });
  }

  window.openDetail = function (pid) {
    ipcRenderer.send('open-detail-window', pid);
  };

  document.querySelectorAll('#adsense-table th').forEach((header) => {
    header.addEventListener('click', () => {
      const sortBy = header.getAttribute('data-sort');
      const order =
        currentSort.column === sortBy && currentSort.order === 'desc'
          ? 'asc'
          : 'desc';
      currentSort = { column: sortBy, order: order };
      header.setAttribute('data-order', order);
      currentPage = 1;
      fetchData(currentPage, sortBy, order);
    });
  });

  document.getElementById('prevPageTop').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchData(currentPage, currentSort.column, currentSort.order);
    }
  });

  document.getElementById('nextPageTop').addEventListener('click', () => {
    currentPage++;
    fetchData(currentPage, currentSort.column, currentSort.order);
  });

  document.getElementById('prevPageBottom').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchData(currentPage, currentSort.column, currentSort.order);
    }
  });

  document.getElementById('nextPageBottom').addEventListener('click', () => {
    currentPage++;
    fetchData(currentPage, currentSort.column, currentSort.order);
  });

  setTimeout(() => {
    fetchData();
    fetchSummary();
  }, 2000);

  const inviteFilterInput = document.getElementById('inviteFilter');

  inviteFilterInput.addEventListener('keyup', () => {
    const inviteFilter = inviteFilterInput.value.trim();
    fetchData(currentPage, currentSort.column, currentSort.order, inviteFilter);
    fetchSummary(inviteFilter);
  });
});

function formatCurrency(value) {
  return value !== undefined && value !== null ? `${value.toFixed(2)} $` : '';
}

function formatNumber(value) {
  return value ? value.toLocaleString() : '';
}

function formatPercent(value) {
  return value ? `${(value * 100).toFixed(2)}%` : '';
}
