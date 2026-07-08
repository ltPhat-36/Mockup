const APP_ID = "23c4fcab07ec4ef29275900bfb3d816c"; // đổi bằng App ID của bạn
const API_URL = `https://openexchangerates.org/api/latest.json?app_id=${APP_ID}`;

let rates = null;

async function loadRates(){
  try{
    const res = await fetch(API_URL);
    if(!res.ok) throw new Error("Không lấy được tỉ giá. Kiểm tra App ID & mạng.");
    const data = await res.json();
    rates = data.rates; // object: { "USD":1, "EUR":0.9, ... }
    populateSelects(Object.keys(rates).sort());
  }catch(err){
    document.getElementById("result").textContent = "Lỗi: " + err.message;
  }
}

function populateSelects(currencyList){
  const from = document.getElementById("fromCur");
  const to = document.getElementById("toCur");
  currencyList.forEach(c => {
    const o1 = document.createElement("option"); o1.value = c; o1.text = c;
    const o2 = document.createElement("option"); o2.value = c; o2.text = c;
    from.appendChild(o1); to.appendChild(o2);
  });
  from.value = "USD"; to.value = "VND";
}

function convert(){
  if(!rates) return;
  const amount = parseFloat(document.getElementById("amount").value) || 0;
  const from = document.getElementById("fromCur").value;
  const to = document.getElementById("toCur").value;
  if(!(rates[from] && rates[to])){
    document.getElementById("result").textContent = "Currency not supported.";
    return;
  }
  const result = amount * (rates[to] / rates[from]);
  document.getElementById("result").textContent = `${amount} ${from} = ${result.toFixed(4)} ${to}`;
}

document.getElementById("convertBtn").addEventListener("click", convert);
window.addEventListener("DOMContentLoaded", loadRates);
