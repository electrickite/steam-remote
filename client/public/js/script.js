const proxy = 'proxy.php';
const result = document.getElementById('result');
const form = document.querySelector('form');
const toast = document.getElementById('toast');

const maxDelay = 60000;
const status = {};
let updateInfoTimer;

async function updateInfo(currentDelay, previousDelay, currentInfo) {
  clearTimeout(updateInfoTimer);

  try {
    const res = await fetch(`${proxy}?action=info`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const newInfo = JSON.stringify(data);
    if (newInfo !== currentInfo) {
      currentDelay = 2000;
      previousDelay = 1000;
      currentInfo = newInfo;
    }
    status.online = (data && !data.error) ? true : false;
    status.steam = data.active ?? false;
    status.account = data.user ?? (data.active ? 'Signed out' : 'Unknown');
  } catch (error) {
    currentInfo = '';
    status.online = false;
    status.steam = false;
    status.account = 'Unknown';
  };

  window.statusOnline.textContent = status.online ? '✅' : '❌';
  window.statusOnline.setAttribute('aria-label', status.online ? 'Yes' : 'No');
  window.statusOnline.setAttribute('title', status.online ? 'Yes' : 'No');
  window.statusSteam.textContent = status.steam ? '✅' : '❌';
  window.statusSteam.setAttribute('aria-label', status.steam ? 'Yes' : 'No');
  window.statusSteam.setAttribute('title', status.steam ? 'Yes' : 'No');
  window.statusAccount.textContent = status.account;

  let newDelay = currentDelay + previousDelay;
  if (newDelay > maxDelay) newDelay = maxDelay;
  updateInfoTimer = setTimeout(updateInfo, newDelay, newDelay, currentDelay, currentInfo);
}

function showToast(message, icon) {
  const iconEl = document.createElement('span');
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.textContent = icon;
  const messageEl = document.createElement('span');
  messageEl.textContent = message;
  toast.replaceChildren(iconEl, messageEl);
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.replaceChildren();
  }, 3200);
}

function refreshInfo() {
  showToast('Updating system status...', '✓');
  updateInfo(1000, 0);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const action = formData.get('action');
  const force = formData.get('force');

  switch (action) {
    case 'refresh':
      refreshInfo();
      return;
    case 'start':
      if (!status.online && !force)
        formData.set('action', 'poweron');
      break;
    case 'stop':
    case 'restart':
    case 'poweroff':
    case 'powercycle':
      if (!status.online && !force) {
        showToast('The system is offline', '⚠');
        return;
      }
      break;
    case 'poweron':
      if (status.online && !force) {
        showToast('The system is online', '⚠');
        return;
      }
      break;
  }

  try {
    const res = await fetch('proxy.php?action=%2Finfo', {
      method: 'POST',
      body: new URLSearchParams(formData),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    if (res.status >= 200 && res.status < 300) {
      showToast(data.message ?? 'Action request successful', '✓');
    } else {
      showToast(data.error ?? 'An error occurred performing the action', '⚠');
    }
  } catch (error) {
    showToast('An error occurred requesting the action', '⚠');
  };

  updateInfo(1000, 0);
});

document.querySelectorAll('form select, form button, form input').forEach((input, index, set) => {
  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Tab':
        if (index <= 0 && e.shiftKey) {
          e.preventDefault();
        } else if (index >= set.length-1 && !e.shiftKey) {
          e.preventDefault();
        }
        break;
      case 'ArrowUp':
        if (input.tagName != 'SELECT' && index > 0) {
          if (set[index-1].disabled) {
            set[index-2].focus();
          } else {
            set[index-1].focus();
          }
        }
        break;
      case 'ArrowDown':
        if (input.tagName != 'SELECT' && index < set.length-1) {
          if (set[index+1].disabled) {
            set[index+2].focus();
          } else {
            set[index+1].focus();
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          if (set[index-1].disabled) {
            set[index-2].focus();
          } else {
            set[index-1].focus();
          }
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < set.length-1) {
          if (set[index+1].disabled) {
            set[index+2].focus();
          } else {
            set[index+1].focus();
          }
        }
        break;
    }
  });
});

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      if (document.activeElement == document.body || !document.activeElement)
        form.querySelector('select').focus();
      break;
    case '/':
      if (e.ctrlKey)
        form.requestSubmit();
      break;
    case '.':
      if (e.ctrlKey)
        refreshInfo();
      break;
  }
});

document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  });
});

const actionSelect = document.getElementById('action');
const userSelect = document.getElementById('user');

function setUserSelectState() {
  if (['start', 'restart'].includes(actionSelect.value)) {
    userSelect.disabled = false;
  } else {
    userSelect.disabled = true;
  }
}

actionSelect.addEventListener('change', setUserSelectState);

document.addEventListener('DOMContentLoaded', () => {
  setUserSelectState();
  updateInfo(2000, 1000);
});
