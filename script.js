// 1. CONEXIÓN A SUPABASE (Tus llaves reales)
const SB_URL = "https://eqvkmhimaxgnicokhpdl.supabase.co"; 
const SB_KEY = "sb_publishable_hes3PXFexmXL5kvljFwUsA_Itz18lP2"; 
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// 2. INICIALIZAR EL MAPA (Centrado en la UPEA El Alto)
const mapa = L.map("mapa").setView([-16.4918, -68.1937], 15);

// Capa de OpenStreetMap
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors"
}).addTo(mapa);

// Marcador inicial de la UPEA
L.marker([-16.4918, -68.1937]).addTo(mapa).bindPopup("UPEA - Sistemas").openPopup();

let puntosParaBD = []; // Para Supabase
let puntosParaPDF = []; // Para el PDF

// 3. CAPTURAR CLIC EN EL MAPA
mapa.on("click", function(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  // Dibujar marcador
  L.marker([lat, lng])
    .addTo(mapa)
    .bindPopup(`Lat: ${lat.toFixed(6)}<br>Lon: ${lng.toFixed(6)}`)
    .openPopup();

  // Guardar datos (asegúrate que las columnas en Supabase se llamen latitud y longitud)
  puntosParaBD.push({ latitud: lat, longitud: lng });
  puntosParaPDF.push({ lat, lng });

  // Mostrar en la lista visual (Punto A del lab)
  const lista = document.getElementById("lista-coordenadas");
  const li = document.createElement("li");
  li.textContent = `Punto: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  lista.appendChild(li);
});

// 4. GUARDAR EN SUPABASE (Punto B del lab)
document.getElementById("btnGuardar").onclick = async function() {
    if (puntosParaBD.length === 0) return alert("Captura puntos primero");

    const { error } = await _supabase.from('coordenadas').insert(puntosParaBD);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("¡Éxito! Guardado en la base de datos PostgreSQL.");
        puntosParaBD = []; // Limpiar después de guardar
    }
};

// 5. GENERAR PDF (Punto C del lab)
document.getElementById("btnPdf").onclick = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("UNIVERSIDAD PÚBLICA DE EL ALTO - SIG 747", 10, 10);
    doc.text("Reporte de Coordenadas Capturadas", 10, 20);
    
    doc.setFontSize(12);
    puntosParaPDF.forEach((p, i) => {
        doc.text(`${i+1}. Lat: ${p.lat.toFixed(6)} | Lon: ${p.lng.toFixed(6)}`, 10, 40 + (i * 10));
    });
    
    doc.save("reporte-upea.pdf");
};