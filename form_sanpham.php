<?php
// Kết nối CSDL
$conn = new mysqli("localhost", "root", "", "ql_sanpham");

if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}

$thongbao = "";

// Khi nhấn nút Thêm mới
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["btnThem"])) {
    $maSP = trim($_POST["maSP"]);
    $tenSP = trim($_POST["tenSP"]);
    $danhMuc = $_POST["danhMuc"];
    $nhaCC = trim($_POST["nhaCC"]);
    $giaBan = trim($_POST["giaBan"]);
    $soLuong = trim($_POST["soLuong"]);
    $trangThai = isset($_POST["trangThai"]) ? $_POST["trangThai"] : "";
    $moTa = trim($_POST["moTa"]);

    $valid = true;
    $errors = [];

    // 1. Mã sản phẩm
    if (empty($maSP)) {
        $valid = false;
        $errors["maSP"] = "Mã sản phẩm là bắt buộc.";
    } elseif (!preg_match("/^SP-\d{4}$/", $maSP)) {
        $valid = false;
        $errors["maSP"] = "Mã sản phẩm phải theo định dạng SP-XXXX (VD: SP-1234).";
    } else {
        $check = $conn->prepare("SELECT maSP FROM sanpham WHERE maSP=?");
        $check->bind_param("s", $maSP);
        $check->execute();
        $check->store_result();
        if ($check->num_rows > 0) {
            $valid = false;
            $errors["maSP"] = "Mã sản phẩm đã tồn tại.";
        }
    }

    // 2. Tên sản phẩm
    if (empty($tenSP)) {
        $valid = false;
        $errors["tenSP"] = "Tên sản phẩm là bắt buộc.";
    } elseif (mb_strlen($tenSP) < 5 || mb_strlen($tenSP) > 100) {
        $valid = false;
        $errors["tenSP"] = "Tên sản phẩm phải từ 5 đến 100 ký tự.";
    }

    // 3. Danh mục
    if (empty($danhMuc)) {
        $valid = false;
        $errors["danhMuc"] = "Vui lòng chọn danh mục.";
    }

    // 4. Giá bán
    if (empty($giaBan)) {
        $valid = false;
        $errors["giaBan"] = "Giá bán là bắt buộc.";
    } elseif (!is_numeric($giaBan) || $giaBan <= 0) {
        $valid = false;
        $errors["giaBan"] = "Giá bán phải là số lớn hơn 0.";
    }

    // 5. Số lượng tồn kho
    if ($soLuong === "") {
        $valid = false;
        $errors["soLuong"] = "Số lượng tồn kho là bắt buộc.";
    } elseif (!ctype_digit($soLuong) || (int)$soLuong < 0) {
        $valid = false;
        $errors["soLuong"] = "Số lượng phải là số nguyên không âm.";
    }

    // 6. Trạng thái
    if (empty($trangThai)) {
        $valid = false;
        $errors["trangThai"] = "Vui lòng chọn trạng thái.";
    }

    // 7. Mô tả
    if (!empty($moTa) && mb_strlen($moTa) > 1000) {
        $valid = false;
        $errors["moTa"] = "Mô tả tối đa 1000 ký tự.";
    }

    // Nếu hợp lệ -> thêm vào CSDL
    if ($valid) {
        $stmt = $conn->prepare("INSERT INTO sanpham(maSP, tenSP, danhMuc, nhaCC, giaBan, soLuong, trangThai, moTa)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssdiis", $maSP, $tenSP, $danhMuc, $nhaCC, $giaBan, $soLuong, $trangThai, $moTa);
        if ($stmt->execute()) {
            $thongbao = "<div class='alert alert-success text-center'>✅ Thêm sản phẩm thành công!</div>";
        } else {
            $thongbao = "<div class='alert alert-danger text-center'>❌ Lỗi khi thêm sản phẩm!</div>";
        }
    } else {
        $thongbao = "<div class='alert alert-warning text-center'>⚠️ Vui lòng kiểm tra lại thông tin nhập.</div>";
    }
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Thêm mới sản phẩm</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {background-color:#f8f9fa;}
        .container {max-width:700px; margin-top:40px; background:white; padding:30px; border:1px solid #ccc; border-radius:10px;}
        .error {color:red; font-size:0.9em;}
        .btn-group {text-align:center; margin-top:20px;}
        h3 {text-align:center; font-weight:bold; margin-bottom:25px; color:#0d6efd;}
        .form-label {font-weight:500;}
        textarea {resize:none;}
    </style>
</head>
<body>
<div class="container">
    <h3>THÊM MỚI SẢN PHẨM</h3>
    <?= $thongbao ?>
    <form method="post">
        <!-- Mã sản phẩm -->
        <div class="mb-3">
            <label class="form-label">Mã Sản Phẩm <span class="text-danger">*</span></label>
            <input type="text" name="maSP" class="form-control" placeholder="Ví dụ: SP-1234" value="<?= htmlspecialchars($_POST['maSP'] ?? '') ?>">
            <div class="error"><?= $errors['maSP'] ?? '' ?></div>
        </div>

        <!-- Tên sản phẩm -->
        <div class="mb-3">
            <label class="form-label">Tên Sản Phẩm <span class="text-danger">*</span></label>
            <input type="text" name="tenSP" class="form-control" placeholder="Nhập tên sản phẩm" value="<?= htmlspecialchars($_POST['tenSP'] ?? '') ?>">
            <div class="error"><?= $errors['tenSP'] ?? '' ?></div>
        </div>

        <!-- Danh mục -->
        <div class="mb-3">
            <label class="form-label">Danh mục <span class="text-danger">*</span></label>
            <select name="danhMuc" class="form-select">
                <option value="">-- Chọn danh mục --</option>
                <option value="Điện thoại" <?= (($_POST['danhMuc'] ?? '')=='Điện thoại')?'selected':'' ?>>Điện thoại</option>
                <option value="Laptop" <?= (($_POST['danhMuc'] ?? '')=='Laptop')?'selected':'' ?>>Laptop</option>
                <option value="Phụ kiện" <?= (($_POST['danhMuc'] ?? '')=='Phụ kiện')?'selected':'' ?>>Phụ kiện</option>
            </select>
            <div class="error"><?= $errors['danhMuc'] ?? '' ?></div>
        </div>

        <!-- Nhà cung cấp -->
        <div class="mb-3">
            <label class="form-label">Nhà cung cấp</label>
            <input type="text" name="nhaCC" class="form-control" placeholder="Nhập tên nhà cung cấp" value="<?= htmlspecialchars($_POST['nhaCC'] ?? '') ?>">
        </div>

        <!-- Giá bán -->
        <div class="mb-3">
            <label class="form-label">Giá bán (VNĐ) <span class="text-danger">*</span></label>
            <input type="text" name="giaBan" class="form-control" placeholder="Giá phải lớn hơn 0" value="<?= htmlspecialchars($_POST['giaBan'] ?? '') ?>">
            <div class="error"><?= $errors['giaBan'] ?? '' ?></div>
        </div>

        <!-- Số lượng -->
        <div class="mb-3">
            <label class="form-label">Số lượng tồn kho <span class="text-danger">*</span></label>
            <input type="text" name="soLuong" class="form-control" placeholder="Số lượng không âm" value="<?= htmlspecialchars($_POST['soLuong'] ?? '') ?>">
            <div class="error"><?= $errors['soLuong'] ?? '' ?></div>
        </div>

        <!-- Trạng thái -->
        <div class="mb-3">
            <label class="form-label">Trạng thái <span class="text-danger">*</span></label><br>
            <input type="radio" name="trangThai" value="Đang kinh doanh" <?= (($_POST['trangThai'] ?? '')=='Đang kinh doanh')?'checked':'' ?>> Đang kinh doanh
            <input type="radio" name="trangThai" value="Ngừng kinh doanh" <?= (($_POST['trangThai'] ?? '')=='Ngừng kinh doanh')?'checked':'' ?>> Ngừng kinh doanh
            <div class="error"><?= $errors['trangThai'] ?? '' ?></div>
        </div>

        <!-- Mô tả -->
        <div class="mb-3">
            <label class="form-label">Mô tả sản phẩm</label>
            <textarea name="moTa" class="form-control" rows="3" placeholder="Nhập mô tả chi tiết"><?= htmlspecialchars($_POST['moTa'] ?? '') ?></textarea>
            <div class="error"><?= $errors['moTa'] ?? '' ?></div>
        </div>

        <!-- Nút -->
        <div class="btn-group">
            <button type="submit" name="btnThem" class="btn btn-success px-4">Thêm mới</button>
            <button type="reset" class="btn btn-secondary px-4">Nhập lại</button>
            <button type="button" class="btn btn-danger px-4" onclick="if(confirm('Bạn có chắc muốn hủy bỏ?')) document.querySelector('form').reset();">Hủy</button>
        </div>
    </form>
</div>
</body>
</html>
