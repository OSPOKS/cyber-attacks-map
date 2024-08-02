// frontend/script.js
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

const markers = L.markerClusterGroup();
let heatmapData = [];
const attackIcon = L.icon({
    iconUrl: 'path/to/icon.png', // Replace with your icon URL
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

async function fetchAttacks() {
    try {
        const response = await fetch('http://localhost:3000/api/attacks');
        const attacks = await response.json();

        markers.clearLayers();
        heatmapData = [];

        attacks.forEach(attack => {
            const marker = L.marker([attack.latitude, attack.longitude], { icon: attackIcon })
                .bindPopup(`<b>IP:</b> ${attack.ip}<br><b>Threat Count:</b> ${attack.threat_count}`);
            markers.addLayer(marker);

            heatmapData.push([attack.latitude, attack.longitude, attack.threat_count]);
        });

        map.addLayer(markers);
        updateHeatmap();
        updateChart();
    } catch (error) {
        console.error('Error fetching attacks:', error);
    }
}

function updateHeatmap() {
    if (map.hasLayer(heat)) {
        map.removeLayer(heat);
    }
    const heat = L.heatLayer(heatmapData, { radius: 25 }).addTo(map);
}

async function updateChart() {
    try {
        const response = await fetch('http://localhost:3000/api/attack-summary');
        const summary = await response.json();

        const ctx = document.getElementById('attackChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: summary.labels,
                datasets: [{
                    label: 'Number of Attacks',
                    data: summary.data,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
    }
}

document.getElementById('attackTypeFilter').addEventListener('change', function() {
    fetchAttacks();
});

fetchAttacks();
