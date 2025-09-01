const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const emailInput = document.getElementById('email');
const alertMSG = document.getElementById('alertMsg');
const API_URL = 'http://localhost:5000';


forgotPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value;

  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      window.alert('Password reset link sent to your email.') ;
    } else {
      alertMSG.textContent = data.error;
    }
  } catch (err) {
    console.error('Error:', err);
    window.alert('An error occurred. Please try again.');
  }
});