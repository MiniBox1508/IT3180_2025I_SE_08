// PATCH: cập nhật trạng thái thanh toán (state) cho payment
// index.js
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = process.env.PORT;
const cors = require("cors"); // <-- THÊM DÒNG NÀY

app.use(express.json());

const allowedOrigins = [
  "https://it-3180-2025-1-se-08.vercel.app", // Link FE 1 của bạn
  "https://testing-deployment-fe.vercel.app", // Link FE 2
  "http://localhost:3000", // Thêm các cổng local khác nếu cần
];

const corsOptions = {
  // 2. Sửa "origin" để dùng mảng
  origin: function (origin, callback) {
    // Kiểm tra xem 'origin' (nơi gửi request) có nằm trong danh sách 'allowedOrigins' không
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Nếu có (hoặc nếu là request không có origin như Postman), cho phép
      callback(null, true);
    } else {
      // Nếu không, từ chối
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// --- MySQL connection (sử dụng POOL) ---
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: process.env.VERCEL_CA_CERT,
    rejectUnauthorized: false,
  },
});

// -------- Root --------
app.get("/", (req, res) => {
  res.send("Hello Express!");
});

// -------- US-001: Residents CRUD --------

// GET all users
app.get("/residents", (req, res) => {
  const sql = `SELECT * FROM user ORDER BY id`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single user
app.get("/residents/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM user WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  });
});

// POST create user
app.post("/residents", (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    apartment_id,
    cccd,
    birth_date,
    role,
    residency_status,
    email,
    password,
  } = req.body || {};
  if (!first_name || !last_name || !phone || !apartment_id || !password) {
    return res.status(400).json({
      error:
        "Thiếu trường bắt buộc: first_name, last_name, phone, apartment_id, password",
    });
  }

  const full_name = `${first_name.trim()} ${last_name.trim()}`;
  const sql = `INSERT INTO user 
    (full_name, first_name, last_name, phone, apartment_id, cccd, birth_date, role, residency_status, email, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      full_name,
      first_name,
      last_name,
      phone,
      apartment_id,
      cccd || null,
      birth_date || null,
      role || null,
      residency_status || null,
      email || null,
      password,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Thêm người dùng thành công", id: result.insertId });
    }
  );
});

// PUT update user
app.put("/residents/:id", (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    phone,
    apartment_id,
    state,
    cccd,
    birth_date,
    role,
    residency_status,
    email,
    password,
  } = req.body || {};
  if (!id) return res.status(400).json({ error: "Thiếu id" });

  const full_name =
    first_name && last_name
      ? `${first_name.trim()} ${last_name.trim()}`
      : undefined;

  const sql = `
    UPDATE user
    SET first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        apartment_id = COALESCE(?, apartment_id),
        state = COALESCE(?, state),
        cccd = COALESCE(?, cccd),
        birth_date = COALESCE(?, birth_date),
        role = COALESCE(?, role),
        residency_status = COALESCE(?, residency_status),
        email = COALESCE(?, email),
        password = COALESCE(?, password)
    WHERE id = ?
  `;
  db.query(
    sql,
    [
      first_name,
      last_name,
      full_name,
      phone,
      apartment_id,
      state,
      cccd,
      birth_date,
      role,
      residency_status,
      email,
      password,
      id,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      res.json({ message: "Cập nhật thành công" });
    }
  );
});

// DELETE user
app.delete("/residents/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM user WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    res.json({ message: "Xóa thành công" });
  });
});

// -------- US-008: Payments --------

// GET mock fees
app.get("/fees", (req, res) => {
  res.json([
    { id: 1, description: "Phí quản lý tháng 10", amount: 300000 },
    { id: 2, description: "Phí gửi xe", amount: 100000 },
  ]);
});

// POST create payment (generate transaction_ref)
app.post("/payment", (req, res) => {
  const { resident_id, amount, feetype, payment_form } = req.body || {};
  if (!resident_id || !amount) {
    return res.status(400).json({ error: "Thiếu resident_id hoặc amount" });
  }

  // transaction ref
  const transactionRef = `TRX_${Date.now()}`;

  const sql = `INSERT INTO payments 
    (resident_id, amount, state, transaction_ref, feetype, payment_date, payment_form)
    VALUES (?, ?, 0, ?, ?, NULL, ?)`;

  db.query(
    sql,
    [
      resident_id,
      amount,
      transactionRef,
      feetype || null,
      payment_form || null,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Tạo giao dịch thành công",
        transaction_ref: transactionRef,
        payment_id: result.insertId,
      });
    }
  );
});

// POST payment callback (webhook mock)
app.post("/payment/callback", (req, res) => {
  console.log("callback body:", req.body);

  const transaction_ref = String(req.body?.transaction_ref || "").trim();
  const statusRaw = String(req.body?.status || "").trim();
  const status = statusRaw.toLowerCase();

  // Accept 'success' and 'failed'
  const allowed = new Set(["success", "failed"]);
  if (!transaction_ref || !allowed.has(status)) {
    return res
      .status(400)
      .json({ error: "transaction_ref hoặc status không hợp lệ" });
  }

  // If success -> set state = 1 (paid). If failed -> state stays 0 (or mark failed; we keep it 0).
  if (status === "success") {
    const sql = `
      UPDATE payments
      SET state = 1,
          provider_tx_id = COALESCE(?, provider_tx_id),
          payer_account = COALESCE(?, payer_account),
          payer_name = COALESCE(?, payer_name),
          verification_method = 'webhook',
          verified_at = NOW(),
          updated_at = NOW()
      WHERE transaction_ref = ? AND state = 0
    `;
    const { provider_tx_id, payer_account, payer_name } = req.body;
    db.query(
      sql,
      [
        provider_tx_id || null,
        payer_account || null,
        payer_name || null,
        transaction_ref,
      ],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
          return res.status(409).json({
            error:
              "Không cập nhật được: không tìm thấy transaction pending hoặc đã được xác nhận trước đó",
          });
        }
        return res.json({
          message: "Cập nhật trạng thái giao dịch thành công",
        });
      }
    );
  } else {
    // failed case: update provider_tx_id and leave state = 0 (pending/failed); we do idempotent update only if state = 0
    const sql = `
      UPDATE payments
      SET provider_tx_id = COALESCE(?, provider_tx_id),
          payer_account = COALESCE(?, payer_account),
          payer_name = COALESCE(?, payer_name),
          verification_method = 'webhook',
          updated_at = NOW()
      WHERE transaction_ref = ? AND state = 0
    `;
    const { provider_tx_id, payer_account, payer_name } = req.body;
    db.query(
      sql,
      [
        provider_tx_id || null,
        payer_account || null,
        payer_name || null,
        transaction_ref,
      ],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
          return res.status(409).json({
            error:
              "Không cập nhật được: không tìm thấy transaction pending hoặc đã được xác nhận trước đó",
          });
        }
        return res.json({
          message: "Giao dịch đánh dấu failed/ignored (đã ghi provider info)",
        });
      }
    );
  }
});

// -------- US-009: Payment status (by resident) --------
app.get("/payment-status", (req, res) => {
  const { resident_id } = req.query;
  if (!resident_id) return res.status(400).json({ error: "Thiếu resident_id" });

  const sql = `SELECT * FROM payments WHERE resident_id = ? ORDER BY created_at DESC`;
  db.query(sql, [resident_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // map state (0/1) to readable
    const mapped = results.map((r) => ({
      ...r,
      is_paid: r.state === 1,
      status_text: r.state === 1 ? "Đã thanh toán" : "Chưa thanh toán",
    }));
    res.json(mapped);
  });
});

// -------- Notifications (basic) --------

// GET all notifications (with optional join to owner's name if exists)
app.get("/notifications", (req, res) => {
  const sql = `
    SELECT n.*, r.full_name AS owner_name
    FROM notifications n
    LEFT JOIN user r
      ON n.apartment_id = r.apartment_id
      AND r.residency_status = 'chủ hộ'
    ORDER BY n.notification_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST create notification
app.post("/notifications", (req, res) => {
  const { apartment_id, content } = req.body || {};
  if (!apartment_id || !content) {
    return res.status(400).json({ error: "Thiếu apartment_id hoặc content" });
  }
  const sql = `INSERT INTO notifications (apartment_id, content) VALUES (?, ?)`;
  db.query(sql, [apartment_id, content], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res
      .status(201)
      .json({ message: "Thông báo được tạo", id: result.insertId });
  });
});

// PATCH mark notification as sent
app.patch("/notifications/:id/send", (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE notifications SET sent_date = NOW() WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Notification marked as sent" });
  });
});

// DELETE notification
app.delete("/notifications/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM notifications WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Notification deleted" });
  });
});

// DELETE user (soft delete) - chỉ đặt state = 'inactive'
app.delete("/residents/:id", (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Thiếu id" });

  // 1) Kiểm tra resident có tồn tại không
  db.query("SELECT id, state FROM user WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy cư dân" });
    }

    // Nếu đã inactive rồi thì trả về thông báo tương ứng
    const currentState = rows[0].state;
    if (currentState && String(currentState).toLowerCase() === "inactive") {
      return res.json({
        message: "Resident đã ở trạng thái inactive (đã xóa mềm trước đó)",
      });
    }

    // 2) Thực hiện soft delete: set state = 'inactive'
    const sql = `UPDATE user SET state = 'inactive' WHERE id = ?`;
    db.query(sql, [id], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Không tìm thấy cư dân" });
      return res.json({
        message: "Resident soft-deleted (state set to inactive)",
      });
    });
  });
});
// -------- Payments listing & transaction endpoints --------

// GET all payments (with user name)
app.get("/payments", (req, res) => {
  const sql = `
    SELECT p.*, r.full_name AS resident_name, r.apartment_id
    FROM payments p
    LEFT JOIN user r ON p.resident_id = r.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // convert state 0/1 into readable
    const mapped = results.map((p) => ({
      ...p,
      is_paid: p.state === 1,
      status_text: p.state === 1 ? "Đã thanh toán" : "Chưa thanh toán",
    }));
    res.json(mapped);
  });
});

// GET payments by resident_id (same as /payment-status but paginated/limited optionally)
app.get("/payments/by-resident/:resident_id", (req, res) => {
  const { resident_id } = req.params;
  const sql = `
    SELECT p.*, r.full_name AS resident_name, r.apartment_id
    FROM payments p
    LEFT JOIN user r ON p.resident_id = r.id
    WHERE p.resident_id = ?
    ORDER BY p.created_at DESC
  `;
  db.query(sql, [resident_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const mapped = results.map((p) => ({
      ...p,
      is_paid: p.state === 1,
      status_text: p.state === 1 ? "Đã thanh toán" : "Chưa thanh toán",
    }));
    res.json(mapped);
  });
});

// GET one payment by id
app.get("/payments/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, r.full_name AS resident_name, r.apartment_id
    FROM payments p
    LEFT JOIN user r ON p.resident_id = r.id
    WHERE p.id = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results || results.length === 0)
      return res.status(404).json({ error: "Payment not found" });
    const p = results[0];
    p.is_paid = p.state === 1;
    p.status_text = p.state === 1 ? "Đã thanh toán" : "Chưa thanh toán";
    res.json(p);
  });
});

// PATCH: cập nhật trạng thái thanh toán (state) cho payment

app.patch("/payments/:id", (req, res) => {
  const { id } = req.params;
  const { state } = req.body;
  if (typeof state !== "number" || (state !== 0 && state !== 1)) {
    return res
      .status(400)
      .json({ error: "Giá trị state không hợp lệ (chỉ nhận 0 hoặc 1)" });
  }
  if (state === 1) {
    // Nếu chuyển sang success, cập nhật cả state và payment_date bằng ngày hiện tại GMT+7
    const vnDate = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
    const sql = `
      UPDATE payments
      SET state = 1, payment_date = ?
      WHERE id = ?
    `;
    db.query(sql, [vnDate, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ error: "Không tìm thấy giao dịch để cập nhật" });
      res.json({
        message: "Cập nhật trạng thái và ngày thanh toán thành công",
      });
    });
  } else {
    // Nếu là 0, cập nhật state về 0 và xóa ngày thanh toán
    const sql = `
      UPDATE payments
      SET state = 0, payment_date = NULL
      WHERE id = ?
    `;
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ error: "Không tìm thấy giao dịch để cập nhật" });
      res.json({
        message: "Cập nhật trạng thái về chưa thanh toán thành công",
      });
    });
  }
});

// -------- PUT /notifications/:id — chỉnh sửa thông báo --------
app.put("/notifications/:id", (req, res) => {
  const { id } = req.params;
  const { apartment_id, content, notification_date, sent_date } =
    req.body || {};

  if (!id) return res.status(400).json({ error: "Thiếu id thông báo" });

  // 1️⃣ Chuẩn bị các trường cần cập nhật (chỉ bao gồm trường có giá trị không rỗng)
  const updateFields = [];
  const updateParams = [];

  // apartment_id
  if (apartment_id !== undefined && apartment_id.trim() !== "") {
    updateFields.push("apartment_id = ?");
    updateParams.push(apartment_id.trim());
  } else if (apartment_id === "") {
    // Báo lỗi nếu trường NOT NULL bị xóa trắng
    return res
      .status(400)
      .json({ error: "Trường Người nhận (apartment_id) không được để trống." });
  }

  // content
  if (content !== undefined && content.trim() !== "") {
    updateFields.push("content = ?");
    updateParams.push(content.trim());
  } else if (content === "") {
    // Báo lỗi nếu trường NOT NULL bị xóa trắng
    return res
      .status(400)
      .json({ error: "Trường Nội dung không được để trống." });
  }

  // Các trường tùy chọn khác (notification_date, sent_date)
  if (notification_date !== undefined) {
    updateFields.push("notification_date = ?");
    updateParams.push(notification_date || null);
  }
  if (sent_date !== undefined) {
    updateFields.push("sent_date = ?");
    updateParams.push(sent_date); // Giá trị này có thể là null nếu muốn xóa ngày gửi
  }

  // Kiểm tra nếu không có trường nào để cập nhật (không phải lỗi, nhưng là 400 hợp lý)
  if (updateFields.length === 0) {
    return res
      .status(400)
      .json({ error: "Không có trường nào hợp lệ để cập nhật." });
  }

  // Thêm ID vào cuối danh sách tham số
  updateParams.push(id);

  // 2️⃣ Cập nhật thông báo
  const sql = `UPDATE notifications SET ${updateFields.join(
    ", "
  )} WHERE id = ?`;

  // Bỏ qua checkSql do đã kiểm tra ở FE và sẽ kiểm tra affectedRows
  db.query(sql, updateParams, (err2, result) => {
    if (err2) return res.status(500).json({ error: err2.message });

    if (result.affectedRows === 0) {
      // Nếu không có dòng nào bị ảnh hưởng, có nghĩa là ID không tồn tại
      return res
        .status(404)
        .json({ error: "Không tìm thấy thông báo để cập nhật" });
    }

    // Cập nhật thành công (200 OK)
    res.json({ message: "Cập nhật thông báo thành công" });
  });
});

// -------- DELETE payment (xóa hẳn giao dịch) --------
app.delete("/payments/:id", (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Thiếu id" });

  // 1️⃣ Kiểm tra giao dịch có tồn tại không
  const checkSql = "SELECT id FROM payments WHERE id = ? LIMIT 1";
  db.query(checkSql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy giao dịch để xóa" });
    }

    // 2️⃣ Xóa hẳn giao dịch
    const deleteSql = "DELETE FROM payments WHERE id = ?";
    db.query(deleteSql, [id], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Không thể xóa giao dịch (có thể đã bị xóa trước đó)",
        });
      }
      res.json({ message: "Đã xóa giao dịch thành công" });
    });
  });
});

// -------- Helper / health --------
app.get("/health", (req, res) => res.json({ ok: true }));

// Start server
app.listen(port, () => {
  // console.log(`🚀 Server chạy tại http://localhost:${port}`);
  console.log(port);
});

// -------- API ĐĂNG NHẬP --------
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ error: "Thiếu username, password hoặc role" });
  }

  // Cho phép đăng nhập bằng email hoặc phone, và đúng role
  const sql = `SELECT * FROM user WHERE (email = ? OR phone = ?) AND password = ? AND role = ? LIMIT 1`;

  db.query(sql, [username, username, password, role], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      // Đăng nhập thất bại
      return res
        .status(401)
        .json({ error: "Sai tài khoản, mật khẩu hoặc vai trò" });
    }

    // Đăng nhập thành công
    const user = results[0];
    delete user.password; // Xóa password trước khi gửi về FE

    res.json({ message: "Đăng nhập thành công", user: user });
  });
});

module.exports = app;
