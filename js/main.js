// Archivo principal que orquesta todo
class MainApp {
    constructor() {
        this.init();
    }

    init() {
        // 1. Cargar mapa y datos
        window.mapLoader = new MapLoader();
        
        // 2. Esperar a que los polígonos estén cargados
        document.addEventListener('polygonsLoaded', (e) => {
            const polygons = e.detail.polygons;
            
            // 3. Inicializar componentes
            window.searchEngine = new SearchEngine(polygons);
            new GPSTracker();
            new QRScanner();
            
            // 4. Configurar selector de mapas
            this.setupMapSelector();
        });
    }

    setupMapSelector() {
        document.getElementById('mapSelector').addEventListener('change', (e) => {
            window.mapLoader.changeBaseMap(e.target.value);
        });
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MainApp();
});