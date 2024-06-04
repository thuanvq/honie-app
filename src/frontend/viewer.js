document.addEventListener('DOMContentLoaded', function () {
  const collectionSelect = document.getElementById('collection-select');
  const queryCondition = document.getElementById('query-condition');
  const queryProjection = document.getElementById('query-projection');
  const querySort = document.getElementById('query-sort');
  const applyQueryButton = document.getElementById('apply-query');
  const adsenseData = document.getElementById('adsense-data');
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const pageInfo = document.getElementById('page-info');

  let currentPage = 1;
  const limit = 10;
  let total = 0;

  async function fetchCollections() {
    try {
      const response = await fetch(
        'http://localhost:3000/viewer/get-collections',
      );
      const collections = await response.json();
      collections.forEach((collection) => {
        const option = document.createElement('option');
        option.value = collection.name;
        option.textContent = collection.name;
        collectionSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  }

  async function fetchData() {
    const collection = collectionSelect.value;
    const condition = queryCondition.value
      ? JSON.parse(queryCondition.value)
      : {};
    const projection = queryProjection.value
      ? JSON.parse(queryProjection.value)
      : {};
    const sort = querySort.value ? JSON.parse(querySort.value) : {};

    try {
      const response = await fetch(
        'http://localhost:3000/viewer/query-collection',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection,
            condition,
            projection,
            sort,
            skip: (currentPage - 1) * limit,
            limit,
          }),
        },
      );

      const result = await response.json();
      displayData(result.data);
      total = result.total;
      updatePagination();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  function displayData(data) {
    adsenseData.innerHTML = '';
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        const pre = document.createElement('pre');
        pre.innerHTML = syntaxHighlight(JSON.stringify(item, null, 2));
        adsenseData.appendChild(pre);
      });
    } else {
      adsenseData.textContent = 'No data found';
    }
  }

  function syntaxHighlight(json) {
    json = json.replace(/(&|<|>|")/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
      }[match];
    });

    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|true|false|null|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
      function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      },
    );
  }

  function updatePagination() {
    const totalPages = Math.ceil(total / limit);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  }

  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchData();
    }
  });

  nextButton.addEventListener('click', () => {
    const totalPages = Math.ceil(total / limit);
    if (currentPage < totalPages) {
      currentPage++;
      fetchData();
    }
  });

  applyQueryButton.addEventListener('click', fetchData);

  fetchCollections();
});
