if (typeof CommonListComponent === 'undefined') {
  let init = false;
  class CommonListComponent {
    constructor(config) {
      this.config = config;
      this.currentPage = 1;
      this.rowsPerPage = 100;
      this.currentSort = { column: '', order: 'asc' };
      this.debounceTimer = null;
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
        const { headers, data, filters, title, totalRecords, summary } = await response.json();
        if (!init) {
          document.title = title;
          document.getElementById('list-title').innerText = title;
          this.totalRecords.innerText = `Total Records: ${totalRecords}`;
          this.summaryText.innerText = summary;
          this.populateFilters(filters);
          this.populateHeaders(headers);
          this.totalRecords.innerText = `Total Records: ${totalRecords}`;
          init = true;
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
        let rowHTML = `<td>${(this.currentPage - 1) * this.rowsPerPage + index + 1}</td>`;

        headers.forEach((header) => {
          let tdClass = '';
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
            tdClass = 'align-center';
          } else if (header.type === 'currency') {
            cellValue = formatCurrency(item[header.key]);
            tdClass = 'align-right';
          } else if (header.type === 'number') {
            cellValue = formatNumber(item[header.key]);
            tdClass = 'align-right';
          }
          rowHTML += `<td class="${tdClass}">${cellValue}</td>`;
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
              event.target.src = this.doneIcon;
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
        this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSort.column = column;
        this.currentSort.order = 'asc';
      }
      this.fetchAndRenderData();
      this.updateSortIcons();
    }

    updateSortIcons() {
      document.querySelectorAll('#table-headers th').forEach((header) => {
        const sortBy = header.getAttribute('data-sort');
        if (sortBy === this.currentSort.column) {
          header.innerHTML = `${header.getAttribute('data-label')} <span style="font-size: 12px; color: #aaa;">${
            this.currentSort.order === 'asc' ? '▲' : '▼'
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
      document.getElementById('prevPageBottom').disabled = this.currentPage === 1;
      document.getElementById('nextPageBottom').disabled = this.currentPage === totalPages;

      const prevPageTopButton = document.getElementById('prevPageTop');
      const nextPageTopButton = document.getElementById('nextPageTop');
      const prevPageBottomButton = document.getElementById('prevPageBottom');
      const nextPageBottomButton = document.getElementById('nextPageBottom');

      prevPageTopButton.removeEventListener('click', this.handlePrevPageClick);
      nextPageTopButton.removeEventListener('click', this.handleNextPageClick);
      prevPageBottomButton.removeEventListener('click', this.handlePrevPageClick);
      nextPageBottomButton.removeEventListener('click', this.handleNextPageClick);

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
      prevPageBottomButton.addEventListener('click', this.handlePrevPageClick);
      nextPageBottomButton.addEventListener('click', this.handleNextPageClick);
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

function formatCurrency(value) {
  return value !== undefined && value !== null ? `${value.toFixed(2)} $` : '';
}

function formatNumber(value) {
  return value ? value.toLocaleString() : '';
}
