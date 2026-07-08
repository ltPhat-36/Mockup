const API_BASE = "http://localhost:8080/api2025";

document.getElementById("loginBtn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorBox = document.getElementById("loginError");
    errorBox.innerText = "";

    try {
        const res = await fetch(`${API_BASE}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const user = await res.json();
            localStorage.setItem("currentUser", JSON.stringify(user));
        
            // Điều hướng theo role
            if (user.role === "ADMIN") {
                window.location.href = "admin.html";
            } else if (user.role === "CUSTOMER") {
                window.location.href = "products.html";
            } else {
                errorBox.innerText = "Vai trò không hợp lệ!";
            }
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        errorBox.innerText = "Không thể kết nối server!";
    }
});
