if (typeof CommonListComponent === 'undefined') {
  class CommonListComponent {
    constructor(config) {
      this.config = config;
      this.currentPage = 1;
      this.rowsPerPage = 100; // Default to 100 rows per page
      this.currentSort = { column: '', order: 'asc' };
      this.debounceTimer = null;
      this.doneIcon = '';
      this.init();
    }

    async init() {
      try {
        const response = await fetch(this.config.apiEndpoint);
        const { title, headers, filters, data, totalRecords } = await response.json();

        document.title = title;
        document.getElementById('list-title').innerText = title;

        this.tableHeaders = document.getElementById('table-headers');
        this.tableBody = document.querySelector('#common-table tbody');

        this.populateFilters(filters);
        this.populateHeaders(headers);
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
      filterSection.innerHTML = ''; // Clear previous filters

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
      query.set('rowsPerPage', this.rowsPerPage); // Include rowsPerPage in the query
      query.set('sortBy', this.currentSort.column);
      query.set('order', this.currentSort.order);

      try {
        const response = await fetch(`${this.config.apiEndpoint}?${query.toString()}`);
        const { headers, data, totalRecords } = await response.json();

        this.tableBody.innerHTML = ''; // Clear previous content
        this.renderTableData(headers, data);
        this.updatePagination(totalRecords);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    renderTableData(headers, data) {
      data.forEach((item, index) => {
        const tr = document.createElement('tr');
        let rowHTML = `<td>${(this.currentPage - 1) * this.rowsPerPage + index + 1}</td>`; // Adjusted for rowsPerPage

        headers.forEach((header) => {
          let cellValue = item[header.key] || '';
          if (header.key === 'pid' && cellValue) {
            cellValue = `<a href="adsense-detail.html?pid=${item.pid}" target="_blank">${item.pid}</a>`;
          } else if (header.key === 'action') {
            this.doneIcon = `./assets/${header.type ? header.type + '-' : ''}done-icon.svg`;
            const runIcon = `./assets/${header.type ? header.type + '-' : ''}run-icon.svg`;
            if (item.action === 'run') {
              cellValue = `<img src="${runIcon}" class="small-icon clickable" data-pid="${item.pid}">`;
            } else if (item.action === 'done') {
              cellValue = `<img src="${this.doneIcon}" class="small-icon">`;
            }
          } else if (header.type === 'currency') {
            cellValue = item[header.key] !== undefined ? `${item[header.key].toFixed(2)} $` : '';
          } else if (header.type === 'number') {
            cellValue = item[header.key] !== undefined ? item[header.key].toLocaleString() : '';
          }
          rowHTML += `<td${header.key === 'action' ? ' class="align-center"' : ''}>${cellValue}</td>`;
        });

        tr.innerHTML = rowHTML;
        this.tableBody.appendChild(tr);
      });

      document.querySelectorAll('.clickable').forEach((icon) => {
        icon.addEventListener('click', async (event) => {
          const pid = event.target.getAttribute('data-pid');
          try {
            const response = await fetch(`http://localhost:3000/adsense/wordpress?pid=${pid}`, { method: 'POST' });
            if (response.status === 201) {
              event.target.src = './assets/done-icon.svg';
              event.target.classList.remove('clickable');
            }
          } catch (error) {
            console.error('Error running action:', error);
          }
        });
      });
    }

    populateHeaders(headers) {
      this.tableHeaders.innerHTML = ''; // Clear previous headers

      // Add default "No" column
      const noColumn = document.createElement('th');
      noColumn.textContent = 'No';
      this.tableHeaders.appendChild(noColumn);

      headers.forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header.label;
        if (header.sortable) {
          th.dataset.sort = header.key;
          th.addEventListener('click', () => this.handleSort(header.key));
        }
        if (header.align) {
          th.style.textAlign = header.align;
        }
        this.tableHeaders.appendChild(th);
      });
    }

    handleSort(column) {
      if (this.currentSort.column === column) {
        this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSort.column = column;
        this.currentSort.order = 'asc';
      }
      this.fetchAndRenderData();
    }

    updatePagination(totalRecords) {
      const totalPages = Math.ceil(totalRecords / this.rowsPerPage);
      document.getElementById('prevPageTop').disabled = this.currentPage === 1;
      document.getElementById('nextPageTop').disabled = this.currentPage === totalPages;
      document.getElementById('prevPageBottom').disabled = this.currentPage === 1;
      document.getElementById('nextPageBottom').disabled = this.currentPage === totalPages;

      document.getElementById('prevPageTop').addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.fetchAndRenderData();
        }
      });

      document.getElementById('nextPageTop').addEventListener('click', () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.fetchAndRenderData();
        }
      });

      document.getElementById('prevPageBottom').addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.fetchAndRenderData();
        }
      });

      document.getElementById('nextPageBottom').addEventListener('click', () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.fetchAndRenderData();
        }
      });
    }

    debounce(func, wait) {
      return (...args) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => func.apply(this, args), wait);
      };
    }
  }

  function loadCommonListComponent(apiEndpoint) {
    fetch('./common/list.html')
      .then((response) => response.text())
      .then((html) => {
        document.getElementById('component-root').innerHTML = html;
        const script = document.createElement('script');
        script.src = './common/list.js';
        document.body.appendChild(script);
        script.onload = () => {
          new CommonListComponent({ apiEndpoint });
        };
      })
      .catch((error) => console.error('Error loading common list:', error));
  }
}
