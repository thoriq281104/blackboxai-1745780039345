const apiBaseUrl = 'http://localhost:3000';

let currentTool = null;

function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = isError ? 'mt-4 text-center font-semibold text-red-600' : 'mt-4 text-center font-semibold text-green-600';
  setTimeout(() => {
    notification.textContent = '';
  }, 5000);
}

function updateToolInfo(tool) {
  currentTool = tool;
  document.getElementById('tool-name').textContent = tool.name;
  document.getElementById('tool-status').textContent = tool.status;
  document.getElementById('tool-info').classList.remove('hidden');
}

function clearToolInfo() {
  currentTool = null;
  document.getElementById('tool-info').classList.add('hidden');
  document.getElementById('user-name').value = '';
}

async function fetchToolById(id) {
  try {
    const response = await fetch(`${apiBaseUrl}/tools`);
    const tools = await response.json();
    return tools.find(t => t.id === parseInt(id));
  } catch (error) {
    showNotification('Failed to fetch tools from server', true);
    return null;
  }
}

async function borrowTool() {
  if (!currentTool) {
    showNotification('No tool selected', true);
    return;
  }
  const user = document.getElementById('user-name').value.trim();
  if (!user) {
    showNotification('Please enter your name', true);
    return;
  }
  try {
    const response = await fetch(`${apiBaseUrl}/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId: currentTool.id, user })
    });
    const data = await response.json();
    if (response.ok) {
      showNotification(data.message);
      currentTool.status = 'borrowed';
      updateToolInfo(currentTool);
    } else {
      showNotification(data.message, true);
    }
  } catch (error) {
    showNotification('Failed to borrow tool', true);
  }
}

async function returnTool() {
  if (!currentTool) {
    showNotification('No tool selected', true);
    return;
  }
  const user = document.getElementById('user-name').value.trim();
  if (!user) {
    showNotification('Please enter your name', true);
    return;
  }
  try {
    const response = await fetch(`${apiBaseUrl}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId: currentTool.id, user })
    });
    const data = await response.json();
    if (response.ok) {
      showNotification(data.message);
      currentTool.status = 'available';
      updateToolInfo(currentTool);
    } else {
      showNotification(data.message, true);
    }
  } catch (error) {
    showNotification('Failed to return tool', true);
  }
}

function onScanSuccess(decodedText, decodedResult) {
  // Assuming QR code contains tool ID as plain text
  fetchToolById(decodedText).then(tool => {
    if (tool) {
      updateToolInfo(tool);
      document.getElementById('qr-result').textContent = 'QR Code scanned successfully!';
    } else {
      showNotification('Tool not found for scanned QR code', true);
      clearToolInfo();
      document.getElementById('qr-result').textContent = '';
    }
  });
}

function onScanFailure(error) {
  // console.warn(`QR scan error: ${error}`);
}

document.getElementById('borrow-btn').addEventListener('click', borrowTool);
document.getElementById('return-btn').addEventListener('click', returnTool);

window.onload = () => {
  const html5QrCode = new Html5Qrcode("qr-reader");
  const config = { fps: 10, qrbox: 250 };
  html5QrCode.start(
    { facingMode: "environment" },
    config,
    onScanSuccess,
    onScanFailure
  ).catch(err => {
    showNotification('Unable to start QR code scanner', true);
  });
};
