const resetPasswordForm = document.getElementById('resetPasswordForm');
const passwordInput = document.getElementById('password');
const alertMSG = document.getElementById('alertMsg');
const API_URL ='http://localhost:5000';
resetPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = passwordInput.value;
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  try {
    const response = await fetch(`${API_URL}/api/auth/resetPassword/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (response.ok) {
      alertMSG.textContent = 'Password reset successfully!';
      setTimeout(() => {
        window.location.href = '/login.html?reset=true';
      }, 2000);
    } else {
      alertMSG.textContent = data.error;
    }
  } catch (err) {
    console.error('Error:', err);
    alertMSG.textContent = 'An error occurred. Please try again.';
  }
});