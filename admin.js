document.addEventListener('DOMContentLoaded', () => {
    const adminPanel = document.getElementById('admin-panel');
    const passcodeOverlay = document.getElementById('passcode-overlay');
    const passcodeForm = document.getElementById('passcode-form');
    const adminContent = document.getElementById('admin-content');
    const navButtons = document.querySelectorAll('.nav-button');

    const toughEncode = (str) => {
        let secret = 5;
        let encoded = str.split('').map(char => String.fromCharCode(char.charCodeAt(0) + secret)).join('');
        return btoa(encoded.split('').reverse().join(''));
    };
    const adminPasscode = toughEncode('luauadmin$$123');

    if (sessionStorage.getItem('loggedInUser') !== 'realalex') {
        window.location.href = 'index.html';
        return;
    }
    
    if (sessionStorage.getItem('adminAuthenticated')) {
        passcodeOverlay.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadInitialContent();
    }

    passcodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('admin-passcode').value;
        if (toughEncode(input) === adminPasscode) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            passcodeOverlay.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            loadInitialContent();
        } else {
            alert('Incorrect passcode.');
        }
    });
    
    function loadInitialContent() { showVerifyAccounts(); }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const target = button.getAttribute('data-target');
            if (target === 'verify-accounts') showVerifyAccounts();
            else if (target === 'post-scripts') showPostScripts();
        });
    });

    function showVerifyAccounts() {
        adminContent.innerHTML = '';
        const users = JSON.parse(localStorage.getItem('alex-script-users')) || [];
        const admins = users.filter(u => u.role === 'admin').length;
        const mods = users.filter(u => u.role === 'mod').length;

        const section = document.createElement('div');
        section.innerHTML = `
            <h2>Account Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card"><div class="value">${users.length}</div><div class="label">Total Accounts</div></div>
                <div class="stat-card"><div class="value">${admins}</div><div class="label">Admins</div></div>
                <div class="stat-card"><div class="value">${mods}</div><div class="label">Mods</div></div>
            </div>
            <div class="user-list-container">
                <h3>Registered Usernames</h3>
                <div class="user-list">${users.map(user => `
                    <div class="user-item">
                        <span>
                            ${user.username}
                            ${user.role === 'admin' ? '<span class="role-badge">Admin</span>' : ''}
                            ${user.role === 'mod' ? '<span class="role-badge mod">Mod</span>' : ''}
                        </span>
                        ${user.username !== 'realalex' ? `
                        <div class="user-actions">
                            <button class="user-actions-button">&vellip;</button>
                            <div class="actions-dropdown">
                                <button class="role-change-btn" data-username="${user.username}" data-role="admin">Make Admin</button>
                                <button class="role-change-btn" data-username="${user.username}" data-role="mod">Make Mod</button>
                                <button class="role-change-btn" data-username="${user.username}" data-role="user">Make User</button>
                            </div>
                        </div>` : ''}
                    </div>`).join('')}
                </div>
            </div>
        `;
        adminContent.appendChild(section);
        attachUserActionListeners();
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
                let users = JSON.parse(localStorage.getItem('alex-script-users')) || [];
                const userIndex = users.findIndex(u => u.username === username);
                if (userIndex !== -1) {
                    users[userIndex].role = role;
                    localStorage.setItem('alex-script-users', JSON.stringify(users));
                    showVerifyAccounts();
                }
            });
        });
    }

    function showPostScripts() {
        adminContent.innerHTML = '';
        const section = document.createElement('div');
        section.innerHTML = `
            <h2>Post a New Script</h2>
            <form id="post-script-form">
                <div class="form-group"><label for="script-name">Script Title:</label><input type="text" id="script-name" required></div>
                <div class="form-group"><label for="script-description">Script Description:</label><textarea id="script-description" required></textarea></div>
                <div class="form-group"><label for="script-category">Category:</label><select id="script-category"></select></div>
                <div class="form-group"><label for="new-category">Or Add New Category:</label><input type="text" id="new-category" placeholder="Leave blank to use existing"></div>
                <div class="form-group"><label for="script-code">Script Code:</label><textarea id="script-code" required></textarea></div>
                <button type="submit" class="submit-btn">Post Script</button>
            </form>
            <div class="category-management"><h2>Manage Categories</h2><div id="category-list"></div></div>
        `;
        adminContent.appendChild(section);
        populateCategories();
        document.getElementById('post-script-form').addEventListener('submit', handleScriptPost);
    }
    
    function populateCategories() {
        const categories = JSON.parse(localStorage.getItem('script-categories')) || ['lua/luau scripts', 'JS Bookmarklets', 'Website projects'];
        const select = document.getElementById('script-category');
        const list = document.getElementById('category-list');
        select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        list.innerHTML = categories.map(cat => `
            <div class="category-item">
                <span>${cat}</span>
                <button class="remove-category-btn" data-category="${cat}">Remove</button>
            </div>
        `).join('');
        document.querySelectorAll('.remove-category-btn').forEach(button => {
            button.addEventListener('click', e => {
                const categoryToRemove = e.target.dataset.category;
                let currentCategories = JSON.parse(localStorage.getItem('script-categories')) || [];
                currentCategories = currentCategories.filter(c => c !== categoryToRemove);
                localStorage.setItem('script-categories', JSON.stringify(currentCategories));
                populateCategories();
            });
        });
    }

    function handleScriptPost(e) {
        e.preventDefault();
        const name = document.getElementById('script-name').value;
        const description = document.getElementById('script-description').value;
        const code = document.getElementById('script-code').value;
        const newCategory = document.getElementById('new-category').value.trim();
        let selectedCategory = document.getElementById('script-category').value;
        
        if (newCategory) {
            let categories = JSON.parse(localStorage.getItem('script-categories')) || [];
            if (!categories.includes(newCategory)) {
                categories.push(newCategory);
                localStorage.setItem('script-categories', JSON.stringify(categories));
            }
            selectedCategory = newCategory;
        }

        const scripts = JSON.parse(localStorage.getItem('posted-scripts')) || [];
        scripts.unshift({ name, description, code, category: selectedCategory, id: Date.now() });
        localStorage.setItem('posted-scripts', JSON.stringify(scripts));
        
        alert('Script posted successfully!');
        e.target.reset();
        showPostScripts();
    }
});```

*The response is too long. I will provide the main page and new message files in the next response.*
