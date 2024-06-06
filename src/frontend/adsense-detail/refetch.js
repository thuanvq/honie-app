document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pid = urlParams.get('pid');
  const pidInput = document.getElementById('pid-input');

  if (pid) {
    pidInput.value = pid;
  }

  const refetchSitesBtn = document.getElementById('refetch-sites-btn');
  const refetchTodayBtn = document.getElementById('refetch-today-btn');
  const refetchMonthBtn = document.getElementById('refetch-month-btn');
  const refetchAllBtn = document.getElementById('refetch-all-btn');
  const resultSites = document.getElementById('result-sites');
  const resultToday = document.getElementById('result-today');
  const resultMonth = document.getElementById('result-month');

  const showLoading = (element) => {
    element.innerHTML = '';
    element.classList.add('loading');
  };

  const hideLoading = (element) => {
    element.classList.remove('loading');
  };

  const renderTable = (data, element) => {
    hideLoading(element);
    if (!data || data.length === 0) {
      element.textContent = 'No data found';
      return;
    }

    const table = document.createElement('table');
    const headers = Object.keys(data[0]);
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((item) => {
      const tr = document.createElement('tr');
      headers.forEach((header) => {
        const td = document.createElement('td');
        td.textContent = item[header];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    element.appendChild(table);
  };

  const fetchData = async (url, resultElement) => {
    const pid = pidInput.value;
    if (!pid) {
      alert('Please enter a PID');
      return;
    }

    showLoading(resultElement);
    try {
      const response = await fetch(`${url}?pid=${pid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      renderTable(data, resultElement);
    } catch (error) {
      hideLoading(resultElement);
      resultElement.textContent = 'Error fetching data';
    }
  };

  refetchSitesBtn.addEventListener('click', () => fetchData(`http://localhost:3000/adsense-sync/refetch-sites`, resultSites));
  refetchTodayBtn.addEventListener('click', () => fetchData(`http://localhost:3000/adsense-sync/refetch-today`, resultToday));
  refetchMonthBtn.addEventListener('click', () => fetchData(`http://localhost:3000/adsense-sync/refetch-month`, resultMonth));
  refetchAllBtn.addEventListener('click', () => {
    fetchData(`http://localhost:3000/adsense-sync/refetch-sites`, resultSites);
    fetchData(`http://localhost:3000/adsense-sync/refetch-today`, resultToday);
    fetchData(`http://localhost:3000/adsense-sync/refetch-month`, resultMonth);
  });
});
