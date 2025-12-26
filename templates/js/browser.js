const ALLOWED_PROTOCOLS = ['http:', 'https:'];

function sanitizeUrl(input) {
  const url = new URL(input);
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    throw new Error('Blocked protocol');
  }
  return url.href;
}

const $ = id => document.getElementById(id);
const tabs = [], tabsContainer = $('tabs'), webviews = $('webviews-container');
let activeTabId = null;
let editingTabId = null;

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
  tabs.forEach(({ id: tid, tab, webview, backBtn, forwardBtn }) => {
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

    if (isActive) {
      backBtn.disabled = !webview.canGoBack();
      forwardBtn.disabled = !webview.canGoForward();
      backBtn.style.opacity = backBtn.disabled ? 0.4 : 1;
      forwardBtn.style.opacity = forwardBtn.disabled ? 0.4 : 1;
    }
  });
  activeTabId = id;
  saveTabs();
}

const createTab = (url, customId) => {
  const id = customId || 'tab-' + crypto.randomUUID();
  if (tabs.some(t => t.id === id)) return setActiveTab(id);

  const tab = document.createElement('div');
  tab.className = 'flex items-center gap-0.5 py-1 border-b-2 cursor-pointer';
  
  const label = document.createElement('span');
  label.className = 'tab-label';
  label.textContent = 'Tab';
  tab.append(label);

  const backBtn = document.createElement('button');
  backBtn.innerHTML = `<svg class="ml-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m8.165 11.63l6.63-6.43C15.21 4.799 16 5.042 16 5.57v12.86c0 .528-.79.771-1.205.37l-6.63-6.43a.5.5 0 0 1 0-.74"/></svg>`;
  backBtn.title = "Back";
  tab.append(backBtn);

  const forwardBtn = document.createElement('button');
  forwardBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15.835 11.63L9.205 5.2C8.79 4.799 8 5.042 8 5.57v12.86c0 .528.79.771 1.205.37l6.63-6.43a.5.5 0 0 0 0-.74"/></svg>`;
  forwardBtn.title = "Forward";
  tab.append(forwardBtn);

  const reloadBtn = document.createElement('button');
  reloadBtn.innerHTML = `<svg class="text-amber-400 hover:text-amber-500 dark:text-amber-600 dark:hover:text-amber-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12.079 2.25c-4.794 0-8.734 3.663-9.118 8.333H2a.75.75 0 0 0-.528 1.283l1.68 1.666a.75.75 0 0 0 1.056 0l1.68-1.666a.75.75 0 0 0-.528-1.283h-.893c.38-3.831 3.638-6.833 7.612-6.833a7.66 7.66 0 0 1 6.537 3.643a.75.75 0 1 0 1.277-.786A9.16 9.16 0 0 0 12.08 2.25m8.761 8.217a.75.75 0 0 0-1.054 0L18.1 12.133a.75.75 0 0 0 .527 1.284h.899c-.382 3.83-3.651 6.833-7.644 6.833a7.7 7.7 0 0 1-6.565-3.644a.75.75 0 1 0-1.277.788a9.2 9.2 0 0 0 7.842 4.356c4.808 0 8.765-3.66 9.15-8.333H22a.75.75 0 0 0 .527-1.284z"/></svg>`;
  tab.append(reloadBtn);

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = `<svg class="ml-1 text-rose-400 hover:text-rose-500 dark:text-rose-600 dark:hover:text-rose-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10M8.97 8.97a.75.75 0 0 1 1.06 0L12 10.94l1.97-1.97a.75.75 0 0 1 1.06 1.06L13.06 12l1.97 1.97a.75.75 0 0 1-1.06 1.06L12 13.06l-1.97 1.97a.75.75 0 0 1-1.06-1.06L10.94 12l-1.97-1.97a.75.75 0 0 1 0-1.06" clip-rule="evenodd"/></svg>`;
  tab.append(closeBtn);

  tabsContainer.append(tab);

  const webview = document.createElement('webview');
  webview.src = url;
  webview.id = id;
  webview.className = 'absolute inset-0 w-full h-full hidden';
  webview.partition = 'persist:' + id;
  webview.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  webviews.append(webview);

  webview.isDomReady = false;

  const updateNavButtons = () => {
    backBtn.disabled = !webview.canGoBack();
    forwardBtn.disabled = !webview.canGoForward();
    backBtn.style.opacity = backBtn.disabled ? 0.4 : 1;
    forwardBtn.style.opacity = forwardBtn.disabled ? 0.4 : 1;
  };

  webview.addEventListener('dom-ready', () => {
    webview.isDomReady = true;
    updateNavButtons();

    if (activeTabId === id) {
      setActiveTab(id);
    }

    saveTabs();
  });

  webview.addEventListener('did-navigate', updateNavButtons);
  webview.addEventListener('did-navigate-in-page', updateNavButtons);

  const tabObj = { id, tab, webview, label, backBtn, forwardBtn };
  tabs.push(tabObj);

  tab.onclick = () => setActiveTab(id);
  tab.ondblclick = e => {
    e.stopPropagation();
    editingTabId = id;
    $('url-input').value = webview.src;
    $('modal').classList.replace('hidden', 'flex');
    $('url-input').focus();
  };

  backBtn.onclick = e => {
    e.stopPropagation();
    if (webview.canGoBack()) webview.goBack();
  };
  forwardBtn.onclick = e => {
    e.stopPropagation();
    if (webview.canGoForward()) webview.goForward();
  };
  reloadBtn.onclick = e => { e.stopPropagation(); webview.reload(); };
  closeBtn.onclick = e => { e.stopPropagation(); closeTab(id) };

  updateTabLabels();

  if (!customId) {
    activeTabId = id; 
  }
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
$('cancel-btn').onclick = () => {
  $('modal').classList.replace('flex', 'hidden');
  editingTabId = null;
};
$('open-btn').onclick = () => {
  try {
    const safeUrl = sanitizeUrl($('url-input').value.trim());

    if (editingTabId) {
      const tab = tabs.find(t => t.id === editingTabId);
      if (tab) {
        tab.webview.src = safeUrl;
        saveTabs();
      }
      editingTabId = null;
    } else {
      createTab(safeUrl);
    }

    $('cancel-btn').click();
  } catch {
    alert('URL not allowed (http/https only)');
    $('url-input').focus();
  }
};

$('url-input').onkeydown = e => { if (e.key === 'Enter') $('open-btn').click(); };

window.addEventListener('DOMContentLoaded', loadTabs);