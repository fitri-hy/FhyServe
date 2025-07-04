const $ = id => document.getElementById(id);
const tabs = [], tabsContainer = $('tabs'), webviews = $('webviews-container');
let activeTabId = null;

const updateTabLabels = () => tabs.forEach((t, i) => {
  t.label.textContent = `TAB-${i + 1}`;
  t.tab.classList.toggle('border-emerald-500', t.id === activeTabId);
  t.tab.classList.toggle('border-gray-300', t.id !== activeTabId);
});

const saveTabs = () => {
  localStorage.setItem('tabs', JSON.stringify(tabs.map(t => ({ id: t.id, url: t.webview.src }))));
  localStorage.setItem('activeTabId', activeTabId);
};

function setActiveTab(id) {
  tabs.forEach(({ id: tid, tab, webview }) => {
  const isActive = tid === id;
    tab.classList.toggle('border-emerald-500', isActive);
    tab.classList.toggle('hover:border-emerald-400', isActive);
    tab.classList.toggle('dark:border-emerald-600', isActive);
    tab.classList.toggle('dark:hover:border-emerald-500', isActive);

    tab.classList.toggle('border-gray-300', !isActive);
    tab.classList.toggle('hover:border-gray-400', !isActive);
    tab.classList.toggle('dark:border-neutral-800', !isActive);
    tab.classList.toggle('dark:hover:border-neutral-700', !isActive);

    webview.classList.toggle('hidden', !isActive);
  });
  activeTabId = id;
  saveTabs();
}

const createTab = (url, customId) => {
  const id = customId || 'tab-' + crypto.randomUUID();
  if (tabs.some(t => t.id === id)) return setActiveTab(id);

  const tab = document.createElement('div');
  tab.className = 'flex items-center gap-1 py-1 border-b-2 cursor-pointer';
  const label = document.createElement('span');
  label.className = 'tab-label';
  label.textContent = 'Tab';
  tab.append(label);

  const reloadBtn = document.createElement('button');
  reloadBtn.innerHTML = `<svg class="ml-1 text-amber-400 hover:text-amber-500 dark:text-amber-600 dark:hover:text-amber-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12.079 2.25c-4.794 0-8.734 3.663-9.118 8.333H2a.75.75 0 0 0-.528 1.283l1.68 1.666a.75.75 0 0 0 1.056 0l1.68-1.666a.75.75 0 0 0-.528-1.283h-.893c.38-3.831 3.638-6.833 7.612-6.833a7.66 7.66 0 0 1 6.537 3.643a.75.75 0 1 0 1.277-.786A9.16 9.16 0 0 0 12.08 2.25m8.761 8.217a.75.75 0 0 0-1.054 0L18.1 12.133a.75.75 0 0 0 .527 1.284h.899c-.382 3.83-3.651 6.833-7.644 6.833a7.7 7.7 0 0 1-6.565-3.644a.75.75 0 1 0-1.277.788a9.2 9.2 0 0 0 7.842 4.356c4.808 0 8.765-3.66 9.15-8.333H22a.75.75 0 0 0 .527-1.284z"/></svg>`;
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = `<svg class="text-rose-400 hover:text-rose-500 dark:text-rose-600 dark:hover:text-rose-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10M8.97 8.97a.75.75 0 0 1 1.06 0L12 10.94l1.97-1.97a.75.75 0 0 1 1.06 1.06L13.06 12l1.97 1.97a.75.75 0 0 1-1.06 1.06L12 13.06l-1.97 1.97a.75.75 0 0 1-1.06-1.06L10.94 12l-1.97-1.97a.75.75 0 0 1 0-1.06" clip-rule="evenodd"/></svg>`;
  tab.append(reloadBtn, closeBtn);
  tabsContainer.append(tab);

  const webview = document.createElement('webview');
  webview.src = url;
  webview.id = id;
  webview.className = 'absolute inset-0 w-full h-full hidden';
  webview.partition = 'persist:' + id;
	  webview.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  webviews.append(webview);

  const tabObj = { id, tab, webview, label };
  tabs.push(tabObj);

  tab.onclick = () => setActiveTab(id);
  reloadBtn.onclick = e => { e.stopPropagation(); webview.src = webview.src };
  closeBtn.onclick = e => { e.stopPropagation(); closeTab(id) };

  updateTabLabels();
  if (!customId) setActiveTab(id);
  saveTabs();
};

const closeTab = id => {
  const i = tabs.findIndex(t => t.id === id);
  if (i < 0) return;
  tabs[i].tab.remove();
  tabs[i].webview.remove();
  tabs.splice(i, 1);
  if (tabs.length) setActiveTab(tabs[i === 0 ? 0 : i - 1].id);
  else activeTabId = null;
  saveTabs();
};

const loadTabs = () => {
  const saved = JSON.parse(localStorage.getItem('tabs') || '[]');
  if (!saved.length) createTab('https://www.google.com');
  else saved.forEach(t => createTab(t.url, t.id));
  const savedId = localStorage.getItem('activeTabId');
  const tab = tabs.find(t => t.id === savedId);
  tab ? setActiveTab(tab.id) : setActiveTab(tabs[0].id);
};

$('add-tab-btn').onclick = () => { $('url-input').value = ''; $('modal').classList.replace('hidden', 'flex'); $('url-input').focus(); };
$('cancel-btn').onclick = () => $('modal').classList.replace('flex', 'hidden');
$('open-btn').onclick = () => {
  try {
const url = new URL($('url-input').value.trim());
    createTab(url.href);
    $('cancel-btn').click();
  } catch { alert('Invalid URL'); $('url-input').focus(); }
};
$('url-input').onkeydown = e => { if (e.key === 'Enter') $('open-btn').click(); };

window.addEventListener('DOMContentLoaded', loadTabs);