// Motor de búsqueda de polígonos - VERSIÓN MEJORADA
class SearchEngine {
    constructor(polygons) {
        this.polygons = polygons;
        this.setupSearch();
    }

    setupSearch() {
        // Buscar al presionar ENTER
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.ejecutarBusqueda();
            }
        });
        
        // Buscar al hacer click en el botón
        document.getElementById('searchButton').addEventListener('click', () => {
            this.ejecutarBusqueda();
        });
    }

    ejecutarBusqueda() {
        const valor = document.getElementById('searchInput').value;
        const valorLimpio = valor.trim();
        
        // ELIMINAR la validación de vacío - buscar siempre que presionen el botón
        this.buscarPoligono(valorLimpio);
    }

    buscarPoligono(valorLimpio) {
        var found = false;
        
        console.log("Buscando CVE_CAT:", valorLimpio);
        
        // Si está vacío, simplemente no hace nada (no muestra error)
        if (valorLimpio === '') {
            document.getElementById('result').innerHTML = "";
            return false;
        }
        
        this.polygons.eachLayer((layer) => {
            layer.setStyle({color: 'blue', weight: 2});
            
            if (layer.feature.properties.cve_cat === valorLimpio) {
                console.log("✅ Polígono encontrado!");
                window.mapLoader.getMap().fitBounds(layer.getBounds(), { 
                    padding: [20, 20],
                    maxZoom: 17
                });
                layer.setStyle({
                    color: 'red', 
                    weight: 4,
                    fillColor: 'rgba(255,0,0,0.1)',
                    fillOpacity: 0.2
                });
                layer.openPopup();
                found = true;
                document.getElementById('result').innerHTML = "";
                
                // AUTOLIMPIEZA después de éxito
                setTimeout(() => {
                    document.getElementById('searchInput').value = "";
                }, 1000);
            }
        });
        
        if (!found && valorLimpio !== '') {
            console.log("❌ Polígono NO encontrado");
            document.getElementById('result').innerHTML = "✗ No se encontró '" + valorLimpio + "'";
            
            // NO limpiar input en error - usuario puede corregir
            setTimeout(() => {
                document.getElementById('result').innerHTML = "";
            }, 5000);
        }
        
        return found;
    }
}