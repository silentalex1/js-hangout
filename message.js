document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    }

    const messagesContainer = document.getElementById('messages-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const channelNameHeader = document.getElementById('current-channel-name');
    const channelsList = document.querySelector('.channels-list');
    const dmChannelsContainer = document.getElementById('dm-channels-container');
    const newDmBtn = document.getElementById('new-dm-btn');
    const dmModal = document.getElementById('dm-modal');
    const dmForm = document.getElementById('dm-form');
    const dmUsernameInput = document.getElementById('dm-username-input');
    const userPanelName = document.getElementById('user-panel-name');
    const userAvatar = document.getElementById('user-avatar');

    let allUsers = JSON.parse(localStorage.getItem('alex-script-users')) || [];
    let currentUser = allUsers.find(u => u.username === loggedInUser);
    let activeChannel = '#announcements';

    userPanelName.textContent = loggedInUser;
    userAvatar.textContent = loggedInUser.charAt(0).toUpperCase();

    function renderMessages() {
        messagesContainer.innerHTML = '';
        const allMessages = JSON.parse(localStorage.getItem('alex-script-messages')) || [];
        const channelMessages = allMessages.filter(msg => msg.channel === activeChannel);
        let lastAuthor = null;

        channelMessages.forEach(msg => {
            const isGrouped = msg.author === lastAuthor;
            const msgElement = document.createElement('div');
            msgElement.classList.add('message');
            if (isGrouped) msgElement.classList.add('is-grouped');

            msgElement.innerHTML = `
                <div class="avatar">${isGrouped ? '' : msg.author.charAt(0).toUpperCase()}</div>
                <div class="message-content">
                    ${!isGrouped ? `
                    <div class="message-header">
                        <span class="message-author">${msg.author}</span>
                        <span class="message-timestamp">${new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>` : ''}
                    <div class="message-body">${msg.content}</div>
                </div>
                ${msg.author === loggedInUser ? `
                <div class="message-actions">
                    <button class="delete-btn" data-id="${msg.id}">Delete</button>
                </div>` : ''}
            `;
            messagesContainer.appendChild(msgElement);
            lastAuthor = msg.author;
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        checkPermissions();
    }

    // All other functions (checkPermissions, messageForm submit, etc.) remain the same
    // from the previous version, as their logic is still correct. I have included them
    // here for completeness.

    function checkPermissions() {
        const canPost = !(activeChannel === '#announcements' && (!currentUser.role || (currentUser.role !== 'admin' && currentUser.role !== 'mod')));
        messageInput.placeholder = canPost ? `Message ${channelNameHeader.textContent}` : 'You cannot send messages here.';
        messageInput.disabled = !canPost;
    }

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content || messageInput.disabled) return;

        let allMessages = JSON.parse(localStorage.getItem('alex-script-messages')) || [];
        allMessages.push({
            id: Date.now(),
            channel: activeChannel,
            author: loggedInUser,
            content: content,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('alex-script-messages', JSON.stringify(allMessages));
        messageInput.value = '';
        renderMessages();
    });

    messagesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const allMessages = JSON.parse(localStorage.getItem('alex-script-messages')) || [];
            const msgId = Number(e.target.dataset.id);
            const updatedMessages = allMessages.filter(msg => msg.id !== msgId);
            localStorage.setItem('alex-script-messages', JSON.stringify(updatedMessages));
            renderMessages();
        }
    });

    function switchChannel(channelId) {
        activeChannel = channelId;
        document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
        const activeEl = document.querySelector(`[data-channel-id="${channelId}"]`);
        if(activeEl) activeEl.classList.add('active');
        
        let name = channelId;
        if (name.startsWith('dm-')) {
            const otherUser = name.replace('dm-', '').replace(loggedInUser, '').replace('-', '');
            name = `@ ${otherUser}`;
        }
        channelNameHeader.textContent = name;
        renderMessages();
    }

    channelsList.addEventListener('click', (e) => {
        const channel = e.target.closest('.channel-item');
        if (channel) switchChannel(channel.dataset.channelId);
    });

    dmChannelsContainer.addEventListener('click', (e) => {
        const channel = e.target.closest('.channel-item');
        if (channel) switchChannel(channel.dataset.channelId);
    });
    
    newDmBtn.addEventListener('click', () => dmModal.classList.remove('hidden'));
    dmModal.querySelector('.modal-close-btn').addEventListener('click', () => dmModal.classList.add('hidden'));

    dmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = dmUsernameInput.value.trim();
        const match = input.match(/^<@(.+)>$/);
        if (!match) { alert('Invalid format. Use <@username>'); return; }
        const targetUser = match[1];

        const userExists = allUsers.some(u => u.username === targetUser);
        if (!userExists) { alert('User not found.'); return; }
        if(targetUser === loggedInUser) { alert("You can't DM yourself."); return; }

        const participants = [loggedInUser, targetUser].sort();
        const dmId = `dm-${participants.join('-')}`;
        
        let dms = JSON.parse(localStorage.getItem('alex-script-dms')) || [];
        if (!dms.some(dm => dm.id === dmId)) {
            dms.push({ id: dmId, participants });
            localStorage.setItem('alex-script-dms', JSON.stringify(dms));
        }

        renderDms();
        switchChannel(dmId);
        dmModal.classList.add('hidden');
        dmUsernameInput.value = '';
    });
    
    function renderDms() {
        dmChannelsContainer.innerHTML = '';
        const dms = JSON.parse(localStorage.getItem('alex-script-dms')) || [];
        dms.forEach(dm => {
            if (dm.participants.includes(loggedInUser)) {
                const otherUser = dm.participants.find(p => p !== loggedInUser);
                const dmEl = document.createElement('div');
                dmEl.className = 'channel-item';
                dmEl.dataset.channelId = dm.id;
                dmEl.innerHTML = `
                    <div class="user-avatar" style="width:32px; height:32px; margin-right:10px;">${otherUser.charAt(0).toUpperCase()}</div>
                    <span>${otherUser}</span>`;
                dmChannelsContainer.appendChild(dmEl);
            }
        });
    }

    window.addEventListener('storage', (event) => {
        if (event.key === 'alex-script-messages' || event.key === 'alex-script-dms') {
            renderMessages();
            renderDms();
        }
    });

    renderDms();
    renderMessages();
});
