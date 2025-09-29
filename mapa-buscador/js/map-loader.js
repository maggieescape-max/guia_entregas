// Configuración y carga del mapa
class MapLoader {
    constructor() {
        this.map = null;
        this.baseMaps = {};
        this.polygons = null;
        this.init();
    }

    init() {
        this.map = L.map('map').setView([22.43, -97.89], 10);
        this.setupBaseMaps();
        this.loadGeoJSON();
    }

    setupBaseMaps() {
        this.baseMaps = {
            "osm": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }),
            "satelite": L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                subdomains: ['mt0','mt1','mt2','mt3'],
                attribution: '© Google'
            }),
            "hibrido": L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
                subdomains: ['mt0','mt1','mt2','mt3'],
                attribution: '© Google'
            })
        };
        this.baseMaps["osm"].addTo(this.map);
    }

    loadGeoJSON() {
        fetch('datos.geojson')
            .then(response => response.json())
            .then(data => {
                this.polygons = L.geoJSON(data, {
                    style: { 
                        color: 'blue', 
                        weight: 2,
                        fillColor: 'transparent',
                        fillOpacity: 0
                    },
                    onEachFeature: (feature, layer) => {
                        layer.bindPopup('CVE_CAT: ' + feature.properties.CVE_CAT);
                        this.addPolygonLabel(feature, layer);
                    }
                }).addTo(this.map);
                
                // Disparar evento cuando los polígonos estén cargados
                document.dispatchEvent(new CustomEvent('polygonsLoaded', { 
                    detail: { polygons: this.polygons } 
                }));
            })
            .catch(error => {
                console.error('Error cargando GeoJSON:', error);
                document.getElementById('result').innerHTML = "Error cargando datos";
            });
    }

    addPolygonLabel(feature, layer) {
        var center = layer.getBounds().getCenter();
        var label = L.marker(center, {
            icon: L.divIcon({
                className: 'polygon-label',
                html: feature.properties.CVE_CAT,
                iconSize: [100, 20]
            })
        }).addTo(this.map);
    }

    changeBaseMap(mapType) {
        Object.values(this.baseMaps).forEach(layer => this.map.removeLayer(layer));
        this.baseMaps[mapType].addTo(this.map);
    }

    getMap() { return this.map; }
    getPolygons() { return this.polygons; }
}