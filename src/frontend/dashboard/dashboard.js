document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/app/dashboard')
    .then((response) => response.json())
    .then((data) => {
      const { revenue, traffic, rpm, adsense } = data;

      const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
      const ctxTraffic = document.getElementById('trafficChart').getContext('2d');
      const ctxRpm = document.getElementById('rpmChart').getContext('2d');
      const ctxAdsense = document.getElementById('adsenseChart').getContext('2d');

      new Chart(ctxRevenue, {
        type: 'bar',
        data: {
          labels: revenue.labels,
          datasets: [
            {
              label: 'Revenue',
              data: revenue.data,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              display: true,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(context.parsed.y);
                  }
                  return label;
                },
              },
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: (value) => value + ' $',
            },
          },
        },
      });

      new Chart(ctxTraffic, {
        type: 'bar',
        data: {
          labels: traffic.labels,
          datasets: [
            {
              label: 'Traffic',
              data: traffic.data,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              display: true,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                  }
                  return label;
                },
              },
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: (value) => value.toLocaleString(),
            },
          },
        },
      });

      new Chart(ctxRpm, {
        type: 'line',
        data: {
          labels: rpm.labels,
          datasets: rpm.data.map((dataset, index) => ({
            label: `RPM Day ${index + 1}`,
            data: dataset,
            fill: false,
            borderColor: `rgba(${54 + index * 20}, 162, 235, 1)`,
            backgroundColor: `rgba(${54 + index * 20}, 162, 235, 0.5)`,
          })),
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              display: true,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                  }
                  return label;
                },
              },
            },
          },
        },
      });

      new Chart(ctxAdsense, {
        type: 'bar',
        data: {
          labels: adsense.labels,
          datasets: [
            {
              type: 'bar',
              label: 'Adsense',
              data: adsense.data,
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
            {
              type: 'line',
              label: 'Trend',
              data: adsense.data,
              fill: false,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderWidth: 2,
              tension: 0.1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              display: true,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(context.parsed.y);
                  }
                  return label;
                },
              },
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: (value) => value + ' $',
            },
          },
        },
      });
    })
    .catch((error) => console.error('Error fetching data:', error));
});
