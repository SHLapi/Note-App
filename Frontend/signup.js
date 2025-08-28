const signupForm = document.getElementById('signupForm');
const alertMSG = document.getElementById('alertMsg');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const email = document.getElementById('Email').value;

  try {
    const response = await fetch(`http://localhost:5000/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstname, lastname, username, email, password })
    });

    if (response.ok) {
      alert('Sign up successful! You can now log in.');
      window.location.href = '/login.html';
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (err) {
    console.error('Error during sign-up:', err);
    alert('An error occurred. Please try again.');
  }
});