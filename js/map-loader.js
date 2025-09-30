// map-loader.js - VERSIÓN COMPLETA Y CORREGIDA
class MapLoader {
    constructor() {
        this.map = null;
        this.baseMaps = {};
        this.polygons = null;
        this.equiposLayer = null;
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
        Promise.all([
            fetch('datos.geojson').then(r => r.json()),
            fetch('equipos.geojson').then(r => r.json())
        ]).then(([datosBusqueda, datosEquipos]) => {
            
            // CAPA 1: Polígonos de búsqueda (AZUL) - SIN ETIQUETAS
            this.polygons = L.geoJSON(datosBusqueda, {
                style: { 
                    color: 'blue', 
                    weight: 2,
                    fillColor: 'transparent',
                    fillOpacity: 0
                },
                onEachFeature: (feature, layer) => {
                    const clave = feature.properties.clavemnz || 'N/A';
                    layer.bindPopup('CVE_CAT: ' + clave);
                    // SIN etiquetas - más rápido y limpio
                }
            }).addTo(this.map);

            // CAPA 2: Áreas de equipos (ROSA) - SIN ETIQUETAS
            this.equiposLayer = L.geoJSON(datosEquipos, {
                style: { 
                    color: '#ff00ff',
                    weight: 3,
                    fillColor: 'transparent',
                    fillOpacity: 0
                },
                onEachFeature: (feature, layer) => {
                    const teamNumber = feature.properties.Name || feature.properties.name || 'N/A';
                    layer.bindPopup('Equipo: ' + teamNumber);
                    // SIN etiquetas - más rápido y limpio
                }
            }).addTo(this.map);

            // Notificar que las capas están listas
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

    changeBaseMap(mapType) {
        Object.values(this.baseMaps).forEach(layer => {
            this.map.removeLayer(layer);
        });
        this.baseMaps[mapType].addTo(this.map);
    }

    getMap() {
        return this.map;
    }

    getPolygons() {
        return this.polygons;
    }
}