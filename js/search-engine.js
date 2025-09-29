// Motor de búsqueda de polígonos
class SearchEngine {
    constructor(polygons) {
        this.polygons = polygons;
        this.setupSearch();
    }

    setupSearch() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.buscarPoligono(e.target.value);
        });
    }

    buscarPoligono(valor) {
        var found = false;
        var valorLimpio = valor.trim();
        
        console.log("Buscando CVE_CAT:", valorLimpio);
        
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
            }
        });
        
        if (!found && valorLimpio !== '') {
            console.log("❌ Polígono NO encontrado");
            document.getElementById('result').innerHTML = "✗ No se encontró '" + valorLimpio + "'";
        } else if (valorLimpio === '') {
            document.getElementById('result').innerHTML = "";
        }
        
        return found;
    }
}