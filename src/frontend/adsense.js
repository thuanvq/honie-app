document.addEventListener('DOMContentLoaded', function () {
  let currentPage = 1;
  const limit = 100;
  let currentSort = { column: 'rpm', order: 'desc' };

  function fetchData(page = 1, sortBy = 'rpm', order = 'desc') {
    fetch(
      `http://localhost:3000/adsense/data?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`,
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
        <td>${row.pid}</td>
        <td>${row.country || ''}</td>
        <td>${row.utc || ''}</td>
        <td>${row.limit || ''}</td>
        <td>${row.blogs || ''}</td>
        <td>${row.wait || ''}</td>
        <td>${row.rpm || ''}</td>
        <td>${row.views || ''}</td>
        <td>${row.impressions || ''}</td>
        <td>${row.clicks || ''}</td>
        <td>${row.today || ''}</td>
        <td>${row.yesterday || ''}</td>
        <td>${row.month || ''}</td>
        <td>${row.balance || ''}</td>
        <td>${row.updated || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function updateSortIcons() {
    document.querySelectorAll('#adsense-table th').forEach((header) => {
      const sortBy = header.getAttribute('data-sort');
      if (sortBy === currentSort.column) {
        header.innerHTML = `${header.getAttribute('data-label')} ${
          currentSort.order === 'asc' ? '▲' : '▼'
        }`;
      } else {
        header.innerHTML = header.getAttribute('data-label');
      }
    });
  }

  document.querySelectorAll('#adsense-table th').forEach((header) => {
    header.addEventListener('click', () => {
      const sortBy = header.getAttribute('data-sort');
      const order =
        currentSort.column === sortBy && currentSort.order === 'asc'
          ? 'desc'
          : 'asc';
      currentSort = { column: sortBy, order: order };
      header.setAttribute('data-order', order);
      fetchData(currentPage, sortBy, order);
    });
  });

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchData(currentPage, currentSort.column, currentSort.order);
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    fetchData(currentPage, currentSort.column, currentSort.order);
  });

  setTimeout(() => fetchData(), 2000);
});
