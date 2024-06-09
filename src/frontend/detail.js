let apiEndpoint, key, value;

// Function to make API requests
function fetchData() {
  const url = `${apiEndpoint}?${key}=${value}`;
  fetchWithToken(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    })
    .then((data) => {
      // Process the data and update the DOM
      renderDetail(data);
    })
    .catch((error) => {
      // Display error message
      console.error('Error:', error.message);
      renderError(error.message);
    });
}

// Function to render detail content
function renderDetail(data) {
  // Clear previous content
  document.getElementById('detailContent').innerHTML = '';

  // Render each property of the data object
  for (const [key, value] of Object.entries(data)) {
    console.log(value, typeof value, Array.isArray(value));
    if (key === 'setting') {
      // do nothing
    } else if (key === 'title') {
      document.getElementById('title').innerText = value;
      document.title = value;
    } else if (key === 'all') {
      renderAll(value);
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // Render array property as table
        renderArrayProperty(key, value);
      } else {
        renderObjectProperty(key, value);
      }
    } else {
      // Render other properties as label-value pair
      renderProperty(key, value);
    }
  }
}

// Function to render error message
function renderError(message) {
  document.getElementById('detailContent').innerHTML = `<p>Error: ${message}</p>`;
}

// Function to render a property as label-value pair
function renderProperty(key, value) {
  const detailContent = document.getElementById('detailContent');
  const element = document.createElement('div');
  element.innerHTML = `<p><strong>${key}:</strong> ${formatValue(key, value)}</p>`;
  detailContent.appendChild(element);
}

// Function to render an object property
function renderObjectProperty(key, value) {
  const detailContent = document.getElementById('detailContent');
  const element = document.createElement('div');
  const ul = document.createElement('ul');

  // Iterate over the object properties
  for (const prop in value) {
    if (Object.hasOwnProperty.call(value, prop)) {
      const li = document.createElement('li');
      li.innerHTML = `${prop}: ${formatValue(key, value[prop])}`;
      ul.appendChild(li);
    }
  }

  element.innerHTML = `<p><strong>${key}:</strong></p>`;
  element.appendChild(ul);
  detailContent.appendChild(element);
}

function renderArrayProperty(key, value) {
  const detailContent = document.getElementById('detailContent');

  const label = document.createElement('p');
  label.textContent = key;
  label.classList.add('property-label');
  detailContent.appendChild(label);

  const table = document.createElement('table');
  table.classList.add('array-table');

  // Create table header
  const headerRow = document.createElement('tr');
  console.log('value[0]', value[0]);
  for (const key in value[0]) {
    const th = document.createElement('th');
    th.textContent = key;
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Create table rows
  for (let i = 0; i < value.length; i++) {
    const row = document.createElement('tr');
    for (const key in value[i]) {
      const td = document.createElement('td');
      td.textContent = formatValue(key, value[i][key]);
      row.appendChild(td);
    }
    table.appendChild(row);
  }

  // Append table to detail content
  detailContent.appendChild(table);
}

function renderAll(value) {
  const jsonElement = document.getElementById('jsonDisplay');
  jsonElement.style.display = 'block';
  jsonElement.innerHTML = syntaxHighlight(JSON.stringify(value, null, 2));
}

// Fetch data when the page loads
document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  apiEndpoint = params.get('apiEndpoint');
  key = params.get('key');
  value = params.get('value');
  fetchData();
});
const refetchButton = document.getElementById('refetchButton');
refetchButton.addEventListener('click', () => {
  fetchData();
});

function formatValue(key, value) {
  if (['estimatedEarnings', 'pageRPM', 'impressionRPM', 'cpc'].includes(key)) return formatCurrency(value);
  if (['pageViews', 'impressions', 'clicks'].includes(key)) return formatValue(value);
  if (['pageCTR'].includes(key)) return formatPercent(value);
  return value;
}
function formatCurrency(value) {
  return value !== undefined && value !== null ? `${value.toFixed(2)} $` : '';
}

function formatDate(value) {
  if (value === undefined || value === null) return '';
  const date = new Date(parseInt(value));
  return date.toLocaleString();
}

function formatNumber(value) {
  return value !== undefined && value !== null ? value.toLocaleString() : '';
}

function formatPercent(value) {
  return value ? `${(value * 100).toFixed(2)}%` : '';
}

async function fetchWithToken(path, options = {}) {
  const token = localStorage.getItem('token');
  const api_root = await window.electron.getApiRoot();
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };
  const updatedOptions = { ...options, headers };

  return await fetch(`${api_root}${path}`, updatedOptions);
}
function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-value';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }

    return '<span class="' + cls + '">' + match + '</span>';
  });
}
