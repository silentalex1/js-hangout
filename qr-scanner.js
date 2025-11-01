document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const resultContainer = document.getElementById('qr-reader-results');

    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    }

    function onScanSuccess(decodedText, decodedResult) {
        const token = decodedText;
        const tokenRef = database.ref(`loginTokens/${token}`);

        tokenRef.get().then(snapshot => {
            if (snapshot.exists()) {
                tokenRef.set({
                    status: 'approved',
                    approvedBy: loggedInUser,
                    timestamp: new Date().toISOString()
                });
                resultContainer.innerHTML = `<span style="color: var(--success-color);">Success! Login Approved. You can now submit the passcode on the other device.</span>`;
                html5QrcodeScanner.clear();
            } else {
                resultContainer.innerHTML = `<span style="color: var(--danger-color);">Error: Invalid or Expired QR Code.</span>`;
            }
        });
    }

    function onScanFailure(error) {
        resultContainer.textContent = `Scanning...`;
    }

    let html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});
