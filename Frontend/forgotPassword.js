const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const emailInput = document.getElementById('email');
const alertMSG = document.getElementById('alertMsg');
const API_URL = 'http://localhost:5000';


// show password toggle 
togglePassword.addEventListener('click', () => {
  const passwordField = document.getElementById('password');
  const icon = togglePassword.querySelector('i');
  if (!icon) return;
  const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordField.setAttribute('type', type);
  icon.classList.toggle('fa-eye');
  icon.classList.toggle('fa-eye-slash');
});



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
      alertMSG.textContent = 'Password reset link sent to your email.';
    } else {
      alertMSG.textContent = data.error;
    }
  } catch (err) {
    console.error('Error:', err);
    alertMSG.textContent = 'An error occurred. Please try again.';
  }
});