// Theme
const sunIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M4.25 19a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75m3 3a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75" clip-rule="evenodd"/><path fill="currentColor" d="M6.083 15.25a6.75 6.75 0 1 1 11.835 0H22a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1 0-1.5z"/><path fill="currentColor" fill-rule="evenodd" d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75" clip-rule="evenodd"/></svg>
`;

const moonIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12C2 6.477 6.477 2 12 2c.463 0 .54.693.143.933a6.5 6.5 0 1 0 8.924 8.924c.24-.396.933-.32.933.143c0 1.138-.19 2.231-.54 3.25H22a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1 0-1.5h.54A10 10 0 0 1 2 12m3 6.25a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 0-1.5zm3 3a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5zM19.9 2.307a.483.483 0 0 0-.9 0l-.43 1.095a.48.48 0 0 1-.272.274l-1.091.432a.486.486 0 0 0 0 .903l1.091.432a.48.48 0 0 1 .272.273L19 6.81c.162.41.74.41.9 0l.43-1.095a.48.48 0 0 1 .273-.273l1.091-.432a.486.486 0 0 0 0-.903l-1.091-.432a.48.48 0 0 1-.273-.274z"/><path fill="currentColor" d="M16.033 8.13a.483.483 0 0 0-.9 0l-.157.399a.48.48 0 0 1-.272.273l-.398.158a.486.486 0 0 0 0 .903l.398.157c.125.05.223.148.272.274l.157.399c.161.41.739.41.9 0l.157-.4a.48.48 0 0 1 .272-.273l.398-.157a.486.486 0 0 0 0-.903l-.398-.158a.48.48 0 0 1-.272-.273z"/></svg>
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
