import express from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4101);

const CLINIC = {
  name: "Sri Saraswathi Dental Clinic",
  shortName: "Sri Saraswathi",
  address: "866, Soli Complex, Surampatti Four Rd, Erode, Tamil Nadu 638009",
  phone: "0424 427 2494",
  whatsapp: "+91 93457 43409",
  maps: "https://share.google/Izecs47hnhjCpmBBs",
};

const CLINIC_WHATSAPP = process.env.CLINIC_WHATSAPP || "919345743409";
const DATA_DIR = path.join(__dirname, "data");
const COOKIE_NAME = "sc_session";
const SESSION_DAYS = 7;
const SLOT_CAPACITY = 2;
const ALLOWED_ORIGINS = new Set(
  (process.env.CORS_ORIGINS || process.env.SITE_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
);

fs.mkdirSync(DATA_DIR, { recursive: true });

const secretFile = path.join(DATA_DIR, "session-secret.txt");
if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(48).toString("hex"));
const SESSION_SECRET = fs.readFileSync(secretFile, "utf8").trim();

const db = new DatabaseSync(path.join(DATA_DIR, "clinic.db"));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref TEXT NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id),
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT NOT NULL,
    service TEXT NOT NULL,
    service_label TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    dentist TEXT,
    notes TEXT,
    dob TEXT,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','checked_in','completed','cancelled','no_show')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
  CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
`);

/* ---------------------------------------------------------------- helpers */

const SERVICES = {
  "general-dentistry": "General Check-up & Cleaning",
  "cosmetic-dentistry": "Cosmetic Dentistry",
  "teeth-whitening": "Teeth Whitening",
  "dental-implants": "Dental Implants",
  orthodontics: "Orthodontics (Braces / Aligners)",
  "root-canal": "Root Canal Treatment",
  "pediatric-dentistry": "Pediatric Dentistry",
  "gum-treatment": "Gum Treatment",
  "wisdom-tooth": "Wisdom Tooth Extraction",
  "crowns-bridges": "Crowns & Bridges",
  veneers: "Veneers",
  dentures: "Dentures",
  "smile-makeover": "Smile Makeover",
  emergency: "Emergency Visit",
  consultation: "Free Consultation",
};

const SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM",
  "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
];

const STATUS_LABELS = {
  pending: "Pending confirmation",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const DENTISTS = ["Dr. Dinesh Kumar"];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const nowISO = () => new Date().toISOString();

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return value;
}

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const digits = (phone) => String(phone || "").replace(/\D/g, "").replace(/^0+/, "");

function waNumber(phone) {
  const d = digits(phone);
  if (!d) return "";
  if (d.length === 10) return `91${d}`;
  if (d.length === 11 && d.startsWith("0")) return `91${d.slice(1)}`;
  return d;
}

const waLink = (phone, text) => {
  const number = waNumber(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
};

function clinicText(booking) {
  return [
    `New booking ${booking.ref}`,
    `Patient: ${booking.patient_name}`,
    `Phone: ${booking.patient_phone}`,
    `Email: ${booking.patient_email}`,
    `Service: ${booking.service_label}`,
    `When: ${formatDate(booking.date)} at ${booking.time}`,
    booking.dentist ? `Dentist: ${booking.dentist}` : null,
    booking.notes ? `Notes: ${booking.notes}` : null,
    `Status: ${STATUS_LABELS[booking.status]}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function patientText(booking, kind) {
  const first = booking.patient_name.split(" ")[0];
  if (kind === "confirmation") {
    return [
      `Hi ${first}, your ${CLINIC.name} appointment is booked.`,
      `Ref: ${booking.ref}`,
      `Service: ${booking.service_label}`,
      `Date: ${formatDate(booking.date)} at ${booking.time}`,
      `Dentist: ${booking.dentist || "First available dentist"}`,
      `Address: ${CLINIC.address}`,
      `Phone: ${CLINIC.phone}`,
      `Map: ${CLINIC.maps}`,
      "Reply here for any changes. See you soon!",
    ].join("\n");
  }
  return [
    `Hi ${first}, update on ${booking.ref} (${booking.service_label}) on ${formatDate(booking.date)} at ${booking.time}.`,
    `Your appointment is now: ${STATUS_LABELS[booking.status]}.`,
    booking.status === "cancelled" ? "If this was a mistake, reply here and we'll rebook you." : null,
    `— ${CLINIC.name}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/* ------------------------------------------------------------------- auth */

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored).split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");

function signSession(user) {
  const payload = b64url(
    JSON.stringify({ uid: user.id, role: user.role, exp: Date.now() + SESSION_DAYS * 864e5 }),
  );
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function readSession(token) {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

const publicUser = (row) =>
  row && {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
  };

function loadUser(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function setSessionCookie(res, user) {
  const token = signSession(user);
  const attributes = process.env.NODE_ENV === "production" ? "; Secure; SameSite=None" : "; SameSite=Lax";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly${attributes}; Path=/; Max-Age=${SESSION_DAYS * 86400}`,
  );
}

function clearSessionCookie(res) {
  const attributes = process.env.NODE_ENV === "production" ? "; Secure; SameSite=None" : "; SameSite=Lax";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly${attributes}; Path=/; Max-Age=0`);
}

function currentUser(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  const session = readSession(token);
  if (!session) return null;
  const row = loadUser(session.uid);
  if (!row || row.role !== session.role) return null;
  return row;
}

function requireAuth(req, _res, next) {
  const user = currentUser(req);
  if (!user) return next(new HttpError(401, "Please sign in to continue."));
  req.user = user;
  next();
}

function requireAdmin(req, _res, next) {
  const user = currentUser(req);
  if (!user) return next(new HttpError(401, "Please sign in to continue."));
  if (user.role !== "admin") return next(new HttpError(403, "Admin access only."));
  req.user = user;
  next();
}

/* --------------------------------------------------------------- bookings */

const slotIndex = (time) => {
  const index = SLOTS.indexOf(time);
  return index === -1 ? 99 : index;
};

function serializeBooking(row) {
  return {
    id: row.id,
    ref: row.ref,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientEmail: row.patient_email,
    service: row.service,
    serviceLabel: row.service_label,
    date: row.date,
    dateLabel: formatDate(row.date),
    time: row.time,
    dentist: row.dentist || "First available",
    notes: row.notes || "",
    status: row.status,
    statusLabel: STATUS_LABELS[row.status],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function bookingWithLinks(row) {
  const booking = serializeBooking(row);
  return {
    ...booking,
    whatsapp: {
      patient: waLink(row.patient_phone, patientText(row, booking.status === "pending" ? "confirmation" : "status")),
      clinic: waLink(CLINIC_WHATSAPP, clinicText(row)),
    },
  };
}

function activeBookingsAt(date, time, ignoreId = 0) {
  return db
    .prepare(
      "SELECT COUNT(*) AS count FROM bookings WHERE date = ? AND time = ? AND status NOT IN ('cancelled','no_show') AND id != ?",
    )
    .get(date, time, ignoreId).count;
}

function validateSlot(date, time, ignoreId = 0) {
  const iso = validDate(date);
  if (!iso) throw new HttpError(400, "Please choose a valid date.");
  if (iso < todayISO()) throw new HttpError(400, "That date has already passed.");
  const weekday = new Date(`${iso}T00:00:00`).getDay();
  if (weekday === 0) throw new HttpError(400, "The clinic is closed on Sundays — please pick another day.");
  if (!SLOTS.includes(time)) throw new HttpError(400, "Please choose an available time slot.");
  if (activeBookingsAt(iso, time, ignoreId) >= SLOT_CAPACITY) {
    throw new HttpError(409, "That time slot just filled up. Please pick another time.");
  }
  return iso;
}

function makeRef(date) {
  const compact = date.slice(2).replace(/-/g, "");
  let ref;
  do {
    ref = `SC-${compact}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
  } while (db.prepare("SELECT 1 FROM bookings WHERE ref = ?").get(ref));
  return ref;
}

function createBooking({ user, patientName, patientPhone, patientEmail, service, date, time, dentist, notes, dob, source, status }) {
  const label = SERVICES[service];
  if (!label) throw new HttpError(400, "Please choose a valid service.");
  const iso = validateSlot(date, time);
  if (dentist && !DENTISTS.includes(dentist)) throw new HttpError(400, "Please choose a valid dentist.");
  const stamp = nowISO();
  const ref = makeRef(iso);

  const info = db
    .prepare(
      `INSERT INTO bookings (ref, user_id, patient_name, patient_phone, patient_email, service, service_label, date, time, dentist, notes, dob, source, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      ref,
      user?.id ?? null,
      patientName,
      patientPhone,
      patientEmail,
      service,
      label,
      iso,
      time,
      dentist || null,
      notes || null,
      dob || null,
      source || null,
      status,
      stamp,
      stamp,
    );

  return db.prepare("SELECT * FROM bookings WHERE id = ?").get(info.lastInsertRowid);
}

/* ------------------------------------------------------------------ app */

const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (ALLOWED_ORIGINS.size === 0 && process.env.NODE_ENV === "production") {
      return res.status(503).json({ error: "Clinic API setup is incomplete. Please contact the clinic." });
    }
    if (ALLOWED_ORIGINS.size > 0 && !ALLOWED_ORIGINS.has(normalizedOrigin)) {
      return res.status(403).json({ error: "This site is not allowed to access the clinic API." });
    }
    if (ALLOWED_ORIGINS.has(normalizedOrigin)) {
      res.setHeader("Access-Control-Allow-Origin", normalizedOrigin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
      res.setHeader("Vary", "Origin");
    }
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, time: nowISO() }));

app.get("/api/meta", (_req, res) => {
  res.json({
    services: Object.entries(SERVICES).map(([value, label]) => ({ value, label })),
    dentists: DENTISTS,
    slots: SLOTS,
    clinicWhatsapp: CLINIC_WHATSAPP,
  });
});

app.get("/api/availability", (req, res, next) => {
  try {
    const iso = validDate(req.query.date);
    if (!iso) throw new HttpError(400, "Please choose a valid date.");
    if (iso < todayISO()) throw new HttpError(400, "That date has already passed.");
    const closed = new Date(`${iso}T00:00:00`).getDay() === 0;
    const rows = closed
      ? []
      : db
          .prepare(
            "SELECT time, COUNT(*) AS count FROM bookings WHERE date = ? AND status NOT IN ('cancelled','no_show') GROUP BY time",
          )
          .all(iso);
    const taken = Object.fromEntries(rows.map((row) => [row.time, row.count]));
    res.json({
      date: iso,
      closed,
      slots: SLOTS.map((time) => ({
        time,
        remaining: Math.max(0, SLOT_CAPACITY - (taken[time] || 0)),
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/register", (req, res, next) => {
  try {
    const body = req.body || {};
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");

    if (!firstName || !lastName) throw new HttpError(400, "Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(400, "Please enter a valid email address.");
    const phoneDigits = digits(phone);
    if (phoneDigits.length < 10 || phoneDigits.length > 13) throw new HttpError(400, "Please enter a valid mobile number.");
    if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters.");

    if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
      throw new HttpError(409, "An account with this email already exists. Please sign in.");
    }

    const info = db
      .prepare(
        "INSERT INTO users (first_name, last_name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, 'patient', ?)",
      )
      .run(firstName, lastName, email, phone, hashPassword(password), nowISO());

    const user = loadUser(info.lastInsertRowid);
    setSessionCookie(res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", (req, res, next) => {
  try {
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      throw new HttpError(401, "Invalid email or password.");
    }
    setSessionCookie(res, user);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: publicUser(currentUser(req)) });
});

app.post("/api/bookings", requireAuth, (req, res, next) => {
  try {
    const user = req.user;
    const body = req.body || {};
    const dentist = body.dentist ? String(body.dentist) : "";
    const duplicate = db
      .prepare(
        `SELECT 1 FROM bookings WHERE user_id = ? AND date = ? AND time = ? AND status IN ('pending','confirmed')`,
      )
      .get(user.id, validDate(body.date) || "", String(body.time || ""));
    if (duplicate) throw new HttpError(409, "You already have a booking at this time.");

    const row = createBooking({
      user,
      patientName: `${user.first_name} ${user.last_name}`,
      patientPhone: String(body.phone || user.phone),
      patientEmail: String(body.email || user.email),
      service: String(body.service || ""),
      date: String(body.date || ""),
      time: String(body.time || ""),
      dentist,
      notes: String(body.notes || ""),
      dob: String(body.dob || ""),
      source: String(body.source || ""),
      status: "pending",
    });

    res.status(201).json({ booking: bookingWithLinks(row) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/bookings/mine", requireAuth, (req, res, next) => {
  try {
    const rows = db
      .prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY date DESC, id DESC")
      .all(req.user.id);
    res.json({
      bookings: rows.map((row) => ({
        ...serializeBooking(row),
        whatsapp: { clinic: waLink(CLINIC_WHATSAPP, clinicText(row)) },
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/bookings/:id", requireAuth, (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
    if (!row || row.user_id !== req.user.id) throw new HttpError(404, "Booking not found.");
    if (row.status === "completed" || row.status === "cancelled") {
      throw new HttpError(400, "This appointment can no longer be changed. Please book a new visit.");
    }

    const body = req.body || {};
    const status = body.status ? String(body.status) : null;
    if (status && status !== "cancelled") throw new HttpError(403, "You can only cancel an appointment here.");

    let date = row.date;
    let time = row.time;
    if (body.date || body.time) {
      date = body.date ? String(body.date) : row.date;
      time = body.time ? String(body.time) : row.time;
      validateSlot(date, time, row.id);
    }

    const nextStatus = status === "cancelled" ? "cancelled" : body.date || body.time ? "pending" : row.status;
    db.prepare("UPDATE bookings SET date = ?, time = ?, status = ?, updated_at = ? WHERE id = ?").run(
      date,
      time,
      nextStatus,
      nowISO(),
      id,
    );

    const updated = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
    res.json({ booking: serializeBooking(updated), whatsapp: { clinic: waLink(CLINIC_WHATSAPP, clinicText(updated)) } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/bookings", requireAdmin, (req, res, next) => {
  try {
    const params = [];
    const where = [];
    const status = String(req.query.status || "");
    if (status && STATUS_LABELS[status]) {
      where.push("status = ?");
      params.push(status);
    }
    const date = validDate(req.query.date);
    if (date) {
      where.push("date = ?");
      params.push(date);
    }
    const q = String(req.query.q || "").trim();
    if (q) {
      where.push("(patient_name LIKE ? OR ref LIKE ? OR patient_phone LIKE ? OR service_label LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    const rows = db
      .prepare(`SELECT * FROM bookings ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`)
      .all(...params);
    rows.sort((a, b) => (a.date === b.date ? slotIndex(a.time) - slotIndex(b.time) : b.date.localeCompare(a.date)));
    res.json({ bookings: rows.map(bookingWithLinks) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/bookings", requireAdmin, (req, res, next) => {
  try {
    const body = req.body || {};
    const patientName = String(body.patientName || "").trim();
    if (!patientName) throw new HttpError(400, "Patient name is required.");
    const patientPhone = String(body.patientPhone || "").trim();
    if (digits(patientPhone).length < 10) throw new HttpError(400, "A valid patient phone number is required.");
    const patientEmail = String(body.patientEmail || "").trim().toLowerCase();

    const existing = patientEmail
      ? db.prepare("SELECT * FROM users WHERE email = ?").get(patientEmail)
      : null;

    const row = createBooking({
      user: existing || null,
      patientName,
      patientPhone,
      patientEmail,
      service: String(body.service || ""),
      date: String(body.date || ""),
      time: String(body.time || ""),
      dentist: body.dentist ? String(body.dentist) : "",
      notes: String(body.notes || ""),
      status: "confirmed",
    });
    res.status(201).json({ booking: bookingWithLinks(row) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/bookings/:id", requireAdmin, (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
    if (!row) throw new HttpError(404, "Booking not found.");

    const body = req.body || {};
    const status = body.status ? String(body.status) : row.status;
    if (!STATUS_LABELS[status]) throw new HttpError(400, "Unknown status.");

    let date = body.date ? validDate(body.date) : row.date;
    if (!date) throw new HttpError(400, "Please choose a valid date.");
    const time = body.time ? String(body.time) : row.time;
    if (date !== row.date || time !== row.time) validateSlot(date, time, row.id);
    const dentist = body.dentist === undefined ? row.dentist : String(body.dentist);

    db.prepare(
      "UPDATE bookings SET date = ?, time = ?, dentist = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?",
    ).run(
      date,
      time,
      dentist || null,
      status,
      body.notes === undefined ? row.notes : String(body.notes),
      nowISO(),
      id,
    );

    const updated = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
    res.json({ booking: bookingWithLinks(updated) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/summary", requireAdmin, (_req, res, next) => {
  try {
    const today = todayISO();
    const count = (sql, ...params) => db.prepare(sql).get(...params).count;
    const week = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date();
      day.setDate(day.getDate() - offset);
      const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const row = db
        .prepare("SELECT COUNT(*) AS count FROM bookings WHERE substr(created_at, 1, 10) = ?")
        .get(iso);
      week.push({
        date: iso,
        label: day.toLocaleDateString("en-IN", { weekday: "short" }),
        count: row.count,
      });
    }

    const todayRows = db
      .prepare("SELECT * FROM bookings WHERE date = ? AND status != 'cancelled'")
      .all(today);
    todayRows.sort((a, b) => slotIndex(a.time) - slotIndex(b.time));

    const recentRows = db.prepare("SELECT * FROM bookings ORDER BY id DESC LIMIT 5").all();
    const recentPatients = db
      .prepare("SELECT * FROM users WHERE role = 'patient' ORDER BY id DESC LIMIT 4")
      .all();

    res.json({
      today,
      counts: {
        today: todayRows.length,
        pending: count("SELECT COUNT(*) AS count FROM bookings WHERE status = 'pending'"),
        confirmed: count("SELECT COUNT(*) AS count FROM bookings WHERE status = 'confirmed'"),
        checkedIn: count("SELECT COUNT(*) AS count FROM bookings WHERE status = 'checked_in'"),
        completed: count("SELECT COUNT(*) AS count FROM bookings WHERE status = 'completed'"),
        cancelled: count("SELECT COUNT(*) AS count FROM bookings WHERE status = 'cancelled'"),
        patients: count("SELECT COUNT(*) AS count FROM users WHERE role = 'patient'"),
        totalBookings: count("SELECT COUNT(*) AS count FROM bookings"),
      },
      week,
      todaySchedule: todayRows.map(bookingWithLinks),
      queue: todayRows
        .filter((row) => row.status === "pending" || row.status === "confirmed")
        .map(serializeBooking),
      recent: recentRows.map((row) => ({
        ...serializeBooking(row),
        whatsapp: { patient: waLink(row.patient_phone, patientText(row, "status")) },
      })),
      recentPatients: recentPatients.map((row) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        email: row.email,
        phone: row.phone,
        joinedAt: row.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/patients", requireAdmin, (_req, res, next) => {
  try {
    const rows = db
      .prepare(
        `SELECT u.*,
                (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) AS visits,
                (SELECT MAX(b.date) FROM bookings b WHERE b.user_id = u.id AND b.date <= ?) AS last_visit
         FROM users u WHERE u.role = 'patient' ORDER BY u.id DESC`,
      )
      .all(todayISO());
    res.json({
      patients: rows.map((row) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        email: row.email,
        phone: row.phone,
        visits: row.visits,
        lastVisit: row.last_visit ? formatDate(row.last_visit) : null,
        joinedAt: row.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

const distDir = path.resolve(__dirname, "../dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distDir, "index.html"));
    }
    return next();
  });
}

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: error.message || "Something went wrong." });
});

function seed() {
  const adminEmail = "admin@srisaraswathidental.com";
  const existing = db.prepare("SELECT id, email FROM users WHERE role = 'admin' ORDER BY id LIMIT 1").get();
  if (existing) {
    if (existing.email === "admin@smilecaredental.com") {
      db.prepare(
        "UPDATE users SET first_name = 'Dr. Dinesh', last_name = 'Kumar', email = ?, phone = ? WHERE id = ?",
      ).run(adminEmail, CLINIC.phone, existing.id);
      console.log(`Migrated admin account to: ${adminEmail}`);
    }
    return;
  }
  const password = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "Admin@12345");
  if (!password) {
    console.warn("No admin account was created. Set ADMIN_PASSWORD before the first production start.");
    return;
  }
  db.prepare(
    "INSERT INTO users (first_name, last_name, email, phone, password_hash, role, created_at) VALUES ('Dr. Dinesh', 'Kumar', ?, ?, ?, 'admin', ?)",
  ).run(adminEmail, CLINIC.phone, hashPassword(password), nowISO());
  console.log(`Seeded admin account: ${adminEmail}`);
}

seed();

app.listen(PORT, () => {
  console.log(`${CLINIC.name} API running on http://localhost:${PORT}`);
});
