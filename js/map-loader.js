// Configuración y carga del mapa, version multicapa

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
        // Cargar AMBAS capas simultáneamente
        Promise.all([
            fetch('datos.geojson').then(r => {
                if (!r.ok) throw new Error(`Error datos.geojson: ${r.status}`);
                return r.json();
            }),
            fetch('equipos.geojson').then(r => {
                if (!r.ok) throw new Error(`Error equipos.geojson: ${r.status}`);
                return r.json();
            })
        ]).then(([datosBusqueda, datosEquipos]) => {
        
            console.log("Capa búsqueda cargada:", datosBusqueda);
            console.log("Capa equipos cargada:", datosEquipos);
        
            // FILTRAR FEATURES VÁLIDOS
            const datosBusquedaFiltrados = {
                ...datosBusqueda,
                features: datosBusqueda.features.filter(f => 
                    f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0
                )
            };
        
            const datosEquiposFiltrados = {
                ...datosEquipos,
                features: datosEquipos.features.filter(f => 
                    f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0
                )
            };
        
            console.log(`Features válidos - Búsqueda: ${datosBusquedaFiltrados.features.length}/${datosBusqueda.features.length}`);
            console.log(`Features válidos - Equipos: ${datosEquiposFiltrados.features.length}/${datosEquipos.features.length}`);

            // CAPA 1: Polígonos de búsqueda (AZUL)
            this.polygons = L.geoJSON(datosBusquedaFiltrados, {
                style: { 
                    color: 'blue', 
                    weight: 2,
                    fillColor: 'transparent',
                    fillOpacity: 0
                },
                onEachFeature: (feature, layer) => {
                    // IMPORTANTE: Usar 'cve_cat' en minúsculas
                    const clave = feature.properties.cve_cat || feature.properties.CVE_CAT || 'N/A';
                    layer.bindPopup('CVE_CAT: ' + clave);
                    this.addPolygonLabel(feature, layer, clave);
                }
            }).addTo(this.map);

            // CAPA 2: Áreas de equipos (ROSA FUCHSIA)
            this.equiposLayer = L.geoJSON(datosEquiposFiltrados, {
                style: { 
                    color: '#ff00ff',
                    weight: 3,
                    fillColor: 'transparent',
                    fillOpacity: 0
                },
                onEachFeature: (feature, layer) => {
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
            document.getElementById('result').innerHTML = "Error cargando datos: " + error.message;
        });
    }

    // Versión ultra-segura... Etiqueta para polígonos de búsqueda - CON VALIDACIÓN
    addPolygonLabel(feature, layer, texto) {
        try {
            // Doble validación por si las moscas
            if (!layer || !layer.getBounds) {
                console.warn("Layer inválido:", feature.properties);
                return;
            }
        
            const bounds = layer.getBounds();
            if (!bounds || !bounds.isValid()) {
                console.warn("Bounds inválidos:", feature.properties);
                return;
            }
        
            var center = bounds.getCenter();
            var label = L.marker(center, {
                icon: L.divIcon({
                    className: 'polygon-label',
                    html: texto,
                    iconSize: [100, 20]
                })
            }).addTo(this.map);
        
        } catch (error) {
            console.warn("Error creando etiqueta:", feature.properties, error);
        }
    }

    // Etiqueta para equipos - CON VALIDACIÓN
    addTeamLabel(feature, layer) {
        try {
            // VALIDAR que el polígono tenga bounds válidos
            if (!layer.getBounds || !layer.getBounds().isValid()) {
                console.warn("Polígono equipo sin geometría válida:", feature.properties);
                return;
            }
        
            var center = layer.getBounds().getCenter();
            // BUSCAR EN DIFERENTES CAMPOS POSIBLES (CORREGIDO EL TYPO)
            var teamNumber = feature.properties.Name || 
                            feature.properties.name || 
                            feature.properties.NUMERO || 
                            feature.properties.numero || 
                            feature.properties.equipo || 
                            'N/A';
        
            console.log("Etiqueta equipo - propiedades:", feature.properties);
        
            var label = L.marker(center, {
                icon: L.divIcon({
                    className: 'team-label',
                    html: `<div style="font-size: 16px; font-weight: bold; color: #ff00ff; text-shadow: 2px 2px 4px white;">${teamNumber}</div>`,
                    iconSize: [40, 25]
                })
            }).addTo(this.map);
        } catch (error) {
            console.warn("Error creando etiqueta de equipo:", feature.properties, error);
        }
    }

    changeBaseMap(mapType) {
        Object.values(this.baseMaps).forEach(layer => this.map.removeLayer(layer));
        this.baseMaps[mapType].addTo(this.map);
    }

    getMap() { return this.map; }
    getPolygons() { return this.polygons; }
}