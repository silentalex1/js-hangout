document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBtn = document.getElementById('admin-btn');
    const scriptsContainer = document.getElementById('scripts-container');
    
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

    function loadScripts() {
        const categories = JSON.parse(localStorage.getItem('script-categories')) || ['Lua/luau scripts', 'JS Bookmarklet scripts', 'Website projects'];
        const scripts = JSON.parse(localStorage.getItem('posted-scripts')) || [];

        scriptsContainer.innerHTML = '<h1>Scripts</h1>';

        categories.forEach(category => {
            const categoryScripts = scripts.filter(script => script.category === category);
            
            if(categoryScripts.length > 0) {
                const categorySection = document.createElement('div');
                categorySection.className = 'category-section';
                
                const categoryTitle = document.createElement('h2');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = `alex category > ${category}`;
                categorySection.appendChild(categoryTitle);

                categoryScripts.forEach(script => {
                    const scriptItem = document.createElement('div');
                    scriptItem.className = 'script-item';
                    scriptItem.innerHTML = `<h3>${script.name}</h3>`;
                    categorySection.appendChild(scriptItem);
                });

                scriptsContainer.appendChild(categorySection);
            }
        });
    }

    loadScripts();
});
