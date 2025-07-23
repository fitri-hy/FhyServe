// Theme
const sunIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M4.25 19a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75m3 3a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75" clip-rule="evenodd"/><path fill="currentColor" d="M6.083 15.25a6.75 6.75 0 1 1 11.835 0H22a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1 0-1.5z"/><path fill="currentColor" fill-rule="evenodd" d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75" clip-rule="evenodd"/></svg>
`;

const moonIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12C2 6.477 6.477 2 12 2c.463 0 .54.693.143.933a6.5 6.5 0 1 0 8.924 8.924c.24-.396.933-.32.933.143c0 1.138-.19 2.231-.54 3.25H22a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1 0-1.5h.54A10 10 0 0 1 2 12m3 6.25a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 0-1.5zm3 3a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5zM19.9 2.307a.483.483 0 0 0-.9 0l-.43 1.095a.48.48 0 0 1-.272.274l-1.091.432a.486.486 0 0 0 0 .903l1.091.432a.48.48 0 0 1 .272.273L19 6.81c.162.41.74.41.9 0l.43-1.095a.48.48 0 0 1 .273-.273l1.091-.432a.486.486 0 0 0 0-.903l-1.091-.432a.48.48 0 0 1-.273-.274z"/><path fill="currentColor" d="M16.033 8.13a.483.483 0 0 0-.9 0l-.157.399a.48.48 0 0 1-.272.273l-.398.158a.486.486 0 0 0 0 .903l.398.157c.125.05.223.148.272.274l.157.399c.161.41.739.41.9 0l.157-.4a.48.48 0 0 1 .272-.273l.398-.157a.486.486 0 0 0 0-.903l-.398-.158a.48.48 0 0 1-.272-.273z"/></svg>
`;

function updateToggleIcon(isDark) {
  const btn = document.getElementById('toggle-btn');
  btn.innerHTML = isDark ? sunIcon : moonIcon;
}

let isDark = localStorage.getItem('darkMode') === 'true';
document.documentElement.classList.toggle('dark', isDark);
window.themeAPI.setDarkMode(isDark);
updateToggleIcon(isDark);

document.getElementById('toggle-btn').addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('darkMode', isDark);
  window.themeAPI.setDarkMode(isDark);
  updateToggleIcon(isDark);
});

window.serviceAPI.onLog(({ service, message }) => {
  const prefix = `[${service.toUpperCase()}] `;
  logElement.textContent += '\n' + prefix + message.trim();
  logginWrapper.scrollTop = logginWrapper.scrollHeight;
});

// Dropdown
document.querySelectorAll('.dropdown-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const dropdownId = button.getAttribute('data-dropdown');
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      if (menu !== dropdown) {
        menu.classList.add('hidden');
      }
    });
    dropdown.classList.toggle('hidden');
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown-toggle') && !e.target.closest('.dropdown-menu')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.add('hidden');
    });
  }
});

// Apache
const statusText = document.getElementById('apache-status');
const toggle = document.getElementById('apacheToggle');
const logginWrapper = document.getElementById('logging-wrapper');
const logElement = document.getElementById('logging');

toggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    window.apacheAPI.start();
  } else {
    window.apacheAPI.stop();
  }
});

window.apacheAPI.onStatus((status) => {
  statusText.textContent = status;
  if (status === 'RUNNING') {
    statusText.classList.add('text-green-500', 'dark:text-green-600');
    statusText.classList.remove('text-rose-500', 'dark:text-rose-600');
    toggle.checked = true;
  } else {
    statusText.classList.add('text-rose-500', 'dark:text-rose-600');
    statusText.classList.remove('text-green-500', 'dark:text-green-600');
    toggle.checked = false;
  }
});

const openFolderApache = document.getElementById('open-apache-folder');
openFolderApache.addEventListener('click', async () => {
  const result = await window.apacheAPI.openApacheFolder();
  if (!result.success) {
    alert('Failed to open folder: ' + result.message);
  }
});

// MySQL
const mysqlStatusText = document.querySelector('#mysql-status');
const mysqlToggle = document.querySelector('#mysqlToggle');

mysqlToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    window.mysqlAPI.start();
  } else {
    window.mysqlAPI.stop();
  }
});

window.mysqlAPI.onStatus((status) => {
  mysqlStatusText.textContent = status;
  if (status === 'RUNNING') {
    mysqlStatusText.classList.add('text-green-500', 'dark:text-green-600');
    mysqlStatusText.classList.remove('text-rose-500', 'dark:text-rose-600');
    mysqlToggle.checked = true;
  } else {
    mysqlStatusText.classList.add('text-rose-500', 'dark:text-rose-600');
    mysqlStatusText.classList.remove('text-green-500', 'dark:text-green-600');
    mysqlToggle.checked = false;
  }
});

// Nginx
const nginxStatusText = document.querySelector('#nginx-status');
const nginxToggle = document.querySelector('#nginxToggle');

nginxToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    window.nginxAPI.start();
  } else {
    window.nginxAPI.stop();
  }
});

window.nginxAPI.onStatus((status) => {
  nginxStatusText.textContent = status.toUpperCase();
  if (status === 'RUNNING') {
    nginxStatusText.classList.add('text-green-500', 'dark:text-green-600');
    nginxStatusText.classList.remove('text-rose-500', 'dark:text-rose-600');
    nginxToggle.checked = true;
  } else {
    nginxStatusText.classList.add('text-rose-500', 'dark:text-rose-600');
    nginxStatusText.classList.remove('text-green-500', 'dark:text-green-600');
    nginxToggle.checked = false;
  }
});

const openFolderNginx = document.getElementById('open-nginx-folder');
openFolderNginx.addEventListener('click', async () => {
  const result = await window.nginxAPI.openNginxFolder();
  if (!result.success) {
    alert('Failed to open folder: ' + result.message);
  }
});

// Node
const nodeStatusText = document.querySelector('#nodejs-status');
const nodeToggle = document.querySelector('#nodejsToggle');

nodeToggle.addEventListener('change', e => {
  if (e.target.checked) {
    window.nodejsAPI.start();
  } else {
    window.nodejsAPI.stop();
  }
});

window.nodejsAPI.onStatus(status => {
  nodeStatusText.textContent = status;
  if (status === 'RUNNING') {
    nodeStatusText.classList.add('text-green-500', 'dark:text-green-600');
    nodeStatusText.classList.remove('text-rose-500', 'dark:text-rose-600');
    nodeToggle.checked = true;
  } else {
    nodeStatusText.classList.add('text-rose-500', 'dark:text-rose-600');
    nodeStatusText.classList.remove('text-green-500', 'dark:text-green-600');
    nodeToggle.checked = false;
  }
});

const openFolderNode = document.getElementById('open-node-folder');
openFolderNode.addEventListener('click', async () => {
  const result = await window.nodejsAPI.openNodeFolder();
  if (!result.success) {
    alert('Failed to open folder: ' + result.message);
  }
});

// Python
const pythonStatusText = document.querySelector('#python-status');
const pythonToggle = document.querySelector('#pythonToggle');

pythonToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    window.pythonAPI.start();
  } else {
    window.pythonAPI.stop();
  }
});

window.pythonAPI.onStatus(({ project, status }) => {
  if (project === 'main') {
    pythonStatusText.textContent = status;
    if (status === 'RUNNING') {
      pythonStatusText.classList.add('text-green-500', 'dark:text-green-600');
      pythonStatusText.classList.remove('text-rose-500', 'dark:text-rose-600');
      pythonToggle.checked = true;
    } else {
      pythonStatusText.classList.add('text-rose-500', 'dark:text-rose-600');
      pythonStatusText.classList.remove('text-green-500', 'dark:text-green-600');
      pythonToggle.checked = false;
    }
  }
});

const openFolderPython = document.getElementById('open-python-folder');
openFolderPython.addEventListener('click', async () => {
  const result = await window.pythonAPI.openPythonFolder();
  if (!result.success) {
    alert('Failed to open folder: ' + result.message);
  }
});

// Golang
const goStatusText = document.querySelector('#golang-status');
const goToggle = document.querySelector('#golangToggle');
const openFolderGo = document.getElementById('open-go-folder');

goToggle.addEventListener('change', e => {
  if (e.target.checked) {
    window.golangAPI.start();
  } else {
    window.golangAPI.stop();
  }
});

window.golangAPI.onStatus(({ project, status }) => {
  if (project !== 'main') return;

  goStatusText.textContent = status;
  if (status === 'RUNNING') {
    goStatusText.classList.add('text-green-500', 'dark:text-green-600');
    goStatusText.classList.remove('text-rose-500', 'dark:text-rose-600');
    goToggle.checked = true;
  } else {
    goStatusText.classList.add('text-rose-500', 'dark:text-rose-600');
    goStatusText.classList.remove('text-green-500', 'dark:text-green-600');
    goToggle.checked = false;
  }
});

openFolderGo.addEventListener('click', async () => {
  const result = await window.golangAPI.openGoFolder();
  if (!result.success) {
    alert('Failed to open folder: ' + result.message);
  }
});

// Ruby
const rubyStatusText = document.querySelector('#ruby-status');
const rubyToggle = document.querySelector('#rubyToggle');
const openFolderRuby = document.getElementById('open-ruby-folder');

rubyToggle.addEventListener('change', e => {
  if (e.target.checked) {
    window.rubyAPI.start();
  } else {
    window.rubyAPI.stop();
  }
});

window.rubyAPI.onStatus(({ project, status }) => {
  if (project !== 'main') return;

  rubyStatusText.textContent = status;
  if (status === 'RUNNING') {
    rubyStatusText.classList.add('text-green-500', 'dark:text-green-600');
    rubyStatusText.classList.remove('text-rose-500', 'dark:text-rose-600');
    rubyToggle.checked = true;
  } else {
    rubyStatusText.classList.add('text-rose-500', 'dark:text-rose-600');
    rubyStatusText.classList.remove('text-green-500', 'dark:text-green-600');
    rubyToggle.checked = false;
  }
});

openFolderRuby.addEventListener('click', async () => {
  const result = await window.rubyAPI.openRubyFolder();
  if (!result.success) {
    alert('Failed to open folder: ' + result.message);
  }
});

// CMD
const cmdToggle = document.querySelector('#cmdToggle');
const cmdStatusText = document.querySelector('#cmd-status');
const cmdWrapper = document.querySelector('#cmd-wrapper');
const cmdOutput = document.querySelector('#cmd-main');
const cmdInput = document.querySelector('#cmd-input');

cmdToggle.addEventListener('change', e => {
  if (e.target.checked) {
    window.cmdAPI.start();
  } else {
    window.cmdAPI.stop();
  }
});

window.cmdAPI.onStatus(status => {
  cmdStatusText.textContent = status;
  if (status === 'RUNNING') {
    cmdStatusText.classList.add('text-green-500');
    cmdStatusText.classList.remove('text-rose-500');
    cmdToggle.checked = true;
  } else {
    cmdStatusText.classList.add('text-rose-500');
    cmdStatusText.classList.remove('text-green-500');
    cmdToggle.checked = false;
  }
});

window.cmdAPI.onOutput(data => {
  cmdOutput.textContent += data;
  cmdWrapper.scrollTop = cmdWrapper.scrollHeight;
});

window.cmdAPI.onClear(() => {
  cmdOutput.textContent = '';
});

cmdInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && cmdToggle.checked) {
    const command = cmdInput.value;
    window.cmdAPI.sendCommand(command);
    cmdInput.value = '';
  }
});

// Port
const openFolderPort = document.getElementById('open-port-folder');
openFolderPort.addEventListener('click', async () => {
  const result = await window.portAPI.openPortFolder();
  if (!result.success) {
    alert('Failed to open folder: ' + result.message);
  }
});

// Cron Job
const form = document.getElementById('cron-form');
const scheduleInput = document.getElementById('schedule');
const taskInput = document.getElementById('task');
const list = document.getElementById('cron-list');
const cronToggle = document.getElementById('cronjobToggle');
const cronStatus = document.getElementById('cronjob-status');

cronToggle.checked = false;
updateCronStatus(false);

async function loadCronjobs() {
  const jobs = await window.cronAPI.read();
  list.innerHTML = '';

  if (jobs.length === 0) {
    const tr = document.createElement('div');
    const td = document.createElement('div');
    td.colSpan = 3;
    td.textContent = 'There are no cronjobs registered yet.';
    td.className = 'text-center py-2 col-span-12';
    tr.appendChild(td);
    list.appendChild(tr);
    return;
  }

  jobs.forEach(job => {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-12 items-center border-b border-gray-100 dark:border-neutral-800 py-1 text-xs';

    const colSchedule = document.createElement('div');
    colSchedule.className = 'col-span-3 px-2 truncate';
    colSchedule.textContent = job.schedule;

    const colTask = document.createElement('div');
    colTask.className = 'col-span-7 px-2 truncate';
    colTask.textContent = job.task;

    const colAction = document.createElement('div');
    colAction.className = 'col-span-2 px-2 text-center';

    const btnDelete = document.createElement('button');
    btnDelete.textContent = 'DELETE';
    btnDelete.className = 'text-rose-500 hover:underline font-bold text-xs';
    btnDelete.onclick = () => {
      if (confirm('Are you sure you want to delete this task?')) {
        window.cronAPI.delete(job.id);
        setTimeout(loadCronjobs, 300);
      }
    };

    colAction.appendChild(btnDelete);
    row.appendChild(colSchedule);
    row.appendChild(colTask);
    row.appendChild(colAction);
    list.appendChild(row);
  });
}

function updateCronStatus(isRunning) {
  if (isRunning) {
    cronStatus.textContent = 'RUNNING';
    cronStatus.classList.remove('text-rose-500', 'dark:text-rose-600');
    cronStatus.classList.add('text-emerald-500', 'dark:text-emerald-600');
  } else {
    cronStatus.textContent = 'STOPPED';
    cronStatus.classList.remove('text-emerald-500', 'dark:text-emerald-600');
    cronStatus.classList.add('text-rose-500', 'dark:text-rose-600');
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const schedule = scheduleInput.value.trim();
  const task = taskInput.value.trim();

  if (!schedule || !task) {
    alert('Schedule and tasks must be filled');
    return;
  }

  window.cronAPI.create({ schedule, task });

  scheduleInput.value = '';
  taskInput.value = '';
  setTimeout(loadCronjobs, 300);
});

cronToggle.addEventListener('change', async () => {
  if (cronToggle.checked) {
    window.cronAPI.startAll();
    updateCronStatus(true);
  } else {
    window.cronAPI.stopAll();
    updateCronStatus(false);
  }
});

loadCronjobs();

// Monitoring
const ctx = document.getElementById('serviceChart').getContext('2d');
const maxDataPoints = 30;
const serviceData = {};

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: {
      padding: { top: 10, bottom: 10 }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          maxTicksLimit: 5
        },
        title: {
          display: true,
          text: 'CPU (%) & RAM (MB)'
        },
      },
      x: {
        display: false
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {}
    },
    interaction: {}
  }
});

async function refreshServiceStats() {
  try {
    const stats = await window.monitoringAPI.getServiceStats();
    const container = document.getElementById('monitor-list');
    container.innerHTML = '';

    stats.forEach(service => {
	  const statusClass = service.status === 'RUNNING'
        ? 'text-emerald-500'
        : 'text-rose-500';
	  container.innerHTML += `
		<tr>
		  <td class="px-4 py-2 font-bold">${service.name}</td>
		  <td class="px-4 py-2 font-semibold ${statusClass}">${service.status}</td>
		  <td class="px-4 py-2">${service.pid || '-'}</td>
		  <td class="px-4 py-2">${service.cpu || '-'}</td>
		  <td class="px-4 py-2">${service.memory || '-'}</td>
		  <td class="px-4 py-2">${service.port || '-'}</td>
		</tr>`;

      if (!serviceData[service.name]) {
        serviceData[service.name] = { cpu: [], ram: [] };
      }

      let cpuValue = 0;
      if (service.cpu) {
        cpuValue = parseFloat(service.cpu.replace('%', '')) || 0;
      }

      let ramValue = 0;
      if (service.memory) {
        ramValue = parseFloat(service.memory.replace(' MB', '')) || 0;
      }

      const cpuArr = serviceData[service.name].cpu;
      cpuArr.push(cpuValue);
      if (cpuArr.length > maxDataPoints) cpuArr.shift();

      const ramArr = serviceData[service.name].ram;
      ramArr.push(ramValue);
      if (ramArr.length > maxDataPoints) ramArr.shift();
    });

    const labels = Array(serviceData[stats[0]?.name]?.cpu.length || 0).fill('');
    chart.data.labels = labels;

    chart.data.datasets = [];
    Object.entries(serviceData).forEach(([serviceName, data], i) => {
      chart.data.datasets.push({
        label: `${serviceName} CPU %`,
        data: data.cpu,
        borderColor: `hsl(${(i * 50) % 360}, 70%, 50%)`,
        backgroundColor: 'transparent',
        yAxisID: 'y',
        tension: 0.3,
        borderWidth: 2,
      });

      chart.data.datasets.push({
        label: `${serviceName} RAM MB`,
        data: data.ram,
        borderColor: `hsl(${(i * 50 + 180) % 360}, 70%, 50%)`,
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        yAxisID: 'y',
        tension: 0.3,
        borderWidth: 2,
      });
    });

    chart.update();
  } catch (err) {
    console.error('Error refreshing service stats:', err);
  }
}

setInterval(refreshServiceStats, 5000);
refreshServiceStats();

// Auto Installer
window.addEventListener('DOMContentLoaded', () => {
  const installButton = document.getElementById('cms-install-btn');
  const progressBar = document.getElementById('cms-progress-bar');
  const statusText = document.getElementById('cms-status');
  const cmsSelect = document.getElementById('cms-select');
  const versionSelect = document.getElementById('cms-version');
  const serverSelect = document.getElementById('cms-server');

  progressBar.style.display = 'none';

  function updateVersionOptions() {
    const cms = cmsSelect.value.toLowerCase();

    versionSelect.innerHTML = '';

    if (cms === 'wordpress') {
      versionSelect.innerHTML = `
        <option value="latest" selected>Latest</option>
        <option value="6.3.2">6.3.2</option>
        <option value="6.2.5">6.2.5</option>
        <option value="6.1.10">6.1.10</option>
      `;
      versionSelect.disabled = false;
    } else if (cms === 'joomla') {
      versionSelect.innerHTML = `
        <option value="latest" selected>Latest (5.3.1)</option>
        <option value="5.3.1">5.3.1</option>
        <option value="5.3.0">5.3.0</option>
        <option value="5.2.6">5.2.6</option>\
      `;
      versionSelect.disabled = false;
    } else if (cms === 'laravel') {
      versionSelect.innerHTML = `
        <option value="latest" selected>Latest (11)</option>
        <option value="11">11</option>
        <option value="10">10</option>
        <option value="9">9</option>
      `;
      versionSelect.disabled = false;
    } else if (cms === 'codeigniter') {
      versionSelect.innerHTML = `
        <option value="latest" selected>Latest (4.5.1)</option>
        <option value="4.5.1">4.5.1</option>
        <option value="4.5.0">4.5.0</option>
        <option value="4.4.6">4.4.6</option>
      `;
      versionSelect.disabled = false;
    } else if (cms === 'symfony') {
      versionSelect.innerHTML = `
        <option value="latest" selected>Latest (7.3.1)</option>
        <option value="7.3.1">7.3.1</option>
        <option value="7.2.8">7.2.8</option>
        <option value="6.4.23">6.4.23</option>
      `;
      versionSelect.disabled = false;
    } else if (cms === 'slim') {
      versionSelect.innerHTML = `
        <option value="latest" selected>Latest (4.5.0)</option>
        <option value="4.5.0">4.5.0</option>
        <option value="4.4.0">4.4.0</option>
        <option value="4.3.0">4.3.0</option>
      `;
      versionSelect.disabled = false;
    } else if (cms === 'yii') {
      versionSelect.innerHTML = `
        <option value="latest" selected>Latest (2.0.53)</option>
        <option value="2.0.53">2.0.53</option>
        <option value="2.0.52">2.0.52</option>
        <option value="2.0.51">2.0.51</option>
      `;
      versionSelect.disabled = false;
    } else if (cms === 'cakephp') {
      versionSelect.innerHTML = `
        <option value="latest" selected>Latest (5.1.2)</option>
        <option value="5.1.2">5.1.2</option>
        <option value="5.1.1">5.1.1</option>
        <option value="5.1.0">5.1.0</option>
      `;
      versionSelect.disabled = false;
    } else {
      versionSelect.innerHTML = `<option value="latest" selected>Latest</option>`;
      versionSelect.disabled = true;
    }
  }

  updateVersionOptions();
  cmsSelect.addEventListener('change', updateVersionOptions);

  installButton.addEventListener('click', async () => {
    const cmsName = cmsSelect.value;
    const version = versionSelect.value || 'latest';
    const target = serverSelect.value || 'apache';

    progressBar.style.display = 'block';
    installButton.disabled = true;
    cmsSelect.disabled = true;
    versionSelect.disabled = true;
    serverSelect.disabled = true;

    statusText.textContent = `Starting installation of ${cmsName} version ${version} to public_html/${target}_web...`;
    progressBar.value = 0;

    const onProgressHandler = (downloaded, total) => {
      const percent = Math.round((downloaded / total) * 100);
      progressBar.value = percent;
      statusText.textContent = `Downloading: ${percent}%. Please wait ...`;
    };

    window.autoInstallerAPI.onProgress(onProgressHandler);

    try {
      const result = await window.autoInstallerAPI.installCMS(cmsName, version, target);
      if (result.success) {
        statusText.textContent = `${cmsName} version ${version} successfully installed to public_html/${target}_web !`;
        progressBar.value = 100;
      } else {
        statusText.textContent = `Error: ${result.error}`;
      }
    } catch (error) {
      statusText.textContent = `Unexpected error: ${error.message}`;
    } finally {
      installButton.disabled = false;
      cmsSelect.disabled = false;
      versionSelect.disabled = false;
      serverSelect.disabled = false;
    }
  });
});

// Resource Download
const loadingEl = document.getElementById('loading');
const loadingMessage = document.getElementById('loading-message');

window.resourceDlAPI.onResourceProgress((progress) => {
  switch(progress.status) {
    case 'download_start':
    case 'download_progress':
    case 'extracting':
      loadingEl.classList.remove('hidden');
      loadingMessage.textContent = progress.message;
      break;
    case 'download_complete':
      loadingMessage.textContent = progress.message;
      break;
    case 'done':
    case 'skip':
      loadingEl.classList.add('hidden');
      loadingMessage.textContent = '';
      break;
  }
});

// Tunnels
async function getPublicIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || '-';
  } catch {
    return '-';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const portInput = document.getElementById('portInput');
  const createBtn = document.getElementById('createBtn');
  const tunnelsTableBody = document.getElementById('tunnelsTableBody');

  async function loadTunnels() {
    const tunnels = await window.tunnelAPI.getTunnels();
    tunnelsTableBody.innerHTML = '';

    const publicIP = await getPublicIP();
	
	if (tunnels.length === 0) {
      tunnelsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4">There are no tunnels available yet.</td>
      </tr>
      `;
      return;
    }

    tunnels.forEach((tunnel) => {
      const tr = document.createElement('tr');
	  tr.classList.add('border-b', 'border-gray-100', 'dark:border-neutral-800');

      tr.innerHTML = `
        <td class="px-4 py-2 font-bold whitespace-nowrap">${tunnel.port}</td>
        <td class="px-4 py-2 font-bold capitalize whitespace-nowrap ${tunnel.status === 'RUNNING' ? 'text-emerald-500' : 'text-rose-500'}">
		  ${tunnel.status}
		</td>
        <td class="w-full px-4 py-2 whitespace-nowrap text-blue-500 font-mono select-all cursor-pointer">${tunnel.url || '-'}</td>
        <td class="px-4 py-2 whitespace-nowrap">${publicIP}</td>
        <td class="px-4 py-2 whitespace-nowrap text-center space-x-2">
          <button data-id="${tunnel.id}" data-action="start" class="startBtn text-emerald-500 hover:text-emerald-600 dark:text-emerald-600 dark:hover:text-emerald-500 hover:scale-105 hover:duration-300 transition-all">
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>
		  </button>
          <button data-id="${tunnel.id}" data-action="stop" class="stopBtn text-yellow-500 hover:text-yellow-600 dark:text-yellow-600 dark:hover:text-yellow-500 hover:scale-105 hover:duration-300 transition-all">
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12"/></svg>
		  </button>
          <button data-id="${tunnel.id}" data-action="delete" class="deleteBtn text-rose-500 hover:text-rose-600 dark:text-rose-600 dark:hover:text-rose-500 hover:scale-105 hover:duration-300 transition-all">
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M2.75 6.167c0-.46.345-.834.771-.834h2.665c.529-.015.996-.378 1.176-.916l.03-.095l.115-.372c.07-.228.131-.427.217-.605c.338-.702.964-1.189 1.687-1.314c.184-.031.377-.031.6-.031h3.478c.223 0 .417 0 .6.031c.723.125 1.35.612 1.687 1.314c.086.178.147.377.217.605l.115.372l.03.095c.18.538.74.902 1.27.916h2.57c.427 0 .772.373.772.834S20.405 7 19.979 7H3.52c-.426 0-.771-.373-.771-.833M11.607 22h.787c2.707 0 4.06 0 4.941-.863c.88-.864.97-2.28 1.15-5.111l.26-4.081c.098-1.537.147-2.305-.295-2.792s-1.187-.487-2.679-.487H8.23c-1.491 0-2.237 0-2.679.487s-.392 1.255-.295 2.792l.26 4.08c.18 2.833.27 4.248 1.15 5.112S8.9 22 11.607 22"/></svg>
		  </button>
        </td>
      `;

      tunnelsTableBody.appendChild(tr);
    });

    document.querySelectorAll('.startBtn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await window.tunnelAPI.startTunnel(id);
        await loadTunnels();
      });
    });

    document.querySelectorAll('.stopBtn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await window.tunnelAPI.stopTunnel(id);
        await loadTunnels();
      });
    });

    document.querySelectorAll('.deleteBtn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await window.tunnelAPI.deleteTunnel(id);
        await loadTunnels();
      });
    });

    document.querySelectorAll('td:nth-child(3)').forEach((td) => {
      td.addEventListener('click', () => {
        const url = td.textContent;
        if (url && url !== '-') {
          navigator.clipboard.writeText(url).then(() => {
            alert('Tunnel URL copied to clipboard!');
          });
        }
      });
    });
  }

  createBtn.addEventListener('click', async () => {
    const port = parseInt(portInput.value, 10);
    if (isNaN(port) || port <= 0) {
      alert('The port must be filled!');
      return;
    }

    const existingTunnels = await window.tunnelAPI.getTunnels();
    const portUsed = existingTunnels.some(tunnel => tunnel.port === port);

    if (portUsed) {
      alert(`Port ${port} is already in use! Please use another port.`);
      return;
    }

    const res = await window.tunnelAPI.createTunnel(port);
    if (res.success) {
      portInput.value = '';
      loadTunnels();
    } else {
      alert('Failed to create tunnel: ' + res.message);
    }
});


  loadTunnels();
});

/*
// PM2
let selectedFilePathPM2 = null;
let currentTailedPmIdPM2 = null;

const btnSelectFilePM2 = document.getElementById('btn-select-file-PM2');
const entryFilePathPM2 = document.getElementById('entry-file-path-PM2');
const serviceNameInputPM2 = document.getElementById('service-name-PM2');
const addServiceFormPM2 = document.getElementById('add-service-form-PM2');
const pm2Table = document.getElementById('pm2-table-PM2');

const logModalPM2 = document.getElementById('log-modal-PM2');
const outLogElemPM2 = document.getElementById('out-log-PM2');
const errLogElemPM2 = document.getElementById('err-log-PM2');
const serviceNameElemPM2 = document.getElementById('log-service-name-PM2');
const closeLogModalBtnPM2 = document.getElementById('close-log-modal-PM2');

btnSelectFilePM2.addEventListener('click', async () => {
  const filePath = await window.pm2API.pickFile();
  if (filePath) {
    selectedFilePathPM2 = filePath;
    entryFilePathPM2.textContent = filePath;
    const currentName = serviceNameInputPM2.value.trim();
    if (!currentName) {
      const fileName = filePath.split(/[\\/]/).pop();
      const defaultName = fileName.replace(/\.js$/, '');
      serviceNameInputPM2.value = defaultName;
    }
  }
});

addServiceFormPM2.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = serviceNameInputPM2.value.trim();
  if (!name) {
    alert('Please enter service name');
    return;
  }
  if (!selectedFilePathPM2) {
    alert('Please select entry point file');
    return;
  }

  try {
    await window.pm2API.startWithName(selectedFilePathPM2, name);
    alert('Service added: ' + name);
    selectedFilePathPM2 = null;
    entryFilePathPM2.textContent = 'No file selected';
    serviceNameInputPM2.value = '';
    refreshPM2();
  } catch (err) {
    alert('Failed to add service: ' + (err.message || err));
  }
});

async function refreshPM2() {
  pm2Table.innerHTML = '<tr><td colspan="6" class="px-4 py-2 whitespace-nowrap text-center">Loading...</td></tr>';

  try {
    const list = await window.pm2API.list();

    if (!list || list.length === 0) {
      pm2Table.innerHTML = '<tr><td colspan="6" class="px-4 py-2 whitespace-nowrap text-center">No processes running.</td></tr>';
      return;
    }

    pm2Table.innerHTML = '';
	list.forEach(proc => {
	  const isStopped = proc.pm2_env.status === 'stopped';
	  const actionBtn = isStopped
		? `<button class="action-btn text-emerald-500 dark:text-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-500" onclick="doActionPM2('start', ${proc.pm_id})">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>
		</button>`
		: `<button class="action-btn text-rose-500 dark:text-rose-600 hover:text-rose-600 dark:hover:text-rose-500" onclick="doActionPM2('stop', ${proc.pm_id})">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12"/></svg>
		</button>`;

	  const row = document.createElement('tr');
	  row.innerHTML = `
		<td class="px-4 py-2 whitespace-nowrap">${proc.pm_id}</td>
		<td class="px-4 py-2 whitespace-nowrap w-full">${proc.name}</td>
		<td class="px-4 py-2 whitespace-nowrap uppercase font-semibold ${proc.pm2_env.status === 'online' ? 'text-emerald-500' : 'text-rose-500'}">${proc.pm2_env.status}</td>
		<td class="px-4 py-2 whitespace-nowrap">${proc.monit.cpu.toFixed(2)} %</td>
		<td class="px-4 py-2 whitespace-nowrap">${(proc.monit.memory / 1024 / 1024).toFixed(2)} MB</td>
		<td class="px-4 py-2 whitespace-nowrap">
			<div class="flex items-center gap-1">
				${actionBtn}
				<button class="action-btn text-amber-500 dark:text-amber-600 hover:text-amber-600 dark:hover:text-amber-500" onclick="doActionPM2('restart', ${proc.pm_id})">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-16.54-.917a6.59 6.59 0 0 1 6.55-5.833a6.59 6.59 0 0 1 5.242 2.592a.75.75 0 0 1-1.192.911a5.09 5.09 0 0 0-4.05-2.003a5.09 5.09 0 0 0-5.037 4.333h.364a.75.75 0 0 1 .53 1.281l-1.169 1.167a.75.75 0 0 1-1.06 0L4.47 12.364a.75.75 0 0 1 .53-1.28zm12.902-.614a.75.75 0 0 0-1.06 0l-1.168 1.167a.75.75 0 0 0 .53 1.28h.363a5.09 5.09 0 0 1-5.036 4.334a5.08 5.08 0 0 1-4.038-1.986a.75.75 0 0 0-1.188.916a6.58 6.58 0 0 0 5.226 2.57a6.59 6.59 0 0 0 6.549-5.833H19a.75.75 0 0 0 .53-1.281z" clip-rule="evenodd"/></svg>
				</button>
				<button class="delete-btn text-rose-500 dark:text-rose-600 hover:text-rose-600 dark:hover:text-rose-500" onclick="doActionPM2('delete', ${proc.pm_id})">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6.524c0-.395.327-.714.73-.714h4.788c.006-.842.098-1.995.932-2.793A3.68 3.68 0 0 1 12 2a3.68 3.68 0 0 1 2.55 1.017c.834.798.926 1.951.932 2.793h4.788c.403 0 .73.32.73.714a.72.72 0 0 1-.73.714H3.73A.72.72 0 0 1 3 6.524"/><path fill="currentColor" fill-rule="evenodd" d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.34 1.181-5.246l.267-4.187c.1-1.577.15-2.366-.303-2.866c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.289-.303 2.866l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886m-1.35-9.811c-.04-.434-.408-.75-.82-.707c-.413.043-.713.43-.672.864l.5 5.263c.04.434.408.75.82.707c.413-.044.713-.43.672-.864zm4.329-.707c.412.043.713.43.671.864l-.5 5.263c-.04.434-.409.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.04-.433.409-.75.82-.707" clip-rule="evenodd"/></svg>
				</button>
				<button onclick="showLogsPM2(${proc.pm_id}, '${proc.name}')" class="text-sky-500 dark:text-sky-600 hover:text-sky-600 dark:hover:text-sky-500">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-10 5.75a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75M12 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2" clip-rule="evenodd"/></svg>
				</button>
			</div>
		</td>
	  `;
	  pm2Table.appendChild(row);
	});

  } catch (err) {
    console.error('Failed to load PM2 list:', err);
    pm2Table.innerHTML = `<tr><td colspan="6" class="px-4 py-2 whitespace-nowrap text-center">Error loading PM2 list: ${err}</td></tr>`;
  }
}

async function doActionPM2(action, id) {
  try {
    await window.pm2API.action(action, Number(id));
    refreshPM2();
  } catch (err) {
    alert('Error: ' + (err.message || err));
  }
}

async function showLogsPM2(pmId, name) {
  serviceNameElemPM2.textContent = name;
  outLogElemPM2.textContent = 'Loading...';
  errLogElemPM2.textContent = 'Loading...';

  logModalPM2.style.display = 'block';

  try {
    const logs = await window.pm2API.getLogs(pmId);
    outLogElemPM2.textContent = logs?.outLog || '(No output log)';
    errLogElemPM2.textContent = logs?.errLog || '(No error log)';

    if (currentTailedPmIdPM2 !== null) {
      await window.pm2API.stopTailLog(currentTailedPmIdPM2);
      window.pm2API.removeAllLogListeners();
    }

    currentTailedPmIdPM2 = pmId;

    await window.pm2API.startTailLog(pmId);

    window.pm2API.onLogOutLine(({ pmId: tailPmId, line }) => {
      if (tailPmId === currentTailedPmIdPM2) {
        outLogElemPM2.textContent += '\n' + line;
        outLogElemPM2.scrollTop = outLogElemPM2.scrollHeight;
      }
    });

    window.pm2API.onLogErrLine(({ pmId: tailPmId, line }) => {
      if (tailPmId === currentTailedPmIdPM2) {
        errLogElemPM2.textContent += '\n' + line;
        errLogElemPM2.scrollTop = errLogElemPM2.scrollHeight;
      }
    });

    window.pm2API.onLogError(({ pmId: tailPmId, error }) => {
      if (tailPmId === currentTailedPmIdPM2) {
        errLogElemPM2.textContent += '\n' + error;
        errLogElemPM2.scrollTop = errLogElemPM2.scrollHeight;
      }
    });
  } catch (err) {
    outLogElemPM2.textContent = 'Error loading logs: ' + (err.message || err);
    errLogElemPM2.textContent = '';
  }
}

closeLogModalBtnPM2.addEventListener('click', async () => {
  logModalPM2.style.display = 'none';
  if (currentTailedPmIdPM2 !== null) {
    await window.pm2API.stopTailLog(currentTailedPmIdPM2);
    window.pm2API.removeAllLogListeners();
    currentTailedPmIdPM2 = null;
  }
});

refreshPM2();
*/