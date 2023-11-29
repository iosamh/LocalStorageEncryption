document.addEventListener('DOMContentLoaded', function() {

    var fileInput = document.getElementById('fileInput');
    var fileDisplayArea = document.getElementById('fileDisplay');
    var keyInput = document.getElementById('keyInput');
    var downloadButton = document.getElementById('downloadFile');
    var dropArea = document.getElementById('fileDragArea');


    fileInput.addEventListener('change', function(event) {
        var file = event.target.files[0];
        fileDisplayArea.textContent = file ? file.name : "No file chosen";
    });

    downloadButton.addEventListener('click', function() {
        var file = fileInput.files[0];
        var key = keyInput.value;
        var action = document.querySelector('input[name="encrypt-decrypt"]:checked').value;

        if (!file) {
            alert('Please select a file first.');
            return;
        }

        if (!key) {
            alert('Please enter an encryption key.');
            return;
        }

        if (action === 'encrypt') {
            encryptFile(file, key);
        } else {
            decryptFile(file, key);
        }
    });

    // drag and drop
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropArea.classList.add('drag-over');
    });

    dropArea.addEventListener('dragleave', function(e) {
        dropArea.classList.remove('drag-over');
    });

    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        fileInput.files = e.dataTransfer.files;
        var filename = fileInput.files[0].name;
        fileDisplayArea.textContent = filename;
        dropArea.classList.remove('drag-over');
    });


    // read file as DataURL
    function getFileData(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            callback(e.target.result);
        };
        reader.onerror = function(e) {
            alert('File reading failed: ' + e.target.error.message);
        };
        reader.readAsDataURL(file);
    }

    
    function encryptFile(file, key) {
        getFileData(file, function(dataURL) {
            try {
                const base64Content = dataURL.split(',')[1]; // Extract Base64 content
                const encrypted = CryptoJS.AES.encrypt(base64Content, key).toString();
                const encryptedBlob = base64ToBlob(encrypted, 'application/octet-stream');
                createDownloadLink(encryptedBlob, file.name + '.encrypted');
            } catch (error) {
                console.error('Encryption failed', error);
                alert('Encryption failed: ' + error.message);
            }
        });
    }
    
    
    function decryptFile(file, key) {
        getFileData(file, function(dataURL) {
            try {
                var base64Content = dataURL.split(',')[1]; // Extract Base64 encrypted data
                const decryptedData = CryptoJS.AES.decrypt(base64Content, key).toString(CryptoJS.enc.Utf8);
                if (!decryptedData) throw new Error('Failed to decrypt or incorrect key');
                const decryptedBlob = base64ToBlob(decryptedData, 'application/octet-stream');
                createDownloadLink(decryptedBlob, file.name.replace('.encrypted', ''));
            } catch (error) {
                console.error('Decryption failed', error);
                alert('The key or password is wrong');
            }
        });
    }
    

    // Function to convert Base64 string to Blob
    function base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, {type: mimeType});
    }

    // Function to create a download link and start the download
    function createDownloadLink(blob, filename) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
    }
    
    
});
