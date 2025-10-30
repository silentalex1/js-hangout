document.addEventListener('DOMContentLoaded', () => {
    const terminalContainer = document.getElementById('terminal-container');
    const terminalText = document.getElementById('terminal-text');
    const mainContent = document.getElementById('main-content');
    const flipper = document.querySelector('.flipper');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    const lines = [
        "> Initializing alex useful scripts..",
        "> loading up everything..",
        "> Now launching cheats script hub enjoy."
    ];
    let lineIndex = 0;
    let charIndex = 0;

    function typeLine() {
        if (lineIndex < lines.length) {
            if (charIndex < lines[lineIndex].length) {
                terminalText.innerHTML += lines[lineIndex].charAt(charIndex);
                charIndex++;
                setTimeout(typeLine, 50);
            } else {
                terminalText.innerHTML += '\n';
                lineIndex++;
                charIndex = 0;
                setTimeout(typeLine, 500);
            }
        } else {
            setTimeout(glitchAndFade, 1000);
        }
    }

    function glitchAndFade() {
        terminalText.classList.add('glitch');
        setTimeout(() => {
            terminalContainer.classList.add('fade-out');
            mainContent.classList.remove('hidden');
            setTimeout(() => {
                terminalContainer.style.display = 'none';
                mainContent.style.opacity = 1;
            }, 1000);
        }, 1500);
    }

    showRegister.addEventListener('click', () => {
        flipper.classList.add('flipped');
    });

    showLogin.addEventListener('click', () => {
        flipper.classList.remove('flipped');
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const reason = document.getElementById('find-reason').value;

        localStorage.setItem('user-username', username);
        localStorage.setItem('user-password', password);

        sendToDiscord(username, reason);
        
        sessionStorage.setItem('loggedInUser', username);
        window.location.href = 'main.html';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const storedUsername = localStorage.getItem('user-username');
        const storedPassword = localStorage.getItem('user-password');

        if (username === storedUsername && password === storedPassword) {
            sessionStorage.setItem('loggedInUser', username);
            window.location.href = 'main.html';
        } else {
            alert('Invalid username or password.');
        }
    });

    function sendToDiscord(username, reason) {
        const webhookUrl = "https://discord.com/api/webhooks/1433590384545501194/_EIJPFIGmv_T3lL4zx00zP1QdalIamTApOlGCMDAlKKYL9eW3z2vIzjjLcJVwrcYmZ8K";
        
        const now = new Date();
        const date = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const createdTimestamp = `${date} - ${time}`;

        const payload = {
            embeds: [{
                title: "New Account Created",
                color: 3447003,
                fields: [
                    { name: "username", value: username, inline: true },
                    { name: "reason", value: reason, inline: true },
                    { name: "account created", value: createdTimestamp, inline: false }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(error => console.error('Error sending webhook:', error));
    }
    
    setTimeout(typeLine, 1000);
});
