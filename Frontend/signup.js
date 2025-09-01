const signupForm = document.getElementById('signupForm');
const alertMSG = document.getElementById('alertMsg');
const API_URL = 'http://localhost:5000';
const togglePassword = document.getElementById('togglePassword');



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


// Sign-up form submission
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
      window.alert('Sign up successful! Please check your email to verify.');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1000);
    } else {
      alertMSG.textContent = data.error || 'Signup failed. Please try again.';
    }
  } catch (err) {
    console.error('Error during sign-up:', err);
    alertMSG.textContent = 'An error occurred. Please try again.';
  }
});