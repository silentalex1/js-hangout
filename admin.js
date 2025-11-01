document.addEventListener('DOMContentLoaded', () => {
    const adminPanel = document.getElementById('admin-panel');
    const passcodeOverlay = document.getElementById('passcode-overlay');
    const passcodeForm = document.getElementById('passcode-form');
    const adminContent = document.getElementById('admin-content');
    const navButtons = document.querySelectorAll('.nav-button');
    const qrCodeContainer = document.getElementById('qrcode');
    const submitBtn = document.getElementById('submit-passcode-btn');

    let currentLoginToken = null;

    const toughEncode = (str) => {
        let secret = 5;
        let encoded = str.split('').map(char => String.fromCharCode(char.charCodeAt(0) + secret)).join('');
        return btoa(encoded.split('').reverse().join(''));
    };
    const adminPasscode = toughEncode('luauadmin$$123');
    const loggedInUser = sessionStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    }

    database.ref(`users/${loggedInUser}/role`).get().then(snapshot => {
        if (!snapshot.exists() || snapshot.val() !== 'admin') {
            window.location.href = 'main.html';
        }
    });
    
    if (sessionStorage.getItem('adminAuthenticated')) {
        passcodeOverlay.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadInitialContent();
    } else {
        generateAndListenForToken();
    }

    function generateAndListenForToken() {
        currentLoginToken = 'token_' + Math.random().toString(36).substr(2, 9);
        new QRCode(qrCodeContainer, currentLoginToken);

        const tokenRef = database.ref(`loginTokens/${currentLoginToken}`);
        tokenRef.set({ status: 'pending', createdAt: new Date().toISOString() });
        
        tokenRef.on('value', (snapshot) => {
            if (snapshot.exists() && snapshot.val().status === 'approved') {
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = 'var(--accent-color)';
                qrCodeContainer.innerHTML = '<p style="color: var(--success-color);">Authorized!</p>';
                tokenRef.off();
            }
        });
    }

    passcodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('admin-passcode').value;
        if (toughEncode(input) === adminPasscode) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            database.ref(`loginTokens/${currentLoginToken}`).remove();
            passcodeOverlay.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            loadInitialContent();
        } else {
            alert('Incorrect passcode.');
        }
    });

    function loadInitialContent() { showVerifyAccounts(); }

    navButtons.forEach(button => {
        const target = button.getAttribute('data-target');
        if (target) {
            button.addEventListener('click', () => {
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                if (target === 'verify-accounts') showVerifyAccounts();
                else if (target === 'post-scripts') showPostScripts();
            });
        }
    });

    function showVerifyAccounts() {
        adminContent.innerHTML = '';
        const usersRef = database.ref('users');

        usersRef.get().then((snapshot) => {
            const users = snapshot.val() || {};
            const userList = Object.entries(users);
            const admins = userList.filter(([name, data]) => data.role === 'admin').length;
            const mods = userList.filter(([name, data]) => data.role === 'mod').length;

            const section = document.createElement('div');
            section.innerHTML = `
                <h2>Account Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-card"><div class="value">${userList.length}</div><div class="label">Total Accounts</div></div>
                    <div class="stat-card"><div class="value">${admins}</div><div class="label">Admins</div></div>
                    <div class="stat-card"><div class="value">${mods}</div><div class="label">Mods</div></div>
                </div>
                <div class="user-list-container">
                    <h3>Registered Usernames</h3>
                    <div class="user-list"></div>
                </div>`;
            
            const userListHTML = userList.map(([username, data]) => `
                <div class="user-item">
                    <span>
                        ${username}
                        ${data.role === 'admin' ? '<span class="role-badge">Admin</span>' : ''}
                        ${data.role === 'mod' ? '<span class="role-badge mod">Mod</span>' : ''}
                    </span>
                    ${username !== 'realalex' ? `
                    <div class="user-actions">
                        <button class="user-actions-button">&vellip;</button>
                        <div class="actions-dropdown">
                            <button class="role-change-btn" data-username="${username}" data-role="admin">Make Admin</button>
                            <button class="role-change-btn" data-username="${username}" data-role="mod">Make Mod</button>
                            <button class="role-change-btn" data-username="${username}" data-role="user">Make User</button>
                        </div>
                    </div>` : ''}
                </div>`).join('');
            
            section.querySelector('.user-list').innerHTML = userListHTML;
            adminContent.appendChild(section);
            attachUserActionListeners();
        });
    }

    function attachUserActionListeners() {
        document.querySelectorAll('.user-actions-button').forEach(button => {
            button.addEventListener('click', e => {
                const dropdown = e.currentTarget.nextElementSibling;
                const isVisible = dropdown.style.display === 'block';
                document.querySelectorAll('.actions-dropdown').forEach(d => d.style.display = 'none');
                dropdown.style.display = isVisible ? 'none' : 'block';
            });
        });

        document.querySelectorAll('.role-change-btn').forEach(button => {
            button.addEventListener('click', e => {
                const username = e.target.dataset.username;
                const role = e.target.dataset.role;
                database.ref(`users/${username}/role`).set(role).then(() => {
                    showVerifyAccounts();
                });
            });
        });
    }
});
