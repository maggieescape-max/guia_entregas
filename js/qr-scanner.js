// Escáner QR inteligente - VERSIÓN CORREGIDA
class QRScanner {
    constructor() {
        this.stream = null;
        this.setupQR();
    }

    setupQR() {
        document.getElementById('qrButton').addEventListener('click', () => {
            this.iniciarQRScanner();
        });

        document.getElementById('cancelQR').addEventListener('click', () => {
            this.stopQRScanner();
        });
    }

    iniciarQRScanner() {
        document.getElementById('qrModal').style.display = 'flex';
        document.getElementById('qrButton').classList.add('scanning');
        document.getElementById('result').innerHTML = ""; // Limpiar mensajes anteriores
        
        const video = document.getElementById('qrVideo');
        
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
                this.stream = stream;
                video.srcObject = stream;
                video.play();
                this.scanQR();
            })
            .catch((err) => {
                document.getElementById('result').innerHTML = "❌ Error cámara: " + err.message;
                this.stopQRScanner();
            });
    }

    scanQR() {
        const video = document.getElementById('qrVideo');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                const cveCat = this.extraerCVE_CAT(code.data);
                if (cveCat) {
                    document.getElementById('searchInput').value = cveCat;
                    window.searchEngine.buscarPoligono(cveCat);
                    this.stopQRScanner();
                    // NO mostrar mensaje de éxito - el highlight rojo es suficiente
                } else {
                    document.getElementById('result').innerHTML = "❌ Formato QR no válido";
                    // Cerrar automáticamente después de 2 segundos
                    setTimeout(() => this.stopQRScanner(), 2000);
                }
            }
        }
        
        if (document.getElementById('qrModal').style.display === 'flex') {
            requestAnimationFrame(() => this.scanQR());
        }
    }

    extraerCVE_CAT(qrTexto) {
        const idMatch = qrTexto.match(/ID:\s*(\d+)/);
        
        if (idMatch && idMatch[1]) {
            const idCompleto = idMatch[1];
            const primeros9Digitos = idCompleto.substring(0, 9);
            
            if (primeros9Digitos.length === 9 && /^\d+$/.test(primeros9Digitos)) {
                return primeros9Digitos;
            }
        }
        return null;
    }

    stopQRScanner() {
        document.getElementById('qrModal').style.display = 'none';
        document.getElementById('qrButton').classList.remove('scanning');
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        // Limpiar mensajes de error después de cerrar
        setTimeout(() => {
            if (document.getElementById('result').innerHTML.includes("Error") || 
                document.getElementById('result').innerHTML.includes("no válido")) {
                document.getElementById('result').innerHTML = "";
            }
        }, 3000);
    }
}