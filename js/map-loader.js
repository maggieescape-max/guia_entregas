// Configuración y carga del mapa, version multicapa

class MapLoader {
    constructor() {
        this.map = null;
        this.baseMaps = {};
        this.polygons = null;
        this.equiposLayer = null; // NUEVA CAPA
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
        // Cargar AMBAS capas simultáneamente
        Promise.all([
            fetch('datos.geojson').then(r => r.json()),        // Capa búsqueda
            fetch('equipos.geojson').then(r => r.json())       // NUEVA: Capa equipos
        ]).then(([datosBusqueda, datosEquipos]) => {
            
            // CAPA 1: Polígonos de búsqueda (AZUL)
            this.polygons = L.geoJSON(datosBusqueda, {
                style: { 
                    color: 'blue', 
                    weight: 2,
                    fillColor: 'transparent',
                    fillOpacity: 0
                },
                onEachFeature: (feature, layer) => {
                    layer.bindPopup('CVE_CAT: ' + feature.properties.CVE_CAT);
                    this.addPolygonLabel(feature, layer, 'blue');
                }
            }).addTo(this.map);

            // CAPA 2: Áreas de equipos (ROSA FUCHSIA)
            this.equiposLayer = L.geoJSON(datosEquipos, {
                style: { 
                    color: '#ff00ff', // ROSA FUCHSIA
                    weight: 3,
                    fillColor: 'transparent',
                    fillOpacity: 0,
                    dashArray: '5, 5' // Líneas punteadas opcional
                },
                onEachFeature: (feature, layer) => {
                    // Etiqueta más grande para número de equipo
                    this.addTeamLabel(feature, layer);
                }
            }).addTo(this.map);

            // Notificar que ambas capas están listas
            document.dispatchEvent(new CustomEvent('polygonsLoaded', { 
                detail: { 
                    polygons: this.polygons,
                    equipos: this.equiposLayer 
                } 
            }));
        }).catch(error => {
            console.error('Error cargando GeoJSON:', error);
            document.getElementById('result').innerHTML = "Error cargando datos";
        });
    }

    // Etiqueta para equipos (MÁS GRANDE)
    addTeamLabel(feature, layer) {
        var center = layer.getBounds().getCenter();
        var teamNumber = feature.properties.numero_equipo || feature.properties.equipo || 'N/A';
        
        var label = L.marker(center, {
            icon: L.divIcon({
                className: 'team-label', // CLASE DIFERENTE
                html: `<div style="font-size: 16px; font-weight: bold; color: #ff00ff; text-shadow: 2px 2px 4px white;">${teamNumber}</div>`,
                iconSize: [40, 25]
            })
        }).addTo(this.map);
    }

    // Etiqueta original para polígonos de búsqueda
    addPolygonLabel(feature, layer, color = 'blue') {
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