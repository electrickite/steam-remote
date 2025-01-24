const proxy = 'proxy.php';
const result = document.getElementById('result');
const form = document.querySelector('form');
const toast = document.getElementById('toast');

const maxDelay = 60000;
let updateInfoTimer;

function updateInfo(currentDelay, previousDelay, currentInfo) {
  const status = {};

  fetch(`${proxy}?action=info`, {
    method: 'GET',
  }).then((response) => {
    return response.json();
  }).then((data) => {
    const newInfo = JSON.stringify(data);
    if (newInfo !== currentInfo) {
      currentDelay = 2000;
      previousDelay = 1000;
      currentInfo = newInfo;
    }
    status.online = data ? true : false;
    status.steam = data.active ?? false;
    status.account = data.user ?? 'Signed out';
  }).catch(() => {
    currentInfo = '';
    status.online = false;
    status.steam = false;
    status.account = 'Unknown';
  }).finally(() => {
    window.statusOnline.textContent = status.online ? '✅' : '❎';
    window.statusOnline.setAttribute('aria-label', status.online ? 'Yes' : 'No');
    window.statusOnline.setAttribute('title', status.online ? 'Yes' : 'No');
    window.statusSteam.textContent = status.steam ? '✅' : '❎';
    window.statusSteam.setAttribute('aria-label', status.steam ? 'Yes' : 'No');
    window.statusSteam.setAttribute('title', status.steam ? 'Yes' : 'No');
    window.statusAccount.textContent = status.account;

    const newDelay = currentDelay + previousDelay;
    if (newDelay > maxDelay) newDelay = maxDelay;
    console.log(`Delay: ${newDelay}    Previous: ${currentDelay}`);
    updateInfoTimer = setTimeout(updateInfo, newDelay, newDelay, currentDelay, currentInfo);
  });
}

function showToast(message, icon) {
  toast.querySelector('span:first-child').textContent = icon;
  toast.querySelector('span:last-child').textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    // toast.querySelector('span:first-child').textContent = '';
    // toast.querySelector('span:last-child').textContent = '';
  }, 2975);
}

updateInfo(2000, 1000);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let res;

  fetch('proxy.php?action=%2Finfo', {
      method: 'POST',
      body: new URLSearchParams(new FormData(form))
  }).then((response) => {
    res = response;
    return response.json();
  }).then((data) => {
    if (res.status >= 200 && res.status < 300) {
      showToast(data.message ?? 'Action request successful', '✓');
    } else {
      showToast(data.error ?? 'An error occurred performing the action', '⚠');
    }
    console.log(data);
  }).catch(() => {
    showToast('An error occurred requesting the action', '⚠');
  }).finally(() => {
    updateInfo(1000, 0);
  });
});
