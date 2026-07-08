<?php
// ======================================================================
// PHẦN 1: XỬ LÝ LOGIC PHP KHI FORM ĐƯỢC GỬI ĐI (POST REQUEST)
// ======================================================================

// Chỉ thực thi khối mã này khi request là POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // --- Cấu hình kết nối Database ---
    define('DB_SERVER', 'localhost');
    define('DB_USERNAME', 'root'); // Thay bằng username của bạn
    define('DB_PASSWORD', '');     // Thay bằng password của bạn
    define('DB_NAME', 'ncc'); // Thay bằng tên database của bạn

    header('Content-Type: application/json'); // Luôn trả về kết quả dạng JSON

    try {
        $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec("SET NAMES 'utf8mb4'");
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => "Lỗi kết nối CSDL: " . $e->getMessage()]);
        exit; // Dừng thực thi ngay lập tức
    }
    
    // --- Lấy và kiểm tra dữ liệu (Validation) ---
    $errors = [];
    $supplier_code = trim($_POST['supplier_code'] ?? '');
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $website = trim($_POST['website'] ?? '');
    $status = trim($_POST['status'] ?? '');

    // Mã Nhà Cung Cấp
    if (empty($supplier_code)) {
        $errors['supplier_code'] = 'Mã nhà cung cấp là bắt buộc.';
    } elseif (!preg_match('/^[a-zA-Z0-9]{3,10}$/', $supplier_code)) {
        $errors['supplier_code'] = 'Mã phải từ 3-10 ký tự, chỉ gồm chữ và số.';
    } else {
        $stmt = $pdo->prepare("SELECT id FROM suppliers WHERE supplier_code = ?");
        $stmt->execute([$supplier_code]);
        if ($stmt->fetch()) {
            $errors['supplier_code'] = 'Mã nhà cung cấp này đã tồn tại.';
        }
    }

    // Tên Nhà Cung Cấp
    if (empty($name)) {
        $errors['name'] = 'Tên nhà cung cấp là bắt buộc.';
    } elseif (mb_strlen($name) < 5 || mb_strlen($name) > 100) {
        $errors['name'] = 'Tên phải từ 5 đến 100 ký tự.';
    }

    // Email
    if (empty($email)) {
        $errors['email'] = 'Email là bắt buộc.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Định dạng email không hợp lệ.';
    } else {
        $stmt = $pdo->prepare("SELECT id FROM suppliers WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $errors['email'] = 'Email này đã được sử dụng.';
        }
    }

    // Số điện thoại
    if (empty($phone)) {
        $errors['phone'] = 'Số điện thoại là bắt buộc.';
    } elseif (!preg_match('/^0[0-9]{9,11}$/', $phone)) {
        $errors['phone'] = 'Số điện thoại phải bắt đầu bằng 0, dài 10-12 số.';
    }

    // Địa chỉ
    if (empty($address)) {
        $errors['address'] = 'Địa chỉ là bắt buộc.';
    } elseif (mb_strlen($address) > 255) {
        $errors['address'] = 'Địa chỉ không được vượt quá 255 ký tự.';
    }

    // Website
    if (!empty($website) && !filter_var($website, FILTER_VALIDATE_URL)) {
        $errors['website'] = 'URL website không hợp lệ.';
    }

    // Trạng thái
    if (empty($status)) {
        $errors['status'] = 'Vui lòng chọn trạng thái hợp tác.';
    }
    
    // --- Xử lý kết quả và trả về JSON ---
    $data = [];
    if (!empty($errors)) {
        $data['success'] = false;
        $data['errors'] = $errors;
    } else {
        try {
            $sql = "INSERT INTO suppliers (supplier_code, name, email, phone, address, website, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$supplier_code, $name, $email, $phone, $address, $website, $status]);
            $data['success'] = true;
            $data['message'] = 'Thêm nhà cung cấp thành công!';
        } catch (PDOException $e) {
            $data['success'] = false;
            $data['message'] = 'Lỗi hệ thống: Không thể thêm nhà cung cấp. Vui lòng thử lại sau.';
        }
    }

    echo json_encode($data);
    exit; // Cực kỳ quan trọng: Dừng script để không in ra phần HTML bên dưới
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thêm Mới Nhà Cung Cấp</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Roboto', sans-serif;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .form-container {
            background-color: #ffffff;
            padding: 30px 40px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 700px;
            border-top: 5px solid #6c757d;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 25px;
            font-weight: 700;
            font-size: 24px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #495057;
            font-size: 14px;
        }
        .form-group .required {
            color: #dc3545;
            margin-left: 2px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 16px;
            color: #495057;
            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .form-group input::placeholder,
        .form-group textarea::placeholder {
            color: #adb5bd;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #80bdff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        .form-group.error input,
        .form-group.error select,
        .form-group.error textarea {
            border-color: #dc3545;
        }
        .error-message {
            color: #dc3545;
            font-size: 12px;
            margin-top: 5px;
            display: none;
        }
        .form-group.error .error-message {
            display: block;
        }
        .form-actions {
            display: flex;
            justify-content: flex-start;
            gap: 15px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
        }
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.2s ease;
            color: #fff;
        }
        .btn:hover {
            opacity: 0.9;
        }
        .btn-save {
            background-color: #ffc107;
            color: #212529;
        }
        .btn-reset {
            background-color: #6c757d;
        }
        .btn-cancel {
            background-color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h1>THÊM MỚI NHÀ CUNG CẤP</h1>
        <form id="supplier-form" method="POST" action="" novalidate>
            <div class="form-group">
                <label for="supplier_code">Mã Nhà Cung Cấp <span class="required">*</span></label>
                <input type="text" id="supplier_code" name="supplier_code" placeholder="3-10 ký tự, chỉ chữ và số">
                <small class="error-message"></small>
            </div>
            <div class="form-group">
                <label for="name">Tên Nhà Cung Cấp <span class="required">*</span></label>
                <input type="text" id="name" name="name" placeholder="Nhập tên đầy đủ của công ty">
                <small class="error-message"></small>
            </div>
            <div class="form-group">
                <label for="email">Email <span class="required">*</span></label>
                <input type="email" id="email" name="email" placeholder="Nhập email liên hệ">
                <small class="error-message"></small>
            </div>
            <div class="form-group">
                <label for="phone">Số điện thoại <span class="required">*</span></label>
                <input type="tel" id="phone" name="phone" placeholder="Bắt đầu bằng số 0, 10-12 số">
                <small class="error-message"></small>
            </div>
            <div class="form-group">
                <label for="address">Địa chỉ <span class="required">*</span></label>
                <textarea id="address" name="address" placeholder="Nhập địa chỉ trụ sở"></textarea>
                <small class="error-message"></small>
            </div>
            <div class="form-group">
                <label for="website">Website</label>
                <input type="url" id="website" name="website" placeholder="Ví dụ: https://example.com">
                <small class="error-message"></small>
            </div>
            <div class="form-group">
                <label for="status">Trạng thái hợp tác <span class="required">*</span></label>
                <select id="status" name="status">
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="Đang hợp tác">Đang hợp tác</option>
                    <option value="Ngừng hợp tác">Ngừng hợp tác</option>
                </select>
                <small class="error-message"></small>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-save">Lưu thông tin</button>
                <button type="button" class="btn btn-reset" id="reset-btn">Làm mới</button>
                <button type="button" class="btn btn-cancel" id="cancel-btn">Hủy</button>
            </div>
        </form>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('supplier-form');
        const resetBtn = document.getElementById('reset-btn');
        const cancelBtn = document.getElementById('cancel-btn');

        const inputs = {
            supplier_code: document.getElementById('supplier_code'),
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            address: document.getElementById('address'),
            website: document.getElementById('website'),
            status: document.getElementById('status')
        };

        const showError = (input, message) => {
            const formGroup = input.parentElement;
            formGroup.classList.add('error');
            formGroup.querySelector('.error-message').textContent = message;
        };

        const showSuccess = (input) => {
            const formGroup = input.parentElement;
            formGroup.classList.remove('error');
            formGroup.querySelector('.error-message').textContent = '';
        };

        const clearState = (input) => {
            const formGroup = input.parentElement;
            formGroup.classList.remove('error');
            formGroup.querySelector('.error-message').textContent = '';
        };

        const isValidEmail = email => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(email).toLowerCase());
        const isValidUrl = url => { try { new URL(url); return true; } catch (_) { return false; } };

        const validateInputs = () => {
            let isValid = true;
            Object.values(inputs).forEach(clearState); // Xóa lỗi cũ trước khi kiểm tra

            if (inputs.supplier_code.value.trim() === '') { showError(inputs.supplier_code, 'Mã nhà cung cấp là bắt buộc.'); isValid = false; } 
            else if (!/^[a-zA-Z0-9]{3,10}$/.test(inputs.supplier_code.value.trim())) { showError(inputs.supplier_code, 'Mã phải từ 3-10 ký tự, chỉ gồm chữ và số.'); isValid = false; }

            if (inputs.name.value.trim() === '') { showError(inputs.name, 'Tên nhà cung cấp là bắt buộc.'); isValid = false; } 
            else if (inputs.name.value.trim().length < 5 || inputs.name.value.trim().length > 100) { showError(inputs.name, 'Tên phải từ 5 đến 100 ký tự.'); isValid = false; }

            if (inputs.email.value.trim() === '') { showError(inputs.email, 'Email là bắt buộc.'); isValid = false; } 
            else if (!isValidEmail(inputs.email.value.trim())) { showError(inputs.email, 'Định dạng email không hợp lệ.'); isValid = false; }

            if (inputs.phone.value.trim() === '') { showError(inputs.phone, 'Số điện thoại là bắt buộc.'); isValid = false; } 
            else if (!/^0\d{9,11}$/.test(inputs.phone.value.trim())) { showError(inputs.phone, 'SĐT phải bắt đầu bằng 0, dài 10-12 số.'); isValid = false; }

            if (inputs.address.value.trim() === '') { showError(inputs.address, 'Địa chỉ là bắt buộc.'); isValid = false; } 
            else if (inputs.address.value.trim().length > 255) { showError(inputs.address, 'Địa chỉ không được quá 255 ký tự.'); isValid = false; }

            if (inputs.website.value.trim() !== '' && !isValidUrl(inputs.website.value.trim())) { showError(inputs.website, 'URL website không hợp lệ.'); isValid = false; }
            
            if (inputs.status.value === '') { showError(inputs.status, 'Vui lòng chọn trạng thái.'); isValid = false; }

            return isValid;
        };
        
        const resetForm = () => {
            form.reset();
            Object.values(inputs).forEach(clearState);
        };

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateInputs()) {
                const formData = new FormData(form);
                // Gửi request đến chính file này, để trống action hoặc URL
                fetch('', { method: 'POST', body: formData })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(data.message);
                        resetForm();
                    } else {
                        if (data.errors) {
                            Object.keys(data.errors).forEach(key => {
                                if (inputs[key]) {
                                    showError(inputs[key], data.errors[key]);
                                }
                            });
                        } else if (data.message) {
                            alert('Lỗi: ' + data.message);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra console.');
                });
            }
        });

        resetBtn.addEventListener('click', resetForm);
        cancelBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn hủy bỏ?')) {
                resetForm();
            }
        });
    });
    </script>
</body>
</html>