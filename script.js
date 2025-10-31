document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const chatContainer = document.getElementById('chatContainer');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerButton = document.getElementById('registerButton');
    const registerError = document.getElementById('registerError');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatLog = document.getElementById('chatLog');

    let isRegistered = localStorage.getItem('isRegistered') === 'true'; // Cek status pendaftaran

    // Fungsi untuk menampilkan/menyembunyikan elemen berdasarkan status pendaftaran
    function updateUI() {
        if (isRegistered) {
            registerForm.style.display = 'none';
            chatContainer.style.display = 'block';
        } else {
            registerForm.style.display = 'block';
            chatContainer.style.display = 'none';
        }
    }

    updateUI(); // Panggil saat halaman dimuat

    // Event listener untuk tombol daftar
    registerButton.addEventListener('click', function () {
        const emailOrPhone = registerEmailInput.value;

        // Validasi sederhana (Anda perlu validasi yang lebih baik di aplikasi produksi)
        if (emailOrPhone.trim() !== "") {
            isRegistered = true;
            localStorage.setItem('isRegistered', 'true');
            updateUI();
            registerError.textContent = ""; // Hapus pesan error
        } else {
            registerError.textContent = "Email atau nomor HP harus diisi.";
            isRegistered = false;
            updateUI(); // Pastikan chatContainer tersembunyi
        }
    });

    // Fungsi untuk menambahkan pesan ke chat log
    function addMessageToChat(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.textContent = message;
        chatLog.appendChild(messageDiv);

        // Scroll ke bawah untuk melihat pesan terbaru
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    // Event listener untuk tombol kirim
    sendButton.addEventListener('click', function () {
        if (!isRegistered) {
            alert("Anda harus mendaftar terlebih dahulu untuk menggunakan fitur ini.");
            return;
        }

        const message = messageInput.value;
        if (message.trim() !== '') {
            addMessageToChat(message, 'user'); // Tampilkan pesan pengguna

            // Panggil API AI
            getAiResponse(message)
                .then(aiAnswer => {
                    addMessageToChat(aiAnswer, 'bot'); // Tampilkan jawaban AI
                })
                .catch(error => {
                    console.error('Error:', error);
                    addMessageToChat('Terjadi kesalahan. Coba lagi nanti.', 'bot');
                });

            messageInput.value = ''; // Bersihkan input
        }
    });

    // Fungsi untuk memanggil API AI
    async function getAiResponse(text) {
        const apiUrl = `https://api.siputzx.my.id/api/ai/blackboxai?content=${encodeURIComponent(text)}`;

        try {
            const aiFetch = await fetch(apiUrl);

            if (!aiFetch.ok) {
                throw new Error(`HTTP error! Status: ${aiFetch.status}`);
            }

            const aiJson = await aiFetch.json();

            if (aiJson.error_message) { // Periksa jika ada pesan error
                if (aiJson.error_message.raw_url) {
                    throw new Error(`API Error: ${aiJson.error_message.file_error_message || aiJson.error_message} (Raw URL: ${aiJson.error_message.raw_url})`);
                } else {
                     throw new Error(`API Error: ${aiJson.error_message.file_error_message || aiJson.error_message}`);
                }

            }

            if (aiJson.data === undefined || aiJson.data === null) { // Pastikan data ada
                throw new Error('API Error: Jawaban AI kosong.');
            }

            return aiJson.data; // Ambil jawaban dari properti "data"
        } catch (error) {
            console.error('API Error:', error);
            throw new Error(`Gagal mengambil jawaban AI: ${error.message}`); // Lempar error untuk ditangani di fungsi utama
        }
    }
});
