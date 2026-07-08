// Khởi tạo bản đồ
const map = L.map('map').setView([21.0278, 105.8342], 13); // Hà Nội

// Tile layer giống Google Maps Light
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

let routeLayer;
let startMarker, endMarker;

// Hàm tìm đường đi
async function calculateRoute() {
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;

  if (!start || !end) {
    alert("Vui lòng nhập đầy đủ địa chỉ!");
    return;
  }

  try {
    // Geocoding với Nominatim
    const startResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(start)}`);
    const endResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(end)}`);

    const startData = await startResp.json();
    const endData = await endResp.json();

    if (!startData.length || !endData.length) {
      alert("Không tìm thấy địa chỉ!");
      return;
    }

    const startCoords = [parseFloat(startData[0].lat), parseFloat(startData[0].lon)];
    const endCoords = [parseFloat(endData[0].lat), parseFloat(endData[0].lon)];

    // Xóa tuyến đường cũ
    if (routeLayer) map.removeLayer(routeLayer);
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);

    // Marker start/end
    startMarker = L.marker(startCoords).addTo(map).bindPopup("Điểm xuất phát").openPopup();
    endMarker = L.marker(endCoords).addTo(map).bindPopup("Điểm đến").openPopup();

    // Lấy route từ OSRM
    const routeResp = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`);
    const routeData = await routeResp.json();

    const coords = routeData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    routeLayer = L.polyline(coords, {color: 'blue', weight: 5}).addTo(map);

    map.fitBounds(routeLayer.getBounds());

    // Hiển thị khoảng cách và thời gian
    const distance = (routeData.routes[0].distance / 1000).toFixed(2); // km
    const duration = (routeData.routes[0].duration / 60).toFixed(0); // phút
    alert(`Khoảng cách: ${distance} km\nThời gian dự kiến: ${duration} phút`);

  } catch (err) {
    console.error(err);
    alert("Có lỗi xảy ra khi tìm đường!");
  }
}

// Gán sự kiện nút
document.getElementById('routeBtn').addEventListener('click', calculateRoute);
