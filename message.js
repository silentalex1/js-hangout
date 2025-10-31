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

    let allUsers = JSON.parse(localStorage.getItem('alex-script-users')) || [];
    let currentUser = allUsers.find(u => u.username === loggedInUser);
    let activeChannel = '#announcements';

    function renderMessages() {
        messagesContainer.innerHTML = '';
        const allMessages = JSON.parse(localStorage.getItem('alex-script-messages')) || [];
        const channelMessages = allMessages.filter(msg => msg.channel === activeChannel);

        channelMessages.forEach(msg => {
            const msgElement = document.createElement('div');
            msgElement.classList.add('message');
            msgElement.innerHTML = `
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${msg.author}</span>
                        <span class="message-timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                        ${msg.author === loggedInUser ? `
                        <div class="message-actions">
                            <button class="edit-btn" data-id="${msg.id}">Edit</button>
                            <button class="delete-btn" data-id="${msg.id}">Delete</button>
                        </div>` : ''}
                    </div>
                    <div class="message-body">${msg.content}</div>
                </div>
            `;
            messagesContainer.appendChild(msgElement);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        checkPermissions();
    }

    function checkPermissions() {
        if (activeChannel === '#announcements' && (!currentUser.role || (currentUser.role !== 'admin' && currentUser.role !== 'mod'))) {
            messageInput.placeholder = 'You cannot send messages in this channel.';
            messageInput.disabled = true;
        } else {
            messageInput.placeholder = 'Type a message...';
            messageInput.disabled = false;
        }
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
        const allMessages = JSON.parse(localStorage.getItem('alex-script-messages')) || [];
        if (e.target.classList.contains('delete-btn')) {
            const msgId = Number(e.target.dataset.id);
            const updatedMessages = allMessages.filter(msg => msg.id !== msgId);
            localStorage.setItem('alex-script-messages', JSON.stringify(updatedMessages));
            renderMessages();
        }
    });

    function switchChannel(channelId) {
        activeChannel = channelId;
        document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-channel-id="${channelId}"]`).classList.add('active');
        channelNameHeader.textContent = channelId.startsWith('dm-') ? `DM with ${channelId.replace('dm-', '').replace(loggedInUser, '').replace('-', '')}` : channelId;
        renderMessages();
    }

    channelsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('channel-item')) {
            switchChannel(e.target.dataset.channelId);
        }
    });

    dmChannelsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('channel-item')) {
            switchChannel(e.target.dataset.channelId);
        }
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
                dmEl.textContent = `@ ${otherUser}`;
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
