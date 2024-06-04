const { shell } = require('electron');

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('pid');

  function fetchDetail(pid) {
    fetch(`http://localhost:3000/adsense/detail?pid=${pid}`)
      .then((response) => response.json())
      .then((data) => {
        populateSitesTable(data.sites || []);
        populateReportTable(
          data.report || [],
          data.monthReport || {},
          data.todayReport || {},
        );
        const detailElement = document.getElementById('adsense-detail');
        detailElement.innerHTML = syntaxHighlight(
          JSON.stringify(data, null, 2),
          data.email,
          data.pid,
        );
      })
      .catch((error) => console.error('Error fetching adsense detail:', error));
  }

  function populateSitesTable(sites) {
    const tbody = document.querySelector('#sites-table tbody');
    tbody.innerHTML = '';
    sites.forEach((site) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><a href="#" onclick="openExternalLink('${site.url}')">${
        site.name
      }</a></td>
        <td class="${getStatusClass(site.status)}">${site.status}</td>
        <td>${site.fetchedAt}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function getStatusClass(status) {
    switch (status) {
      case 'Ready':
        return 'status-ready';
      case 'Needs attention':
        return 'status-needs-attention';
      case 'Requires review':
        return 'status-requires-review';
      case 'Getting ready':
        return 'status-getting-ready';
      default:
        return '';
    }
  }

  function openExternalLink(url) {
    shell.openExternal(url);
  }

  function populateReportTable(report, monthReport, todayReport) {
    const tbody = document.querySelector('#report-table tbody');
    tbody.innerHTML = '';

    function addReportRow(site, report) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: left;">${site}</td>
        <td style="text-align: right;">${formatCurrency(
          report.estimatedEarnings,
        )}</td>
        <td style="text-align: right;">${formatNumber(report.pageViews)}</td>
        <td style="text-align: right;">${formatCurrency(report.pageRPM)}</td>
        <td style="text-align: right;">${formatNumber(report.impressions)}</td>
        <td style="text-align: right;">${formatCurrency(
          report.impressionRPM,
        )}</td>
        <td style="text-align: right;">${report.clicks || ''}</td>
        <td style="text-align: right;">${formatCurrency(report.cpc)}</td>
        <td style="text-align: right;">${formatPercent(report.pageCTR)}</td>
        <td style="text-align: right;">${report.updatedAt || ''}</td>
      `;
      tbody.appendChild(tr);
    }

    addReportRow('TODAY', todayReport);
    report.forEach((r) => addReportRow(r.site, r));

    // Add separator for MONTH row
    const separator = document.createElement('tr');
    separator.innerHTML = '<td colspan="10" style="height: 20px;"></td>';
    tbody.appendChild(separator);

    addReportRow('MONTH', monthReport);
  }

  function formatCurrency(value) {
    return value ? `$${value.toLocaleString()}` : '';
  }

  function formatNumber(value) {
    return value ? value.toLocaleString() : '';
  }

  function formatPercent(value) {
    return value ? `${(value * 100).toFixed(2)}%` : '';
  }

  function syntaxHighlight(json, email, pid) {
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
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

        if (
          (match.includes(email) || match.includes(pid)) &&
          match.includes('adsense')
        ) {
          cls += ' json-highlight';
        }

        return '<span class="' + cls + '">' + match + '</span>';
      },
    );
  }

  fetchDetail(pid);
});
