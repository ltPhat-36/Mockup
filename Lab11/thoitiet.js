// Thay bằng API key của bạn
const OWM_KEY = "a74ce76593384338c16d6df560704170";
// KHÔNG cần cors-anywhere
const PROVINCE_API = "https://provinces.open-api.vn/api/p/";
// Một số mapping quan trọng (bổ sung nếu cần)
const nameMapping = {
  "Thành phố Hồ Chí Minh": "Ho Chi Minh City",
  "Hà Nội": "Hanoi",
  "Đà Nẵng": "Da Nang",
  "Thừa Thiên Huế": "Hue",
  "Khánh Hòa": "Nha Trang",
  "Bà Rịa - Vũng Tàu": "Vung Tau",
  "Cần Thơ": "Can Tho",
  "Bắc Ninh": "Bac Ninh",
  // Bạn có thể thêm vào mapping cho các tỉnh còn lại
};

let provinceData = [];

/* ---------- Utils ---------- */
function removeDiacritics(str) {
  if (!str) return str;
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function log(msg) {
  console.log(msg);
  const el = document.getElementById("log");
  el.textContent = (el.textContent === "—" ? "" : el.textContent + "\n") + msg;
}

/* ---------- Load provinces ---------- */
async function loadProvinces(){
  const sel = document.getElementById("provinceSelect");
  sel.innerHTML = "<option>Loading...</option>";
  try{
    const res = await fetch(PROVINCE_API);
    const data = await res.json();
    provinceData = data;
    sel.innerHTML = "";
    data.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.name; // dùng name để truy vấn geocoding
      opt.text = p.name;
      sel.appendChild(opt);
    });
    log("Loaded provinces from provinces.open-api.vn (" + data.length + " items).");
  }catch(err){
    sel.innerHTML = "<option>Error loading</option>";
    console.error(err);
    log("Lỗi khi load provinces: " + err.message);
  }
}

/* ---------- Geocoding attempts ---------- */
async function tryOpenWeatherGeocode(query) {
  // query: plain place string (ví dụ "Ho Chi Minh City" hoặc "Thanh Hoa")
  const q = `${query},VN`;
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${OWM_KEY}`;
  log(`Thử OWM geocode: ${q}`);
  try {
    const r = await fetch(url);
    if (!r.ok) {
      log(`OWM geocode HTTP lỗi: ${r.status} ${r.statusText}`);
      return null;
    }
    const arr = await r.json();
    if (arr && arr.length > 0) {
      log(`OWM trả về: ${arr[0].name} (${arr[0].lat},${arr[0].lon})`);
      return { lat: arr[0].lat, lon: arr[0].lon, source: "openweathermap", name: arr[0].name };
    } else {
      log("OWM không tìm thấy kết quả cho: " + q);
      return null;
    }
  } catch (e) {
    log("Lỗi fetch OWM geocode: " + e.message);
    return null;
  }
}

async function tryNominatim(query) {
  // Nominatim (OpenStreetMap) fallback
  const q = `${query}, Vietnam`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=vi`;
  log(`Thử Nominatim: ${q}`);
  try {
    const r = await fetch(url, { headers: { "Referer": location.origin } }); // browser will add origin header anyway
    if (!r.ok) {
      log(`Nominatim HTTP lỗi: ${r.status} ${r.statusText}`);
      return null;
    }
    const arr = await r.json();
    if (arr && arr.length > 0) {
      log(`Nominatim trả về: ${arr[0].display_name} (${arr[0].lat},${arr[0].lon})`);
      return { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon), source: "nominatim", name: arr[0].display_name };
    } else {
      log("Nominatim không tìm thấy kết quả cho: " + q);
      return null;
    }
  } catch (e) {
    log("Lỗi fetch Nominatim: " + e.message);
    return null;
  }
}

/* ---------- Main: tìm toạ độ với nhiều fallback ---------- */
async function findCoordinatesForProvince(provinceName) {
  // Tạo tập hợp biến thể tên để thử
  const variants = new Set();

  // 1. mapping chính xác (tiếng Anh nếu có)
  if (nameMapping[provinceName]) variants.add(nameMapping[provinceName]);

  // 2. chính tên tiếng Việt (nguyên gốc)
  variants.add(provinceName);

  // 3. bỏ dấu
  variants.add(removeDiacritics(provinceName));

  // 4. bỏ tiền tố (Thành phố/Tỉnh/Thị xã/Quận/Huyện)
  const short = provinceName.replace(/^(Thành phố|Tỉnh|Thị xã|Quận|Huyện)\s*/i, "");
  if (short !== provinceName) {
    variants.add(short);
    variants.add(removeDiacritics(short));
  }

  // 5. thêm hậu tố City/Province (thử thêm nếu short ngắn)
  variants.add(short + " City");
  variants.add(short + " Province");

  // Chuẩn hóa & xoá giá trị trống
  const finalVariants = Array.from(variants).map(v => (v || "").trim()).filter(Boolean);

  log("Chuẩn bị thử các biến thể: " + finalVariants.join(" | "));

  // 1) Thử OpenWeatherMap với từng biến thể
  for (const v of finalVariants) {
    const res = await tryOpenWeatherGeocode(v);
    if (res) return res;
    // nếu OWM bị rate limit hoặc trả lỗi, hàm tryOpenWeatherGeocode đã log
  }

  // 2) Nếu OWM fail hết, thử Nominatim (dùng tên tiếng Việt + tiếng Anh)
  const nominatimCandidates = [provinceName, removeDiacritics(provinceName), nameMapping[provinceName], short]
    .filter(Boolean).map(s => s.trim());
  for (const v of nominatimCandidates) {
    const res = await tryNominatim(v);
    if (res) return res;
  }

  // 3) Nếu vẫn không có -> null
  return null;
}

/* ---------- Get weather ---------- */
async function getWeather(){
  document.getElementById("log").textContent = "—";
  document.getElementById("weather").innerHTML = "Đang lấy dữ liệu...";
  const provinceName = document.getElementById("provinceSelect").value;
  if(!provinceName) {
    alert("Chọn tỉnh.");
    return;
  }

  try {
    const coord = await findCoordinatesForProvince(provinceName);
    if (!coord) {
      document.getElementById("weather").textContent = `❌ Không tìm thấy vị trí/tọa độ cho: ${provinceName}. Xem log để biết chi tiết.`;
      return;
    }

    log(`Sử dụng toạ độ từ ${coord.source}: ${coord.lat},${coord.lon}`);

    // Lấy weather từ OpenWeatherMap (units=metric, lang=vi)
    const wUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coord.lat}&lon=${coord.lon}&units=metric&appid=${OWM_KEY}&lang=vi`;
    log("Gọi OWM weather: " + wUrl);
    const wres = await fetch(wUrl);
    if (!wres.ok) {
      const t = await wres.text();
      log("OWM weather HTTP lỗi: " + wres.status + " " + wres.statusText + " | body: " + t);
      document.getElementById("weather").textContent = `Lỗi khi lấy API thời tiết: ${wres.status}`;
      return;
    }
    const wjson = await wres.json();
    showWeather(wjson, provinceName);
  } catch (err) {
    console.error(err);
    log("Lỗi chung: " + err.message);
    document.getElementById("weather").textContent = "⚠️ Lỗi khi lấy dữ liệu thời tiết (xem console/log).";
  }
}
function showWeather(data, name){
  const el = document.getElementById("weather");
  if(data.cod && data.cod !== 200){
    el.textContent = "Lỗi API: " + (data.message || data.cod);
    return;
  }

  const desc = data.weather && data.weather[0] ? data.weather[0].description : "";
  const icon = data.weather && data.weather[0] ? data.weather[0].icon : null;
  const temp = data.main ? data.main.temp : "";
  const hum = data.main ? data.main.humidity : "";
  const wind = data.wind ? data.wind.speed : "";

  let tempClass = "temp-warm";
  if(temp < 20) tempClass = "temp-cold";
  else if(temp > 30) tempClass = "temp-hot";

  el.innerHTML = `
    <div class="weather-card ${tempClass}">
      ${icon ? `<img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">` : ""}
      <div class="weather-info">
        <h3>${name}</h3>
        <p><strong>Mô tả:</strong> ${desc}</p>
        <p><strong>Nhiệt độ:</strong> ${temp} °C</p>
        <p><strong>Độ ẩm:</strong> ${hum}%</p>
        <p><strong>Gió:</strong> ${wind} m/s</p>
      </div>
    </div>
  `;
}


function showWeather(data, name){
  const el = document.getElementById("weather");
  if(data.cod && data.cod !== 200){
    el.textContent = "Lỗi API: " + (data.message || data.cod);
    return;
  }
  const desc = data.weather && data.weather[0] ? data.weather[0].description : "";
  const icon = data.weather && data.weather[0] ? data.weather[0].icon : null;
  const temp = data.main ? data.main.temp : "";
  const hum = data.main ? data.main.humidity : "";
  const wind = data.wind ? data.wind.speed : "";
  
  el.innerHTML = `<h3>Thời tiết: ${name}</h3>
    ${icon ? `<img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">` : ""}
    <p><strong>Mô tả:</strong> ${desc}</p>
    <p><strong>Nhiệt độ:</strong> ${temp} °C</p>
    <p><strong>Độ ẩm:</strong> ${hum}%</p>
    <p><strong>Gió:</strong> ${wind} m/s</p>`;
}

/* ---------- Khởi tạo ---------- */
document.getElementById("getWeather").addEventListener("click", getWeather);
window.addEventListener("DOMContentLoaded", loadProvinces);
