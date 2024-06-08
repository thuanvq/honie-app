if (typeof CommonListComponent === 'undefined') {
  let init = false;
  class CommonListComponent {
    constructor(config) {
      this.config = config;
      this.currentPage = 1;
      this.rowsPerPage = 100;
      this.currentSort = { column: '', order: '' };
      this.debounceTimer = null;
      this.primary = '';
      this.init();
    }

    async init() {
      try {
        this.tableHeaders = document.getElementById('table-headers');
        this.tableBody = document.querySelector('#common-table tbody');
        this.totalRecords = document.getElementById('total-records');
        this.summaryText = document.getElementById('summary-text');

        this.fetchAndRenderData();
      } catch (error) {
        console.error('Error initializing component:', error);
      }
    }

    populateFilters(filters) {
      const filterSection = document.querySelector('.filter-section');
      if (!filterSection) {
        console.error('Filter section not found');
        return;
      }
      filterSection.innerHTML = '';

      filters.forEach((filter) => {
        const label = document.createElement('label');
        label.innerText = `Filter by ${filter.label}:`;
        label.setAttribute('for', `${filter.key}Filter`);

        const input = document.createElement('input');
        input.id = `${filter.key}Filter`;
        input.type = filter.type;
        input.placeholder = `Enter ${filter.label.toLowerCase()}`;
        input.addEventListener(
          'input',
          this.debounce(() => this.fetchAndRenderData(), 300),
        );

        filterSection.appendChild(label);
        filterSection.appendChild(input);
      });
    }

    async fetchAndRenderData() {
      const query = new URLSearchParams();

      document.querySelectorAll('.filter-section input').forEach((input) => {
        if (input.type === 'checkbox') {
          if (input.checked) {
            query.set(input.id.replace('Filter', ''), input.checked);
          }
        } else {
          if (input.value.trim()) {
            query.set(input.id.replace('Filter', ''), input.value.trim());
          }
        }
      });

      query.set('page', this.currentPage);
      query.set('rowsPerPage', this.rowsPerPage);
      query.set('sortBy', this.currentSort.column);
      query.set('order', this.currentSort.order);

      try {
        const response = await fetch(`${this.config.apiEndpoint}?${query.toString()}`);
        const { headers, data, filters, title, totalRecords, summary, primary, create, refetch } = await response.json();
        this.primary = primary || 'pid';
        if (!init) {
          document.title = title;
          document.getElementById('list-title').innerText = title;
          this.summaryText.innerText = summary;
          this.populateFilters(filters);
          this.populateHeaders(headers);
          init = true;
        }
        this.totalRecords.innerText = `Total Records: ${totalRecords}`;
        if (create) {
          document.getElementById('createButton').style.display = 'block';
          document.getElementById('createButton').addEventListener('click', () => {
            const timestamp = new Date().getTime();
            localStorage.setItem(timestamp, JSON.stringify({ createFields: create, apiEndpoint: this.config.apiEndpoint }));
            window.electron.ipcRenderer.send('open-form', timestamp);
          });
        }
        if (refetch) {
          document.getElementById('refetchButton').style.display = 'block';
          document.getElementById('refetchButton').addEventListener('click', async () => {
            try {
              document.getElementById('refetchButton').innerText = 'Wait...';
              const refetchResponse = await fetch(`${this.config.apiEndpoint}/refetch`);
              if (refetchResponse.status === 200) {
                this.fetchAndRenderData();
                document.getElementById('refetchButton').innerText = 'Refetch';
              } else {
                console.error('Refetch failed:', refetchResponse.statusText);
                document.getElementById('refetchButton').innerText = 'Refetch';
              }
            } catch (error) {
              console.error('Error during refetch:', error);
              document.getElementById('refetchButton').innerText = 'Refetch';
            }
          });
        }

        this.tableBody.innerHTML = '';
        this.renderTableData(headers, data);
        this.updatePagination(totalRecords);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    renderTableData(headers, data) {
      data.forEach((item, index) => {
        const tr = document.createElement('tr');
        let rowHTML = `<td class="align-right">${(this.currentPage - 1) * this.rowsPerPage + index + 1}</td>`;

        headers.forEach((header) => {
          let tdClass = '';
          let cellValue = item[header.key] || '';
          if (header.key === 'pid' && cellValue) {
            cellValue = `<a href="#" onclick="openAdsense('${item.pid}')">${item.pid}</a>`;
          } else if (header.key === 'emailId' && cellValue) {
            cellValue = `<a href="#" onclick="openEmail('${item.emailId}')">${item.emailId}</a>`;
          } else if (header.key === 'website' && cellValue) {
            cellValue = `<a href="#" onclick="openWebView('${item.website}')">${item.website}</a>`;
          } else if (header.key === 'action') {
            const runIcon = `./assets/${header.type}-run-icon.svg`;
            if (item[header.type]) {
              cellValue = `<img src="${runIcon}" class="small-icon clickable" data-type="${header.type}" data-primary="${item[this.primary]}">`;
            }
            tdClass = 'align-center';
          } else if (header.type === 'currency') {
            cellValue = formatCurrency(item[header.key]);
            tdClass = 'align-right';
          } else if (header.type === 'number') {
            cellValue = formatNumber(item[header.key]);
            tdClass = 'align-right';
          } else if (header.type === 'date') {
            cellValue = formatDate(item[header.key]);
            tdClass = 'align-center';
          } else if (header.type === 'center') {
            tdClass = 'align-center';
          }
          rowHTML += `<td class="${tdClass}">${cellValue}</td>`;
        });

        tr.innerHTML = rowHTML;
        this.tableBody.appendChild(tr);
      });

      document.querySelectorAll('.clickable').forEach((icon) => {
        icon.addEventListener('click', async (event) => {
          const value = event.target.getAttribute('data-primary');
          const type = event.target.getAttribute('data-type');
          try {
            const response = await fetch(`${this.config.apiEndpoint}/${type}?${this.primary}=${value}`, { method: 'POST' });
            if (response.status === 201) {
              event.target.src = `./assets/${type}-done-icon.svg`;
              event.target.classList.remove('clickable');
            }
          } catch (error) {
            console.error('Error running action:', error);
          }
        });
      });
    }

    populateHeaders(headers) {
      this.tableHeaders.innerHTML = '';

      const noColumn = document.createElement('th');
      noColumn.textContent = 'No';
      this.tableHeaders.appendChild(noColumn);

      headers.forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header.label;
        th.setAttribute('data-label', header.label);
        if (header.sortable) {
          th.dataset.sort = header.key;
          th.addEventListener('click', () => this.handleSort(header.key));
        }
        if (header.align) {
          th.style.textAlign = header.align;
        }
        this.tableHeaders.appendChild(th);
      });
      this.updateSortIcons();
    }

    handleSort(column) {
      if (this.currentSort.column === column) {
        this.currentSort.order = this.currentSort.order === 'desc' ? 'asc' : 'desc';
      } else {
        this.currentSort.column = column;
        this.currentSort.order = 'desc';
      }
      this.fetchAndRenderData();
      this.updateSortIcons();
    }

    updateSortIcons() {
      document.querySelectorAll('#table-headers th').forEach((header) => {
        const sortBy = header.getAttribute('data-sort');
        if (sortBy === this.currentSort.column) {
          header.innerHTML = `${header.getAttribute('data-label')} <span style="font-size: 12px; color: #aaa;">${
            this.currentSort.order === 'desc' ? '▼' : '▲'
          }</span>`;
        } else {
          header.innerHTML = header.getAttribute('data-label');
        }
      });
    }

    updatePagination(totalRecords) {
      const totalPages = Math.ceil(totalRecords / this.rowsPerPage);
      document.getElementById('prevPageTop').disabled = this.currentPage === 1;
      document.getElementById('nextPageTop').disabled = this.currentPage === totalPages;

      const prevPageTopButton = document.getElementById('prevPageTop');
      const nextPageTopButton = document.getElementById('nextPageTop');

      prevPageTopButton.removeEventListener('click', this.handlePrevPageClick);
      nextPageTopButton.removeEventListener('click', this.handleNextPageClick);

      this.handlePrevPageClick = () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.fetchAndRenderData();
        }
      };

      this.handleNextPageClick = () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.fetchAndRenderData();
        }
      };

      prevPageTopButton.addEventListener('click', this.handlePrevPageClick);
      nextPageTopButton.addEventListener('click', this.handleNextPageClick);
    }

    debounce(func, wait) {
      return (...args) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => func.apply(this, args), wait);
      };
    }
  }

  function loadCommonListComponent(apiEndpoint) {
    new CommonListComponent({ apiEndpoint });
  }
  window.openAdsense = function (pid) {
    window.electron.ipcRenderer.send('open-adsense', pid);
  };
  window.openEmail = function (id) {
    window.electron.ipcRenderer.send('open-email', id);
  };
  window.openWebView = function (website) {
    window.electron.ipcRenderer.send('open-webview', `https://${website}`);
  };
  window.openForm = function (key) {
    window.electron.ipcRenderer.send('open-form', key);
  };
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
