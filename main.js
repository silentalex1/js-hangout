document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBtn = document.getElementById('admin-btn');
    const scriptsContainer = document.getElementById('scripts-container');
    const modal = document.getElementById('script-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCode = document.getElementById('modal-code');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    
    const loggedInUser = sessionStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    } 
    
    usernameDisplay.textContent = loggedInUser;

    if (loggedInUser === 'realalex') {
        adminBtn.classList.remove('hidden');
    }

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });

    adminBtn.addEventListener('click', () => {
        window.location.href = 'admin.html';
    });

    modalCloseBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    function loadScripts() {
        scriptsContainer.innerHTML = '';
        const categories = JSON.parse(localStorage.getItem('script-categories')) || ['lua/luau scripts', 'JS Bookmarklets', 'Website projects'];
        const scripts = JSON.parse(localStorage.getItem('posted-scripts')) || [];

        const mainCategoryContainer = document.createElement('div');
        mainCategoryContainer.className = 'category-main-container open';
        
        mainCategoryContainer.innerHTML = `
            <div class="category-header">
                <h2>Scripts</h2>
                <span class="category-toggle">▼</span>
            </div>
        `;
        
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'category-children';

        categories.forEach(category => {
            const categoryScripts = scripts.filter(s => s.category === category);
            if (categoryScripts.length > 0) {
                categoryScripts.forEach(script => {
                    const scriptCard = document.createElement('div');
                    scriptCard.className = 'script-card';
                    scriptCard.innerHTML = `
                        <h3>${script.name}</h3>
                        <p>${script.description}</p>
                        <div class="script-actions">
                            <button class="script-btn view-btn" data-script-id="${script.id}">View Script</button>
                            <button class="script-btn copy-btn" data-script-id="${script.id}">Copy Script</button>
                        </div>
                    `;
                    childrenContainer.appendChild(scriptCard);
                });
            }
        });
        
        mainCategoryContainer.appendChild(childrenContainer);
        scriptsContainer.appendChild(mainCategoryContainer);
        
        mainCategoryContainer.querySelector('.category-header').addEventListener('click', () => {
            mainCategoryContainer.classList.toggle('open');
        });

        attachScriptButtonListeners();
    }

    function attachScriptButtonListeners() {
        const scripts = JSON.parse(localStorage.getItem('posted-scripts')) || [];
        
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const scriptId = e.target.getAttribute('data-script-id');
                const scriptToCopy = scripts.find(s => s.id == scriptId);
                if (scriptToCopy) {
                    navigator.clipboard.writeText(scriptToCopy.code).then(() => {
                        e.target.textContent = 'Copied!';
                        setTimeout(() => { e.target.textContent = 'Copy Script'; }, 2000);
                    });
                }
            });
        });

        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const scriptId = e.target.getAttribute('data-script-id');
                const scriptToShow = scripts.find(s => s.id == scriptId);
                if (scriptToShow) {
                    modalTitle.textContent = scriptToShow.name;
                    modalCode.textContent = scriptToShow.code;
                    modal.classList.remove('hidden');
                }
            });
        });
    }

    loadScripts();
});
