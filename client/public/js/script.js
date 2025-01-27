const proxy = 'proxy.php';
const result = document.getElementById('result');
const form = document.querySelector('form');
const toast = document.getElementById('toast');

const maxDelay = 60000;
let updateInfoTimer;

async function updateInfo(currentDelay, previousDelay, currentInfo) {
  const status = {};
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
  toast.querySelector('span:first-child').textContent = icon;
  toast.querySelector('span:last-child').textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.querySelector('span:first-child').textContent = '';
    toast.querySelector('span:last-child').textContent = '';
  }, 2925);
}

updateInfo(2000, 1000);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  if (formData.get('action') != 'refresh') {
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
  } else {
    showToast('Updating system status...', '✓');
  }

  updateInfo(1000, 0);
});

document.querySelectorAll('form select, form button, form input').forEach((input, index, set) => {
  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case '/':
        if (e.ctrlKey)
          form.requestSubmit();
        break;
      case 'Tab':
        if (index <= 0 && e.shiftKey) {
          e.preventDefault();
        } else if (index >= set.length-1 && !e.shiftKey) {
          e.preventDefault();
        }
        break;
      case 'ArrowUp':
        if (input.tagName != 'SELECT' && index > 0)
          set[index-1].focus();
        break;
      case 'ArrowDown':
        if (input.tagName != 'SELECT' && index < set.length-1)
          set[index+1].focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0)
          set[index-1].focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < set.length-1)
          set[index+1].focus();
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
