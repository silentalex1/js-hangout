document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');

    const loggedInUser = sessionStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        window.location.href = 'index.html';
    } else {
        usernameDisplay.textContent = loggedInUser;
    }

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });
});
