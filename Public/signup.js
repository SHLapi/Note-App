const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      alert('Sign up successful! You can now log in.');
      window.location.href = '/index.html';
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (err) {
    console.error('Error during sign-up:', err);
    alert('An error occurred. Please try again.');
  }
});