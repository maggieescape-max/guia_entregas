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
        this.buscarPoligono(valor);
    }

    buscarPoligono(valor) {
        var found = false;
        var valorLimpio = valor.trim();
        
        if (valorLimpio === '') {
            document.getElementById('result').innerHTML = "⚠️ Ingresa Clave";
            setTimeout(() => {
                if (document.getElementById('result').innerHTML === "⚠️ Ingresa Clave") {
                    document.getElementById('result').innerHTML = "";
                }
            }, 3000);
            return false;
        }
        
        console.log("Buscando Clave", valorLimpio);
        
        this.polygons.eachLayer((layer) => {
            layer.setStyle({color: 'blue', weight: 2});
            
            if (layer.feature.properties.CVE_CAT === valorLimpio) {
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
                
                // AUTOLIMPIEZA INTELIGENTE: solo después de éxito, con delay
                setTimeout(() => {
                    document.getElementById('searchInput').value = "";
                    document.getElementById('searchInput').focus(); // Opcional: mantener foco
                }, 1000); // 1 segundo después del éxito
            }
        });
        
        if (!found) {
            console.log("❌ Polígono NO encontrado");
            document.getElementById('result').innerHTML = "✗ No se encontró '" + valorLimpio + "'";
            
            // NO limpiar el input en error - el usuario puede corregir
            setTimeout(() => {
                if (document.getElementById('result').innerHTML.includes("No se encontró")) {
                    document.getElementById('result').innerHTML = "";
                }
            }, 5000);
        }
        
        return found;
    }
}