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
    if (typeof value === 'object' && value !== null) {
      // Render object property as label-value pair
      // Handle special cases for setting property
      if (key === 'setting') {
        // Handle setting property
        renderSetting(value);
      } else {
        renderObjectProperty(key, value);
      }
    } else if (Array.isArray(value)) {
      // Render array property as table
      renderArrayProperty(key, value);
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
  element.innerHTML = `<p><strong>${key}:</strong> ${value}</p>`;
  detailContent.appendChild(element);
}

// Function to render an object property
function renderObjectProperty(key, value) {
  // Render object property as label-value pair
  renderProperty(key, JSON.stringify(value));
}

// Function to render an array property as a table
function renderArrayProperty(key, value) {
  // Render array property as table
  // You can use any table rendering method you prefer
}

// Function to render the setting property
function renderSetting(setting) {
  // Check if refetch property is true
  if (setting.refetch) {
    // Display refetch button
    const refetchButton = document.getElementById('refetchButton');
    refetchButton.style.display = 'block';
    refetchButton.addEventListener('click', () => {
      // Make API request to fetch new data
      // You'll need to modify this part to handle the refetch logic
    });
  }

  // Check if json property is true
  if (setting.json) {
    // Display JSON button
    const jsonButton = document.getElementById('jsonButton');
    jsonButton.style.display = 'block';
    jsonButton.addEventListener('click', () => {
      // Make API request to fetch JSON data
      // You'll need to modify this part to handle the JSON display logic
    });
  }
}

// Fetch data when the page loads
document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  apiEndpoint = params.get('apiEndpoint');
  key = params.get('key');
  value = params.get('value');

  fetchData();
});

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

async function fetchWithToken(path, options = {}) {
  const token = localStorage.getItem('token');
  const api_root = await window.electron.getApiRoot();
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };
  const updatedOptions = { ...options, headers };

  return await fetch(`${api_root}${path}`, updatedOptions);
}
