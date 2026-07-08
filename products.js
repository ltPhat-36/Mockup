const API_BASE = "http://localhost:8080/api2025";

const productList = document.getElementById("productList");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

// 1) Kiểm tra đăng nhập & quyền (KHÔNG bắt buộc token)
let currentUser = null;
try { currentUser = JSON.parse(localStorage.getItem("currentUser")); } catch (_) {}

if (!currentUser) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "index.html";
} else if (currentUser.role !== "CUSTOMER") {
    alert("Bạn không có quyền truy cập!");
    window.location.href = "admin.html"; // cho admin về trang admin
    throw new Error("Not authorized");
}

// 2) Thông số phân trang
let currentPage = 0;
const pageSize = 6;

// 3) Tải sản phẩm từ API (KHÔNG gửi Authorization)
async function loadProducts() {
    const search = searchInput.value.trim();
    const sort = sortSelect.value;

    let url = `${API_BASE}/products?page=${currentPage}&size=${pageSize}`;
    if (search) url += `&name=${encodeURIComponent(search)}`;
    if (sort)   url += `&sort=${encodeURIComponent(sort)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Không tải được sản phẩm");
        const data = await res.json();

        renderProducts(data.content || []);
        renderPagination(data.totalPages || 0);
    } catch (err) {
        console.error("Lỗi:", err);
        productList.innerHTML = "<p class='text-danger'>Không tải được sản phẩm</p>";
        pagination.innerHTML = "";
    }
}

function renderProducts(products) {
    productList.innerHTML = "";
    products.forEach(p => {
        const col = document.createElement("div");
        col.className = "col-md-4";

        // Nếu API trả về tên file thì thêm prefix /uploads/
        const imgFile = p.imageUrl ? p.imageUrl : "no-image.png";
        const imgPath = `http://localhost:8080/uploads/${imgFile}`;

        const priceStr = Number(p.price || 0).toLocaleString("vi-VN");

        col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${imgPath}" class="card-img-top" alt="${escapeHtml(p.name || '')}">
        <div class="card-body">
          <h5 class="card-title">${escapeHtml(p.name || '')}</h5>
          <p class="card-text">${escapeHtml(p.description || '')}</p>
          <p class="text-primary fw-bold">${priceStr} VND</p>
        </div>
      </div>
    `;
        productList.appendChild(col);
    });
}

function renderPagination(totalPages) {
    pagination.innerHTML = "";
    for (let i = 0; i < totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? "active" : ""}`;

        const a = document.createElement("a");
        a.className = "page-link";
        a.href = "#";
        a.innerText = (i + 1).toString();
        a.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            loadProducts();
        });

        li.appendChild(a);
        pagination.appendChild(li);
    }
}

searchInput.addEventListener("input", () => {
    currentPage = 0;
    loadProducts();
});
sortSelect.addEventListener("change", () => {
    currentPage = 0;
    loadProducts();
});

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
    );
}

// 7) Khởi tạo
loadProducts();
