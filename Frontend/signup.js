const signupForm = document.getElementById('signupForm');
const alertMSG = document.getElementById('alertMsg');
const API_URL = 'http://localhost:5000';

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const email = document.getElementById('Email').value.trim();

  if (!username || !email || !password) {
    alertMSG.textContent = 'Please fill in all fields';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alertMSG.textContent = 'Sign up successful! Please check your email to verify.';
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } else {
      alertMSG.textContent = data.error || 'Signup failed. Please try again.';
    }
  } catch (err) {
    console.error('Error during sign-up:', err);
    alertMSG.textContent = 'An error occurred. Please try again.';
  }
});