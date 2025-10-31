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
    
    function loadInitialContent() {
        showVerifyAccounts();
    }

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
        const totalUsers = users.length;
        const adminUsers = users.filter(u => u.username === 'realalex').length;
        const regularUsers = totalUsers - adminUsers;

        const section = document.createElement('div');
        section.innerHTML = `
            <h2>Account Statistics</h2>
            <div class="stats-container">
                <div class="stat-item">
                    <label>Total Accounts</label>
                    <div class="bar-background">
                        <div class="bar" id="total-bar"><span>${totalUsers}</span></div>
                    </div>
                </div>
                 <div class="stat-item">
                    <label>Regular Users</label>
                    <div class="bar-background">
                        <div class="bar" id="regular-bar"><span>${regularUsers}</span></div>
                    </div>
                </div>
            </div>
            <div class="user-list-container">
                <h3>Registered Usernames</h3>
                <div class="user-list">
                    ${users.map(user => `<div class="user-item">${user.username}</div>`).join('')}
                </div>
            </div>
        `;
        adminContent.appendChild(section);
        
        setTimeout(() => {
            const totalBar = document.getElementById('total-bar');
            const regularBar = document.getElementById('regular-bar');
            if (totalBar) totalBar.style.width = '100%';
            if (regularBar && totalUsers > 0) regularBar.style.width = `${(regularUsers / totalUsers) * 100}%`;
        }, 100);
    }
    
    function showPostScripts() {
        adminContent.innerHTML = '';
        const categories = JSON.parse(localStorage.getItem('script-categories')) || ['Lua/luau scripts', 'JS Bookmarklet scripts', 'Website projects'];
        
        const section = document.createElement('div');
        section.innerHTML = `
            <h2>Post a New Script</h2>
            <form id="post-script-form">
                <div class="form-group">
                    <label for="script-name">Script Name:</label>
                    <input type="text" id="script-name" required>
                </div>
                <div class="form-group">
                    <label for="script-category">Category:</label>
                    <select id="script-category">
                        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                 <div class="form-group">
                    <label for="new-category">Or Add New Category:</label>
                    <input type="text" id="new-category" placeholder="Leave blank to use existing">
                </div>
                <button type="submit" class="submit-btn">Post Script</button>
            </form>
        `;
        adminContent.appendChild(section);

        document.getElementById('post-script-form').addEventListener('submit', handleScriptPost);
    }

    function handleScriptPost(e) {
        e.preventDefault();
        const name = document.getElementById('script-name').value;
        const newCategory = document.getElementById('new-category').value.trim();
        let selectedCategory = document.getElementById('script-category').value;
        
        if (newCategory) {
            let categories = JSON.parse(localStorage.getItem('script-categories')) || ['Lua/luau scripts', 'JS Bookmarklet scripts', 'Website projects'];
            if (!categories.includes(newCategory)) {
                categories.push(newCategory);
                localStorage.setItem('script-categories', JSON.stringify(categories));
            }
            selectedCategory = newCategory;
        }

        const scripts = JSON.parse(localStorage.getItem('posted-scripts')) || [];
        scripts.push({
            name: name,
            category: selectedCategory,
            date: new Date().toISOString()
        });
        localStorage.setItem('posted-scripts', JSON.stringify(scripts));
        
        alert('Script posted successfully!');
        e.target.reset();
        showPostScripts();
    }
});
