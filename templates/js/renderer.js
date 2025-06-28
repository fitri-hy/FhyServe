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
