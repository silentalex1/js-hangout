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

    let allUsers = JSON.parse(localStorage.getItem('alex-script-logins')) || [];
    let currentUserRole = 'user';
    let activeChannel = 'announcements';

    userPanelName.textContent = loggedInUser;
    userAvatar.textContent = loggedInUser.charAt(0).toUpperCase();

    database.ref(`users/${loggedInUser}/role`).get().then(snapshot => {
        if (snapshot.exists()) {
            currentUserRole = snapshot.val();
        }
        switchChannel(activeChannel);
        renderDms();
    });

    function listenForMessages() {
        const messagesRef = database.ref(`messages/${activeChannel}`);
        messagesContainer.innerHTML = '';
        let lastAuthor = null;

        messagesRef.off();
        messagesRef.on('child_added', snapshot => {
            const msg = snapshot.val();
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
                    <button class="delete-btn" data-id="${snapshot.key}">Delete</button>
                </div>` : ''}
            `;
            messagesContainer.appendChild(msgElement);
            lastAuthor = msg.author;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

        messagesRef.on('child_removed', snapshot => {
            const msgId = snapshot.key;
            const elementToRemove = document.querySelector(`.delete-btn[data-id="${msgId}"]`);
            if (elementToRemove) {
                elementToRemove.closest('.message').remove();
            }
        });
    }

    function checkPermissions() {
        const canPost = !(activeChannel === 'announcements' && (currentUserRole !== 'admin' && currentUserRole !== 'mod'));
        let channelDisplayName = activeChannel.startsWith('dm-') ? `@ ${activeChannel.replace('dm-', '').replace(loggedInUser, '').replace('-', '')}` : `# ${activeChannel}`;
        messageInput.placeholder = canPost ? `Message ${channelDisplayName}` : 'You cannot send messages here.';
        messageInput.disabled = !canPost;
    }

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content || messageInput.disabled) return;

        database.ref(`messages/${activeChannel}`).push({
            author: loggedInUser,
            content: content,
            timestamp: new Date().toISOString()
        });
        messageInput.value = '';
    });

    messagesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const msgId = e.target.dataset.id;
            database.ref(`messages/${activeChannel}/${msgId}`).remove();
        }
    });

    function switchChannel(channelId) {
        activeChannel = channelId;
        document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
        const activeEl = document.querySelector(`[data-channel-id="${channelId}"]`);
        if(activeEl) activeEl.classList.add('active');
        
        let name = `# ${channelId}`;
        if (name.startsWith('# dm-')) {
            const otherUser = name.replace('# dm-', '').replace(loggedInUser, '').replace('-', '');
            name = `@ ${otherUser}`;
        }
        channelNameHeader.textContent = name;
        listenForMessages();
        checkPermissions();
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
        
        database.ref(`dms/${loggedInUser}/${dmId}`).set(true);
        database.ref(`dms/${targetUser}/${dmId}`).set(true);

        switchChannel(dmId);
        dmModal.classList.add('hidden');
        dmUsernameInput.value = '';
    });
    
    function renderDms() {
        const dmsRef = database.ref(`dms/${loggedInUser}`);
        dmsRef.on('value', snapshot => {
            dmChannelsContainer.innerHTML = '';
            const dms = snapshot.val() || {};
            Object.keys(dms).forEach(dmId => {
                const otherUser = dmId.replace('dm-', '').replace(loggedInUser, '').replace('-', '');
                const dmEl = document.createElement('div');
                dmEl.className = 'channel-item';
                dmEl.dataset.channelId = dmId;
                dmEl.innerHTML = `
                    <div class="user-avatar" style="width:32px; height:32px; margin-right:10px;">${otherUser.charAt(0).toUpperCase()}</div>
                    <span>${otherUser}</span>`;
                dmChannelsContainer.appendChild(dmEl);
            });
        });
    }
});
