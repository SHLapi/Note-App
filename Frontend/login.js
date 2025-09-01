const loginForm = document.getElementById('loginForm'); 
const identifierInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const alertMSG = document.getElementById('alertMsg');

const API_URL = 'http://localhost:5000';

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;
    if (!identifier || !password) {
        alertMSG.textContent = 'Please fill in all fields.';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('theme', data.theme);
            window.location.href = './index.html'; 
        } else {
            alertMSG.textContent = data.error ;
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('An error occurred. Please try again.');
    }
});

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


// Check for verification or reset success message in URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('verified')) {
    alertMSG.textContent = 'Email verified successfully! Please log in.';
} else if (urlParams.get('reset')) {
    alertMSG.textContent = 'Password reset successfully! Please log in.';
}
