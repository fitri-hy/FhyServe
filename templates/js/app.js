// Tab
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabButtons.forEach(button => {
	button.addEventListener('click', () => {
		const tabId = button.getAttribute('data-tab');
		tabButtons.forEach(btn => {
			btn.classList.remove('bg-emerald-500', 'text-white', 'font-semibold');
			btn.classList.add('bg-white', 'dark:bg-neutral-700', 'text-gray-700', 'dark:text-white');
		});
		button.classList.add('bg-emerald-500', 'text-white', 'font-semibold');
		button.classList.remove('bg-white', 'dark:bg-neutral-700', 'text-gray-700', 'dark:text-white');
		tabContents.forEach(content => content.classList.add('hidden'));
		document.getElementById(tabId).classList.remove('hidden');
	});
});

// API Client
async function sendRequest() {
  const method = document.getElementById('method').value;
  const url = document.getElementById('url').value.trim();
  const bodyText = document.getElementById('body').value.trim();
  const headersText = document.getElementById('headers').value.trim();
  const responseBox = document.getElementById('response');

  if (!url) {
    alert('Please enter a valid URL');
    return;
  }

  let headers = {};

  if (headersText) {
    try {
      headers = JSON.parse(headersText);
    } catch {
      alert('Invalid JSON headers');
      return;
    }
  }

  let options = { method, headers };

  if (method !== 'GET' && method !== 'DELETE' && bodyText) {
    try {
      options.body = JSON.stringify(JSON.parse(bodyText));
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    } catch {
      alert('Invalid JSON body');
      return;
    }
  }

  responseBox.textContent = 'Loading...';

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    let responseText;

    if (contentType.includes('application/json')) {
      const json = await res.json();
      responseText = JSON.stringify(json, null, 2);
    } else {
      responseText = await res.text();
    }

    responseBox.textContent = `Status: ${res.status} ${res.statusText}\n\n${responseText}`;
  } catch (error) {
    responseBox.textContent = 'Error:\n' + error.message;
  }
}

// Chart
const cpuChart = new Chart(ctxCpu, {
  type: 'line',
  data: {
	labels: [],
	datasets: [{
	  label: 'CPU Usage',
	  data: [],
	  borderColor: 'rgba(255, 99, 132, 1)',
	  borderWidth: 2,
	  backgroundColor: 'rgba(255, 99, 132, 0.2)',
	  tension: 0.1
	}]
  },
  options: {
	responsive: true,
	scales: {
	  x: {
		display: true,
		title: {
		  display: true,
		  text: 'Time'
        }
	  },
	  y: {
        beginAtZero: true,
        display: true,
        title: {
          display: true,
          text: 'Usage (%)'
        }
	  }
	},
	plugins: {
	  legend: {
        display: true,
        position: 'top'
	  }
	}
  }
});

const ramChart = new Chart(ctxRam, {
  type: 'line',
  data: {
	labels: [],
	datasets: [{
	  label: 'RAM Usage',
	  data: [],
	  borderColor: 'rgba(54, 162, 235, 1)',
	  borderWidth: 2,
	  backgroundColor: 'rgba(54, 162, 235, 0.2)',
	  tension: 0.1
	}]
  },
  options: {
	responsive: true,
	scales: {
	  x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
	  },
	  y: {
        beginAtZero: true,
        display: true,
        title: {
          display: true,
          text: 'Usage (%)'
        }
	  }
	},
	plugins: {
	  legend: {
        display: true,
        position: 'top'
	  }
	}
  }
});

const diskChart = new Chart(ctxDisk, {
  type: 'line',
  data: {
	labels: [],
	datasets: [{
	  label: 'Disk Usage',
	  data: [],
	  borderColor: 'rgba(75, 192, 192, 1)',
	  borderWidth: 2,
	  backgroundColor: 'rgba(75, 192, 192, 0.2)',
	  tension: 0.1
	}]
  },
  options: {
	responsive: true,
	scales: {
	  x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
	  },
	  y: {
        beginAtZero: true,
        display: true,
        title: {
          display: true,
          text: 'Usage (%)'
        }
	  }
	},
	plugins: {
	  legend: {
        display: true,
        position: 'top'
	  }
	}
  }
});

setInterval(updateCharts, 500);