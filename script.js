document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const languageSelect = document.getElementById('languageSelect');
    const outputText = document.getElementById('outputText');
    const statusDiv = document.getElementById('status');
    
    let recognition;
    let isListening = false;
    
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        statusDiv.textContent = 'Status: Speech recognition not supported in this browser. Try Chrome or Edge.';
        statusDiv.className = 'alert alert-danger';
        startBtn.disabled = true;
        return;
    }
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = function() {
        isListening = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusDiv.textContent = 'Status: Listening... Speak now';
        statusDiv.className = 'alert alert-success listening';
    };
    
    recognition.onend = function() {
        if (isListening) {
            recognition.start(); // Restart recognition if still supposed to be listening
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusDiv.textContent = 'Status: Ready';
            statusDiv.className = 'alert alert-info';
        }
    };
    
    recognition.onerror = function(event) {
        isListening = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        statusDiv.textContent = 'Status: Error occurred - ' + event.error;
        statusDiv.className = 'alert alert-danger';
    };
    
    recognition.onresult = function(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Display both interim and final results
        outputText.value = finalTranscript + interimTranscript;
        
        // Auto-scroll to bottom
        outputText.scrollTop = outputText.scrollHeight;
    };
    
    // Start button click handler
    startBtn.addEventListener('click', function() {
        const selectedLanguage = languageSelect.value;
        recognition.lang = selectedLanguage;
        
        try {
            recognition.start();
        } catch (error) {
            statusDiv.textContent = 'Status: Error starting recognition - ' + error.message;
            statusDiv.className = 'alert alert-danger';
        }
    });
    
    // Stop button click handler
    stopBtn.addEventListener('click', function() {
        isListening = false;
        recognition.stop();
    });
    
    // Copy button click handler
    copyBtn.addEventListener('click', function() {
        outputText.select();
        document.execCommand('copy');
        
        // Show temporary feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    });
    
    // Clear button click handler
    clearBtn.addEventListener('click', function() {
        outputText.value = '';
    });
    
    // Download button click handler
    downloadBtn.addEventListener('click', function() {
        const text = outputText.value;
        if (!text.trim()) {
            statusDiv.textContent = 'Status: No text to download';
            statusDiv.className = 'alert alert-warning';
            return;
        }
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Get language name for filename
        const langName = languageSelect.options[languageSelect.selectedIndex].text.split(' ')[0];
        a.download = `speech-recognition-${langName.toLowerCase()}-${new Date().toISOString().slice(0,10)}.txt`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show temporary feedback
        statusDiv.textContent = 'Status: Text downloaded successfully';
        statusDiv.className = 'alert alert-success';
        setTimeout(() => {
            statusDiv.textContent = 'Status: Ready';
            statusDiv.className = 'alert alert-info';
        }, 3000);
    });
    
    // Language change handler
    languageSelect.addEventListener('change', function() {
        if (isListening) {
            recognition.stop();
            recognition.lang = this.value;
            recognition.start();
        }
    });
});