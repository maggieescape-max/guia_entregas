// Motor de búsqueda de polígonos - VERSIÓN MEJORADA
class SearchEngine {
    constructor(polygons) {
        this.polygons = polygons;
        this.setupSearch();
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
    
        // LIMITAR a 9 caracteres + feedback
        searchInput.addEventListener('input', (e) => {
            if (e.target.value.length > 9) {
                e.target.value = e.target.value.slice(0, 9);
                // Feedback visual opcional
                document.getElementById('result').innerHTML = "Máximo 9 dígitos";
                setTimeout(() => document.getElementById('result').innerHTML = "", 2000);
            }
        
            // Mostrar contador (opcional)
            const counter = e.target.value.length;
            if (counter === 9) {
                searchInput.style.borderColor = "#28a745"; // Verde cuando está completo
            } else {
                searchInput.style.borderColor = "#ddd"; // Gris normal
            }
        });
    
        // BUSCAR al presionar ENTER
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.ejecutarBusqueda();
            }
        });
    
        // BUSCAR al hacer click en el botón
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
            
            if (layer.feature.properties.clavemnz === valorLimpio) {
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