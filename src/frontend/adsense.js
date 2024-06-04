document.addEventListener('DOMContentLoaded', function () {
  fetch('http://localhost:3000/adsense/data')
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.querySelector('#adsense-table tbody');
      tbody.innerHTML = '';
      data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td>${index + 1}</td>
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
    })
    .catch((error) => console.error('Error fetching adsense data:', error));
});
