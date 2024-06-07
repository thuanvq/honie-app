const pid = new URLSearchParams(window.location.search).get('pid');
document.getElementById('pid').textContent = pid;
document.title = `Refetch ${pid}`;
let hasHeader = false;

const loadingArea = document.getElementById('loading-area');
const unknownArea = document.getElementById('unknown-area');
const logArea = document.getElementById('log-area');
const errorArea = document.getElementById('error-area');
const errorMessageInput = document.getElementById('error-message');
const errorButton = document.getElementById('send-error');
const buttons = document.querySelectorAll('.buttons button');

errorButton.addEventListener('click', async () => {
  const errorMessage = errorMessageInput.value;
  try {
    await fetch(`http://localhost:3000/adsense/error?pid=${input}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: errorMessage }),
    });
    alert('Error message sent successfully');
  } catch (error) {
    alert(`Failed to send error message: ${error.message}`);
  }
});

buttons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (pid) {
      await syncOnePid(pid, button.id);
    } else {
      const response = await fetch('http://localhost:3000/adsense-sync/pid', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        await syncOnePid(data[i], button.id);
      }
    }
  });
});

async function syncOnePid(p, i) {
  const apiMap = {
    'refetch-sites': 'http://localhost:3000/adsense-sync/refetch-sites',
    'refetch-today': 'http://localhost:3000/adsense-sync/refetch-today',
    'refetch-month': 'http://localhost:3000/adsense-sync/refetch-month',
    'refetch-all': 'http://localhost:3000/adsense-sync/refetch-all',
  };
  const apiUrl = apiMap[i];
  loadingArea.style = 'display:';

  try {
    const response = await fetch(`${apiUrl}?pid=${p}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    loadingArea.style = 'display:none';
    const res = formatTable(data);
    if (res.header) {
      hasHeader = true;
      logArea.innerHTML = res.header.replace('<tbody>', `<tbody>${res.body}`);
    } else if (res.body) {
      const table = document.getElementById('log-table');
      const newRow = table.insertRow(1);
      const emptyCell = newRow.insertCell(0);
      emptyCell.colSpan = table.rows[1].cells.length;
      emptyCell.innerHTML = '&nbsp;';
      logArea.innerHTML = logArea.innerHTML.replace('<tbody>', `<tbody>${res.body}`);
    } else {
      unknownArea.innerHTML += `${res.message}<br/>` + unknownArea.innerHTML;
    }
  } catch (error) {
    loadingArea.style = 'display:none';
    unknownArea.innerHTML += `<br/><div class="error">Error fetching data: ${error.message}</div>`;
  }
}

function formatTable(data) {
  if (Array.isArray(data)) {
    let header = '',
      body = '';
    if (data.length === 0) return { message: '<div class="error">No data available</div>' };

    const headers = Object.keys(data[0]);
    if (!hasHeader) {
      header += `<table id="log-table" border="1" cellspacing="0" cellpadding="5"><thead><tr>`;
      header += `<th></th>`;
      headers.forEach((h) => {
        header += `<th>${h}</th>`;
      });
      header += '</tr></thead><tbody></tbody></table>';
    }
    data.forEach((row, index) => {
      body += `<tr><td>${index}</td>`;
      headers.forEach((h) => {
        body += `<td>${row[h]}</td>`;
      });
      body += '</tr>';
    });
    return { header, body };
  } else if (typeof data === 'object') {
    errorArea.style.display = 'block';
    return { message: `<pre>${JSON.stringify(data, null, 2)}</pre>` };
  } else {
    errorArea.style.display = 'block';
    return { message: `<pre>${data}</pre>` };
  }
}
