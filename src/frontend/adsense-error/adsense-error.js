document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/adsense/errors');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const tableBody = document.querySelector('#adsense-error-table tbody');

    data.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.email}</td>
        <td>${row.pid}</td>
        <td>${row.error}</td>
        <td>${row.month}</td>
        <td>${row.balance}</td>
        <td>${row.sites}</td>
      `;
      tableBody.appendChild(tr);
    });

    // Add sorting functionality (basic example)
    document
      .querySelectorAll('#adsense-error-table th')
      .forEach((header, index) => {
        header.addEventListener('click', () => {
          const rows = Array.from(tableBody.querySelectorAll('tr'));
          const sortedRows = rows.sort((a, b) => {
            const aText = a.children[index].textContent;
            const bText = b.children[index].textContent;
            return aText.localeCompare(bText);
          });
          tableBody.innerHTML = '';
          sortedRows.forEach((row) => tableBody.appendChild(row));
        });
      });
  } catch (error) {
    console.error('Error fetching adsense detail:', error); // Debugging: Log any errors
  }
});
