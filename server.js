const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const app = express();
const PORT = 3000;
const JWT_SECRET = "school-api-secret-key-2026";

// Setup Database
const adapter = new FileSync("db.json");
const db = low(adapter);

// Init default data
db.defaults({
	users: [],
	students: [],
}).write();

// Seed admin user kalau belum ada
if (db.get("users").find({ username: "admin" }).value() === undefined) {
	db.get("users")
		.push({
			id: uuidv4(),
			username: "admin",
			password: bcrypt.hashSync("admin123", 10),
			role: "admin",
			created_at: new Date().toISOString(),
		})
		.write();
	console.log("✅ Default admin user created: admin / admin123");
}

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────
// MIDDLEWARE — Auth
// ─────────────────────────────────────────
const authMiddleware = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	if (!authHeader)
		return res
			.status(401)
			.json({ success: false, message: "Token tidak ditemukan" });

	const token = authHeader.split(" ")[1];
	if (!token)
		return res
			.status(401)
			.json({
				success: false,
				message: "Format token salah. Gunakan: Bearer <token>",
			});

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res
			.status(401)
			.json({
				success: false,
				message: "Token tidak valid atau sudah expired",
			});
	}
};

// ─────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────
app.get("/", (req, res) => {
	res.json({
		success: true,
		message: "🏫 School API - Playground",
		version: "1.0.0",
		endpoints: {
			auth: {
				"POST /auth/register": "Daftar user baru",
				"POST /auth/login": "Login dan dapat token",
			},
			students: {
				"GET /students": "Ambil semua data siswa [AUTH]",
				"GET /students/:id": "Ambil data siswa by ID [AUTH]",
				"POST /students": "Tambah siswa baru [AUTH]",
				"PUT /students/:id": "Update data siswa [AUTH]",
				"DELETE /students/:id": "Hapus data siswa [AUTH]",
			},
		},
	});
});

// ─────────────────────────────────────────
// AUTH — Register
// ─────────────────────────────────────────
app.post("/auth/register", (req, res) => {
	const { username, password, role } = req.body;

	if (!username || !password) {
		return res
			.status(400)
			.json({ success: false, message: "Username dan password wajib diisi" });
	}

	const existingUser = db.get("users").find({ username }).value();
	if (existingUser) {
		return res
			.status(409)
			.json({ success: false, message: "Username sudah terdaftar" });
	}

	const hashedPassword = bcrypt.hashSync(password, 10);
	const newUser = {
		id: uuidv4(),
		username,
		password: hashedPassword,
		role: role || "user",
		created_at: new Date().toISOString(),
	};

	db.get("users").push(newUser).write();

	res.status(201).json({
		success: true,
		message: "Registrasi berhasil",
		data: {
			id: newUser.id,
			username: newUser.username,
			role: newUser.role,
			created_at: newUser.created_at,
		},
	});
});

// ─────────────────────────────────────────
// AUTH — Login
// ─────────────────────────────────────────
app.post("/auth/login", (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res
			.status(400)
			.json({ success: false, message: "Username dan password wajib diisi" });
	}

	const user = db.get("users").find({ username }).value();
	if (!user) {
		return res
			.status(401)
			.json({ success: false, message: "Username atau password salah" });
	}

	const isPasswordValid = bcrypt.compareSync(password, user.password);
	if (!isPasswordValid) {
		return res
			.status(401)
			.json({ success: false, message: "Username atau password salah" });
	}

	const token = jwt.sign(
		{ id: user.id, username: user.username, role: user.role },
		JWT_SECRET,
		{ expiresIn: "24h" },
	);

	res.json({
		success: true,
		message: "Login berhasil",
		data: {
			token,
			expires_in: "24h",
			user: {
				id: user.id,
				username: user.username,
				role: user.role,
			},
		},
	});
});

// ─────────────────────────────────────────
// STUDENTS — Get All
// ─────────────────────────────────────────
app.get("/students", authMiddleware, (req, res) => {
	const { name, kelas, page = 1, limit = 10 } = req.query;

	let students = db.get("students").value();

	// Filter
	if (name) {
		students = students.filter((s) =>
			s.name.toLowerCase().includes(name.toLowerCase()),
		);
	}
	if (kelas) {
		students = students.filter((s) => s.kelas === kelas);
	}

	// Pagination
	const total = students.length;
	const start = (page - 1) * limit;
	const end = start + parseInt(limit);
	const paginated = students.slice(start, end);

	res.json({
		success: true,
		message: "Data siswa berhasil diambil dengan filter dan pagination",
		data: paginated,
		pagination: {
			total,
			page: parseInt(page),
			limit: parseInt(limit),
			total_pages: Math.ceil(total / limit),
		},
	});
});

// ─────────────────────────────────────────
// STUDENTS — Get by ID
// ─────────────────────────────────────────
app.get("/students/:id", authMiddleware, (req, res) => {
	const student = db.get("students").find({ id: req.params.id }).value();

	if (!student) {
		return res
			.status(404)
			.json({ success: false, message: "Siswa tidak ditemukan" });
	}

	res.json({ success: true, message: "Data siswa ditemukan", data: student });
});

// ─────────────────────────────────────────
// STUDENTS — Create
// ─────────────────────────────────────────
app.post("/students", authMiddleware, (req, res) => {
	const {
		nis,
		name,
		kelas,
		jurusan,
		email,
		phone,
		alamat,
		tanggal_lahir,
		jenis_kelamin,
	} = req.body;

	if (!nis || !name || !kelas) {
		return res
			.status(400)
			.json({ success: false, message: "NIS, nama, dan kelas wajib diisi" });
	}

	// Cek NIS duplikat
	const existingStudent = db.get("students").find({ nis }).value();
	if (existingStudent) {
		return res
			.status(409)
			.json({ success: false, message: "NIS sudah terdaftar" });
	}

	const newStudent = {
		id: uuidv4(),
		nis,
		name,
		kelas,
		jurusan: jurusan || null,
		email: email || null,
		phone: phone || null,
		alamat: alamat || null,
		tanggal_lahir: tanggal_lahir || null,
		jenis_kelamin: jenis_kelamin || null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		created_by: req.user.username,
	};

	db.get("students").push(newStudent).write();

	res.status(201).json({
		success: true,
		message: "Data siswa berhasil ditambahkan",
		data: newStudent,
	});
});

// ─────────────────────────────────────────
// STUDENTS — Update
// ─────────────────────────────────────────
app.put("/students/:id", authMiddleware, (req, res) => {
	const student = db.get("students").find({ id: req.params.id }).value();

	if (!student) {
		return res
			.status(404)
			.json({ success: false, message: "Siswa tidak ditemukan" });
	}

	const {
		nis,
		name,
		kelas,
		jurusan,
		email,
		phone,
		alamat,
		tanggal_lahir,
		jenis_kelamin,
	} = req.body;

	// Cek NIS duplikat kalau NIS diubah
	if (nis && nis !== student.nis) {
		const existingStudent = db.get("students").find({ nis }).value();
		if (existingStudent) {
			return res
				.status(409)
				.json({ success: false, message: "NIS sudah digunakan siswa lain" });
		}
	}

	const updatedStudent = {
		...student,
		nis: nis || student.nis,
		name: name || student.name,
		kelas: kelas || student.kelas,
		jurusan: jurusan !== undefined ? jurusan : student.jurusan,
		email: email !== undefined ? email : student.email,
		phone: phone !== undefined ? phone : student.phone,
		alamat: alamat !== undefined ? alamat : student.alamat,
		tanggal_lahir:
			tanggal_lahir !== undefined ? tanggal_lahir : student.tanggal_lahir,
		jenis_kelamin:
			jenis_kelamin !== undefined ? jenis_kelamin : student.jenis_kelamin,
		updated_at: new Date().toISOString(),
		updated_by: req.user.username,
	};

	db.get("students").find({ id: req.params.id }).assign(updatedStudent).write();

	res.json({
		success: true,
		message: "Data siswa berhasil diupdate",
		data: updatedStudent,
	});
});

// ─────────────────────────────────────────
// STUDENTS — Delete
// ─────────────────────────────────────────
app.delete("/students/:id", authMiddleware, (req, res) => {
	const student = db.get("students").find({ id: req.params.id }).value();

	if (!student) {
		return res
			.status(404)
			.json({ success: false, message: "Siswa tidak ditemukan" });
	}

	db.get("students").remove({ id: req.params.id }).write();

	res.json({
		success: true,
		message: "Data siswa berhasil dihapus",
		data: { id: req.params.id, name: student.name },
	});
});

// DELETE by nama
app.delete("/students/name/:name", authMiddleware, (req, res) => {
	const name = req.params.name;

	const student = db
		.get("students")
		.find((s) => s.name.toLowerCase() === name.toLowerCase())
		.value();

	if (!student) {
		return res.status(404).json({
			success: false,
			message: `Siswa dengan nama '${name}' tidak ditemukan`,
		});
	}

	db.get("students").remove({ id: student.id }).write();

	res.json({
		success: true,
		message: "Data siswa berhasil dihapus",
		data: { id: student.id, name: student.name },
	});
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
app.listen(PORT, () => {
	console.log(`\n🏫 School API berjalan di http://localhost:${PORT}`);
	console.log(`📖 Dokumentasi endpoint: http://localhost:${PORT}/`);
	console.log(`\n🔑 Default login: admin / admin123\n`);
});
