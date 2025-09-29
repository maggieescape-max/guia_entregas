// Gestor de GPS y ubicación
class GPSTracker {
    constructor() {
        this.marker = null;
        this.setupGPS();
    }

    setupGPS() {
        document.getElementById('gpsButton').addEventListener('click', () => {
            this.locateUser();
        });

        window.mapLoader.getMap().on('locationfound', (e) => {
            this.onLocationFound(e);
        });

        window.mapLoader.getMap().on('locationerror', (e) => {
            this.onLocationError(e);
        });
    }

    locateUser() {
        const button = document.getElementById('gpsButton');
        button.textContent = "🔄";
        button.classList.add('locating');
        
        window.mapLoader.getMap().lococate({ 
            setView: true, 
            maxZoom: 16,
            timeout: 10000 
        });
    }

    onLocationFound(e) {
        document.getElementById('gpsButton').textContent = "📍";
        document.getElementById('gpsButton').classList.remove('locating');
        
        if (this.marker) {
            window.mapLoader.getMap().removeLayer(this.marker);
        }
        
        this.marker = L.marker(e.latlng)
            .addTo(window.mapLoader.getMap())
            .bindPopup("📍 Estás aquí")
            .openPopup();
    }

    onLocationError(e) {
        document.getElementById('gpsButton').textContent = "📍";
        document.getElementById('gpsButton').classList.remove('locating');
        document.getElementById('result').innerHTML = "❌ Error de GPS";
    }
}