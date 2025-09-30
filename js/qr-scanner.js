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

//____________________

    iniciarQRScanner() {
        // FIX iOS: Asegurar que el modal esté visible antes de la cámara
        const modal = document.getElementById('qrModal');
        modal.style.display = 'flex';
    
        // FIX iOS: Pequeño delay para que Safari renderice el modal
        setTimeout(() => {
            document.getElementById('qrButton').classList.add('scanning');
        
            const video = document.getElementById('qrVideo');
        
            // Configuración ESPECÍFICA para iOS
            const constraints = {
                video: { 
                    facingMode: "environment",
                    // Parámetros para mejor compatibilidad iOS
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                }
            };
        
            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    this.stream = stream;
                    video.srcObject = stream;
                
                    // FIX iOS: Esperar a que el video esté listo
                    video.onloadedmetadata = () => {
                        video.play().catch(e => {
                            console.error("Error reproduciendo video:", e);
                        });
                    };
                
                    this.scanQR();
                })
                .catch((err) => {
                    console.error("Error cámara iOS:", err);
                    document.getElementById('result').innerHTML = "❌ Error cámara: " + err.message;
                    this.stopQRScanner();
                });
        }, 100); // Pequeño delay para iOS
    }
//_______________

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
        console.log("🔴 Cerrando scanner QR - iOS fix");
    
        // 1. Ocultar modal inmediatamente
        const modal = document.getElementById('qrModal');
        modal.style.display = 'none';
    
        // 2. Limpiar el video AGGRESIVAMENTE para iOS
        const video = document.getElementById('qrVideo');
        if (video) {
            video.pause();
            video.srcObject = null;
            video.src = '';
            video.load();
        }
    
        // 3. Detener stream COMPLETAMENTE
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            this.stream = null;
        }
    
        // 4. FIX ESPECÍFICO PARA iOS - Reactivar la interfaz
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            // Forzar reinicio de la capa de composición
            document.body.style.webkitTransform = 'translateZ(0)';
            document.body.style.transform = 'translateZ(0)';
        
            // Trigger reflow múltiple
            void document.body.offsetWidth;
            void document.body.offsetHeight;
        
            // Timeout para asegurar que iOS procese los cambios
            setTimeout(() => {
                document.body.style.webkitTransform = '';
                document.body.style.transform = '';
                // Forzar redibujado del mapa
                if (window.mapLoader && window.mapLoader.getMap()) {
                    window.mapLoader.getMap().invalidateSize();
                }
            }, 100);
        }

//_______________
    
        document.getElementById('qrButton').classList.remove('scanning');
        document.getElementById('qrButton').textContent = "📷";
        console.log("✅ Scanner QR cerrado completamente");

//______________
        
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