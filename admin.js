const API_BASE = "http://localhost:8080/api2025";
const API_KEY = "SECRET_KEY_123"; // phải trùng với server
const productList = document.getElementById("productList");
const categorySelect = document.getElementById("productCategory");

// Kiểm tra đăng nhập & quyền
let currentUser = null;
try {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
} catch (_) {}

if (!currentUser) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "index.html";
    throw new Error("Not logged in");
}

if (currentUser.role !== "ADMIN") {
    alert("Bạn không có quyền truy cập!");
    window.location.href = "products.html";
    throw new Error("Not authorized");
}

// Load danh mục
async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`, {
            headers: { "X-API-KEY": API_KEY }
        });
        if (!res.ok) throw new Error("Không tải được danh mục");
        const categories = await res.json();
        categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
    } catch (err) {
        console.error("Lỗi tải danh mục:", err);
    }
}

// Load sản phẩm
async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE}/products?page=0&size=100`, {
            headers: { "X-API-KEY": API_KEY }
        });
        if (!res.ok) throw new Error("Không tải được sản phẩm");
        const data = await res.json();
        renderProducts(data.content);
    } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        productList.innerHTML = `<p class="text-danger">Không tải được sản phẩm</p>`;
    }
}

// Render sản phẩm
function renderProducts(products) {
    productList.innerHTML = "";
    products.forEach(p => {
        const col = document.createElement("div");
        col.className = "col-md-4 mb-3";

        let imageName = p.imageUrl
            ? p.imageUrl.replace(/\\/g, '/').replace(/^uploads\//, '')
            : 'no-image.png';
        const imgPath = `${API_BASE.replace('/api2025', '')}/uploads/${encodeURIComponent(imageName)}`;

        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${imgPath}" class="card-img-top" alt="${p.name}">
                <div class="card-body">
                    <h5 class="card-title">${p.name}</h5>
                    <p>${p.description || ""}</p>
                    <p class="fw-bold text-primary">${p.price.toLocaleString()} VND</p>
                    <button class="btn btn-warning btn-sm me-2" onclick='editProduct(${JSON.stringify(p)})'>Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick='deleteProduct(${p.id})'>Xóa</button>
                </div>
            </div>`;
        productList.appendChild(col);
    });
}

// Thêm / sửa sản phẩm
document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = document.getElementById("productId").value;
    const productData = {
        name: document.getElementById("productName").value.trim(),
        price: parseFloat(document.getElementById("productPrice").value),
        description: document.getElementById("productDescription").value.trim(),
        category: { id: parseInt(categorySelect.value) }
    };

    try {
        let res;
        if (productId) {
            // Cập nhật
            res = await fetch(`${API_BASE}/products/${productId}?role=ADMIN`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": API_KEY
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Thêm mới
            res = await fetch(`${API_BASE}/products?role=ADMIN`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": API_KEY
                },
                body: JSON.stringify(productData)
            });
        }

        if (!res.ok) throw new Error("Không thể lưu sản phẩm - API Key sai?");
        const savedProduct = await res.json();

        // Upload ảnh nếu có
        const fileInput = document.getElementById("productImage");
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append("file", fileInput.files[0]);
            formData.append("role", "ADMIN");

            await fetch(`${API_BASE}/products/${savedProduct.id}/upload-image`, {
                method: "POST",
                headers: { "X-API-KEY": API_KEY },
                body: formData
            });
        }

        alert("Lưu sản phẩm thành công!");
        resetForm();
        loadProducts();
    } catch (err) {
        console.error("Lỗi lưu:", err);
        alert("Không thể lưu sản phẩm");
    }
});

// Xóa sản phẩm
async function deleteProduct(id) {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    try {
        const res = await fetch(`${API_BASE}/products/${id}?role=ADMIN`, {
            method: "DELETE",
            headers: { "X-API-KEY": API_KEY }
        });
        if (res.status === 204) {
            alert("Xóa thành công!");
            loadProducts();
        } else {
            alert("Không thể xóa sản phẩm!");
        }
    } catch (err) {
        console.error("Lỗi xóa:", err);
    }
}

// Mở form sửa sản phẩm
function editProduct(p) {
    document.getElementById("productId").value = p.id;
    document.getElementById("productName").value = p.name;
    document.getElementById("productPrice").value = p.price;
    document.getElementById("productDescription").value = p.description || "";
    document.getElementById("productCategory").value = p.category ? p.category.id : "";
}

// Reset form
function resetForm() {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
}
document.getElementById("resetBtn").addEventListener("click", resetForm);

// Khởi tạo
loadCategories();
loadProducts();
