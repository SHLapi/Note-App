const loginForm = document.getElementById('loginForm'); 
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const alertMSG = document.getElementById('alertMsg');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch(`http://localhost:5000/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
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

// Check for verification or reset success message in URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('verified')) {
    alertMSG.textContent = 'Email verified successfully! Please log in.';
} else if (urlParams.get('reset')) {
    alertMSG.textContent = 'Password reset successfully! Please log in.';
}
