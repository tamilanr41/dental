import express from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { MongoClient } from "mongodb";

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
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
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
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const secretFile = path.join(DATA_DIR, "session-secret.txt");
if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(48).toString("hex"));
const SESSION_SECRET = process.env.SESSION_SECRET || fs.readFileSync(secretFile, "utf8").trim();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("MONGODB_URI is required. Add it to the API environment before starting the clinic server.");
const mongoClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10000 });
await mongoClient.connect();
const database = mongoClient.db(process.env.MONGODB_DB || undefined);
const users = database.collection("users");
const bookings = database.collection("bookings");
const siteContent = database.collection("site_content");
const counters = database.collection("counters");

await Promise.all([
  users.createIndex({ email: 1 }, { unique: true }),
  users.createIndex({ id: 1 }, { unique: true }),
  bookings.createIndex({ id: 1 }, { unique: true }),
  bookings.createIndex({ ref: 1 }, { unique: true }),
  bookings.createIndex({ date: 1, time: 1, status: 1 }),
  bookings.createIndex({ user_id: 1, date: -1, id: -1 }),
  siteContent.createIndex({ id: 1 }, { unique: true }),
  siteContent.createIndex({ type: 1, published: 1, display_order: 1, id: -1 }),
]);

async function nextId(collectionName) {
  const counter = await counters.findOneAndUpdate(
    { _id: collectionName },
    { $inc: { sequence_value: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return counter.sequence_value;
}

async function migrateSqliteData() {
  const migrationId = "sqlite-to-mongodb-v1";
  if (await database.collection("migrations").findOne({ _id: migrationId })) return;
  const sqlitePath = path.join(DATA_DIR, "clinic.db");
  if (!fs.existsSync(sqlitePath)) return;

  const legacy = new DatabaseSync(sqlitePath, { readOnly: true });
  try {
    const legacyUsers = legacy.prepare("SELECT * FROM users ORDER BY id").all();
    const legacyBookings = legacy.prepare("SELECT * FROM bookings ORDER BY id").all();
    let legacyContent = [];
    try {
      legacyContent = legacy.prepare("SELECT * FROM site_content ORDER BY id").all();
    } catch {
      // Older clinic databases predate managed website content.
    }
    for (const [collection, rows] of [[users, legacyUsers], [bookings, legacyBookings], [siteContent, legacyContent]]) {
      if (rows.length) {
        await collection.bulkWrite(rows.map((row) => ({
          updateOne: { filter: { id: row.id }, update: { $setOnInsert: row }, upsert: true },
        })));
      }
    }
    for (const name of ["users", "bookings", "site_content"]) {
      const latest = await database.collection(name).find({}).sort({ id: -1 }).limit(1).next();
      if (latest?.id) await counters.updateOne({ _id: name }, { $max: { sequence_value: latest.id } }, { upsert: true });
    }
    await database.collection("migrations").insertOne({ _id: migrationId, completedAt: new Date().toISOString() });
    console.log("Migrated " + legacyUsers.length + " users, " + legacyBookings.length + " bookings, and " + legacyContent.length + " content items from the local SQLite database.");
  } finally {
    legacy.close();
  }
}

await migrateSqliteData();

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

async function loadUser(id) {
  return users.findOne({ id: Number(id) });
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

async function currentUser(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  const session = readSession(token);
  if (!session) return null;
  const row = await loadUser(session.uid);
  if (!row || row.role !== session.role) return null;
  return row;
}

async function requireAuth(req, _res, next) {
  try {
    const user = await currentUser(req);
    if (!user) return next(new HttpError(401, "Please sign in to continue."));
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

async function requireAdmin(req, _res, next) {
  try {
    const user = await currentUser(req);
    if (!user) return next(new HttpError(401, "Please sign in to continue."));
    if (user.role !== "admin") return next(new HttpError(403, "Admin access only."));
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
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

async function activeBookingsAt(date, time, ignoreId = 0) {
  return bookings.countDocuments({
    date,
    time,
    status: { $nin: ["cancelled", "no_show"] },
    id: { $ne: ignoreId },
  });
}

async function validateSlot(date, time, ignoreId = 0) {
  const iso = validDate(date);
  if (!iso) throw new HttpError(400, "Please choose a valid date.");
  if (iso < todayISO()) throw new HttpError(400, "That date has already passed.");
  const weekday = new Date(iso + "T00:00:00").getDay();
  if (weekday === 0) throw new HttpError(400, "The clinic is closed on Sundays — please pick another day.");
  if (!SLOTS.includes(time)) throw new HttpError(400, "Please choose an available time slot.");
  if (await activeBookingsAt(iso, time, ignoreId) >= SLOT_CAPACITY) {
    throw new HttpError(409, "That time slot just filled up. Please pick another time.");
  }
  return iso;
}

async function makeRef(date) {
  const compact = date.slice(2).replace(/-/g, "");
  let ref;
  do {
    ref = "SC-" + compact + "-" + crypto.randomBytes(2).toString("hex").toUpperCase();
  } while (await bookings.findOne({ ref }, { projection: { _id: 1 } }));
  return ref;
}

async function createBooking({ user, patientName, patientPhone, patientEmail, service, date, time, dentist, notes, dob, source, status }) {
  const label = SERVICES[service];
  if (!label) throw new HttpError(400, "Please choose a valid service.");
  const iso = await validateSlot(date, time);
  if (dentist && !DENTISTS.includes(dentist)) throw new HttpError(400, "Please choose a valid dentist.");
  const stamp = nowISO();
  const row = {
    id: await nextId("bookings"),
    ref: await makeRef(iso),
    user_id: user?.id ?? null,
    patient_name: patientName,
    patient_phone: patientPhone,
    patient_email: patientEmail,
    service,
    service_label: label,
    date: iso,
    time,
    dentist: dentist || null,
    notes: notes || null,
    dob: dob || null,
    source: source || null,
    status,
    created_at: stamp,
    updated_at: stamp,
  };
  await bookings.insertOne(row);
  return row;
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
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
      res.setHeader("Vary", "Origin");
    }
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});
app.use(express.json({ limit: "64kb" }));

const SITE_CONTENT_TYPES = new Set(["hero", "blog", "offer", "reel", "video", "image", "badge"]);
const UPLOAD_MIME_EXTENSIONS = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["video/quicktime", ".mov"],
]);
function serializeSiteContent(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    mediaUrl: row.media_url,
    linkUrl: row.link_url,
    badgeText: row.badge_text,
    published: Boolean(row.published),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeContentInput(input, partial = false) {
  const body = input && typeof input === "object" ? input : {};
  const fields = {};
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);
  const takeText = (key, max, required = false) => {
    if (partial && !has(key)) return;
    const value = String(body[key] ?? "").trim();
    if (required && !value) throw new HttpError(400, "Please add a title.");
    if (value.length > max) throw new HttpError(400, "One of the content fields is too long.");
    fields[key] = value;
  };

  if (!partial || has("type")) {
    const type = String(body.type || "");
    if (!SITE_CONTENT_TYPES.has(type)) throw new HttpError(400, "Choose a valid content type.");
    fields.type = type;
  }
  takeText("title", 140, true);
  takeText("subtitle", 240);
  takeText("body", 6000);
  takeText("mediaUrl", 1000);
  takeText("linkUrl", 1000);
  takeText("badgeText", 80);

  if (!partial || has("published")) fields.published = body.published ? 1 : 0;
  if (!partial || has("displayOrder")) {
    const order = Number(body.displayOrder ?? 0);
    if (!Number.isInteger(order) || order < 0 || order > 9999) {
      throw new HttpError(400, "Display order must be a whole number between 0 and 9999.");
    }
    fields.displayOrder = order;
  }

  for (const key of ["mediaUrl", "linkUrl"]) {
    const value = fields[key];
    if (typeof value !== "string" || !value) continue;
    const isRelative = value.startsWith("/") && !value.startsWith("//");
    let isHttps = false;
    try {
      isHttps = new URL(value).protocol === "https:";
    } catch {
      isHttps = false;
    }
    if (!isRelative && !isHttps) throw new HttpError(400, "Links must use HTTPS or a site-relative path.");
  }
  return fields;
}

async function deleteUploadedMediaIfUnreferenced(mediaUrl) {
  const match = /^\/api\/media\/([a-f0-9-]{36}\.(?:jpg|png|webp|avif|gif|mp4|webm|mov))$/i.exec(String(mediaUrl || ""));
  if (!match) return;
  const used = await siteContent.countDocuments({ media_url: mediaUrl });
  if (!used) fs.rmSync(path.join(UPLOADS_DIR, match[1]), { force: true });
}

app.get("/api/content", async (req, res, next) => {
  try {
    const type = req.query.type ? String(req.query.type) : "";
    if (type && !SITE_CONTENT_TYPES.has(type)) throw new HttpError(400, "Choose a valid content type.");
    const query = { published: 1, ...(type ? { type } : {}) };
    const rows = await siteContent.find(query).sort({ type: 1, display_order: 1, id: -1 }).toArray();
    res.json({ items: rows.map(serializeSiteContent) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/content", requireAdmin, async (req, res, next) => {
  try {
    const type = req.query.type ? String(req.query.type) : "";
    if (type && !SITE_CONTENT_TYPES.has(type)) throw new HttpError(400, "Choose a valid content type.");
    const rows = await siteContent.find(type ? { type } : {}).sort({ type: 1, display_order: 1, id: -1 }).toArray();
    res.json({ items: rows.map(serializeSiteContent) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/content", requireAdmin, async (req, res, next) => {
  try {
    const fields = normalizeContentInput(req.body);
    const stamp = nowISO();
    const row = {
      id: await nextId("site_content"),
      type: fields.type,
      title: fields.title,
      subtitle: fields.subtitle,
      body: fields.body,
      media_url: fields.mediaUrl,
      link_url: fields.linkUrl,
      badge_text: fields.badgeText,
      published: fields.published,
      display_order: fields.displayOrder,
      created_at: stamp,
      updated_at: stamp,
    };
    await siteContent.insertOne(row);
    res.status(201).json({ item: serializeSiteContent(row) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/content/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "Choose a valid content item.");
    const previous = await siteContent.findOne({ id });
    if (!previous) throw new HttpError(404, "Content item not found.");
    const fields = normalizeContentInput(req.body, true);
    if (!Object.keys(fields).length) throw new HttpError(400, "Make a change before saving.");
    const update = {};
    for (const [key, value] of Object.entries(fields)) {
      const map = { mediaUrl: "media_url", linkUrl: "link_url", badgeText: "badge_text", displayOrder: "display_order" };
      update[map[key] || key] = value;
    }
    await siteContent.updateOne({ id }, { $set: { ...update, updated_at: nowISO() } });
    const row = await siteContent.findOne({ id });
    if (previous.media_url !== row.media_url) await deleteUploadedMediaIfUnreferenced(previous.media_url);
    res.json({ item: serializeSiteContent(row) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/content/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "Choose a valid content item.");
    const row = await siteContent.findOne({ id });
    if (!row) throw new HttpError(404, "Content item not found.");
    await siteContent.deleteOne({ id });
    await deleteUploadedMediaIfUnreferenced(row.media_url);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/admin/uploads",
  requireAdmin,
  express.raw({ type: "application/octet-stream", limit: "100mb" }),
  (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) throw new HttpError(400, "Choose a file to upload.");
      const mimeType = String(req.query.mime || "").toLowerCase();
      const extension = UPLOAD_MIME_EXTENSIONS.get(mimeType);
      if (!extension) throw new HttpError(415, "Upload a supported image or video file.");
      const fileName = crypto.randomUUID() + extension;
      fs.writeFileSync(path.join(UPLOADS_DIR, fileName), req.body, { flag: "wx" });
      res.status(201).json({ url: "/api/media/" + fileName, mimeType, size: req.body.length });
    } catch (error) {
      next(error);
    }
  },
);

app.get("/api/media/:fileName", (req, res, next) => {
  const fileName = String(req.params.fileName || "");
  if (!/^[a-f0-9-]{36}\.(?:jpg|png|webp|avif|gif|mp4|webm|mov)$/i.test(fileName)) {
    return res.status(404).json({ error: "Media file not found." });
  }
  const filePath = path.join(UPLOADS_DIR, fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Media file not found." });
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.sendFile(filePath, (error) => {
    if (error) next(error);
  });
});

app.get("/api/health", (_req, res) => res.json({ ok: true, time: nowISO() }));

app.get("/api/meta", (_req, res) => {
  res.json({
    services: Object.entries(SERVICES).map(([value, label]) => ({ value, label })),
    dentists: DENTISTS,
    slots: SLOTS,
    clinicWhatsapp: CLINIC_WHATSAPP,
  });
});

app.get("/api/availability", async (req, res, next) => {
  try {
    const iso = validDate(req.query.date);
    if (!iso) throw new HttpError(400, "Please choose a valid date.");
    if (iso < todayISO()) throw new HttpError(400, "That date has already passed.");
    const closed = new Date(iso + "T00:00:00").getDay() === 0;
    const rows = closed ? [] : await bookings.aggregate([
      { $match: { date: iso, status: { $nin: ["cancelled", "no_show"] } } },
      { $group: { _id: "$time", count: { $sum: 1 } } },
    ]).toArray();
    const taken = Object.fromEntries(rows.map((row) => [row._id, row.count]));
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

app.post("/api/auth/register", async (req, res, next) => {
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
    if (await users.findOne({ email })) throw new HttpError(409, "An account with this email already exists. Please sign in.");

    const user = {
      id: await nextId("users"),
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password_hash: hashPassword(password),
      role: "patient",
      created_at: nowISO(),
    };
    await users.insertOne(user);
    setSessionCookie(res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = await users.findOne({ email });
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

app.get("/api/auth/me", async (req, res, next) => {
  try {
    res.json({ user: publicUser(await currentUser(req)) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", requireAuth, async (req, res, next) => {
  try {
    const user = req.user;
    const body = req.body || {};
    const dentist = body.dentist ? String(body.dentist) : "";
    const duplicate = await bookings.findOne({
      user_id: user.id,
      date: validDate(body.date) || "",
      time: String(body.time || ""),
      status: { $in: ["pending", "confirmed"] },
    });
    if (duplicate) throw new HttpError(409, "You already have a booking at this time.");

    const row = await createBooking({
      user,
      patientName: user.first_name + " " + user.last_name,
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

app.get("/api/bookings/mine", requireAuth, async (req, res, next) => {
  try {
    const rows = await bookings.find({ user_id: req.user.id }).sort({ date: -1, id: -1 }).toArray();
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

app.patch("/api/bookings/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await bookings.findOne({ id });
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
      await validateSlot(date, time, row.id);
    }

    const nextStatus = status === "cancelled" ? "cancelled" : body.date || body.time ? "pending" : row.status;
    await bookings.updateOne({ id }, { $set: { date, time, status: nextStatus, updated_at: nowISO() } });
    const updated = await bookings.findOne({ id });
    res.json({ booking: serializeBooking(updated), whatsapp: { clinic: waLink(CLINIC_WHATSAPP, clinicText(updated)) } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/bookings", requireAdmin, async (req, res, next) => {
  try {
    const query = {};
    const status = String(req.query.status || "");
    if (status && STATUS_LABELS[status]) query.status = status;
    const date = validDate(req.query.date);
    if (date) query.date = date;
    const q = String(req.query.q || "").trim();
    if (q) {
      const literal = q.replace(/[.*+?^$|()[\]{}\\]/g, "\\$&");
      const search = new RegExp(literal, "i");
      query.$or = [
        { patient_name: search },
        { ref: search },
        { patient_phone: search },
        { service_label: search },
      ];
    }
    const rows = await bookings.find(query).toArray();
    rows.sort((left, right) => left.date === right.date
      ? slotIndex(left.time) - slotIndex(right.time)
      : right.date.localeCompare(left.date));
    res.json({ bookings: rows.map(bookingWithLinks) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/bookings", requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};
    const patientName = String(body.patientName || "").trim();
    if (!patientName) throw new HttpError(400, "Patient name is required.");
    const patientPhone = String(body.patientPhone || "").trim();
    if (digits(patientPhone).length < 10) throw new HttpError(400, "A valid patient phone number is required.");
    const patientEmail = String(body.patientEmail || "").trim().toLowerCase();
    const existing = patientEmail ? await users.findOne({ email: patientEmail }) : null;

    const row = await createBooking({
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

app.patch("/api/admin/bookings/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await bookings.findOne({ id });
    if (!row) throw new HttpError(404, "Booking not found.");

    const body = req.body || {};
    const status = body.status ? String(body.status) : row.status;
    if (!STATUS_LABELS[status]) throw new HttpError(400, "Unknown status.");
    const date = body.date ? validDate(body.date) : row.date;
    if (!date) throw new HttpError(400, "Please choose a valid date.");
    const time = body.time ? String(body.time) : row.time;
    if (date !== row.date || time !== row.time) await validateSlot(date, time, row.id);
    const dentist = body.dentist === undefined ? row.dentist : String(body.dentist);

    await bookings.updateOne({ id }, { $set: {
      date,
      time,
      dentist: dentist || null,
      status,
      notes: body.notes === undefined ? row.notes : String(body.notes),
      updated_at: nowISO(),
    } });
    const updated = await bookings.findOne({ id });
    res.json({ booking: bookingWithLinks(updated) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/summary", requireAdmin, async (_req, res, next) => {
  try {
    const today = todayISO();
    const week = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date();
      day.setDate(day.getDate() - offset);
      const iso = day.getFullYear() + "-" + String(day.getMonth() + 1).padStart(2, "0") + "-" + String(day.getDate()).padStart(2, "0");
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextIso = nextDay.getFullYear() + "-" + String(nextDay.getMonth() + 1).padStart(2, "0") + "-" + String(nextDay.getDate()).padStart(2, "0");
      const count = await bookings.countDocuments({
        created_at: { $gte: iso + "T00:00:00.000Z", $lt: nextIso + "T00:00:00.000Z" },
      });
      week.push({ date: iso, label: day.toLocaleDateString("en-IN", { weekday: "short" }), count });
    }

    const [todayRows, recentRows, recentPatients, pending, confirmed, checkedIn, completed, cancelled, patientCount, totalBookings] = await Promise.all([
      bookings.find({ date: today, status: { $ne: "cancelled" } }).toArray(),
      bookings.find({}).sort({ id: -1 }).limit(5).toArray(),
      users.find({ role: "patient" }).sort({ id: -1 }).limit(4).toArray(),
      bookings.countDocuments({ status: "pending" }),
      bookings.countDocuments({ status: "confirmed" }),
      bookings.countDocuments({ status: "checked_in" }),
      bookings.countDocuments({ status: "completed" }),
      bookings.countDocuments({ status: "cancelled" }),
      users.countDocuments({ role: "patient" }),
      bookings.countDocuments({}),
    ]);
    todayRows.sort((left, right) => slotIndex(left.time) - slotIndex(right.time));

    res.json({
      today,
      counts: {
        today: todayRows.length,
        pending,
        confirmed,
        checkedIn,
        completed,
        cancelled,
        patients: patientCount,
        totalBookings,
      },
      week,
      todaySchedule: todayRows.map(bookingWithLinks),
      queue: todayRows.filter((row) => row.status === "pending" || row.status === "confirmed").map(serializeBooking),
      recent: recentRows.map((row) => ({
        ...serializeBooking(row),
        whatsapp: { patient: waLink(row.patient_phone, patientText(row, "status")) },
      })),
      recentPatients: recentPatients.map((row) => ({
        id: row.id,
        name: row.first_name + " " + row.last_name,
        email: row.email,
        phone: row.phone,
        joinedAt: row.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/patients", requireAdmin, async (_req, res, next) => {
  try {
    const patientRows = await users.find({ role: "patient" }).sort({ id: -1 }).toArray();
    const patientIds = patientRows.map((row) => row.id);
    const patientBookings = patientIds.length ? await bookings.find({ user_id: { $in: patientIds } }).toArray() : [];
    const byUser = new Map();
    for (const booking of patientBookings) {
      const stats = byUser.get(booking.user_id) || { visits: 0, lastVisit: null };
      stats.visits += 1;
      if (booking.date <= todayISO() && (!stats.lastVisit || booking.date > stats.lastVisit)) stats.lastVisit = booking.date;
      byUser.set(booking.user_id, stats);
    }
    res.json({
      patients: patientRows.map((row) => {
        const stats = byUser.get(row.id) || { visits: 0, lastVisit: null };
        return {
          id: row.id,
          name: row.first_name + " " + row.last_name,
          email: row.email,
          phone: row.phone,
          visits: stats.visits,
          lastVisit: stats.lastVisit ? formatDate(stats.lastVisit) : null,
          joinedAt: row.created_at,
        };
      }),
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

async function seed() {
  const adminEmail = "admin@srisaraswathidental.com";
  const existing = await users.find({ role: "admin" }).sort({ id: 1 }).limit(1).next();
  if (existing) {
    if (existing.email === "admin@smilecaredental.com") {
      await users.updateOne({ id: existing.id }, { $set: {
        first_name: "Dr. Dinesh",
        last_name: "Kumar",
        email: adminEmail,
        phone: CLINIC.phone,
      } });
      console.log("Migrated admin account to: " + adminEmail);
    }
    return;
  }
  const password = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "Admin@12345");
  if (!password) {
    console.warn("No admin account was created. Set ADMIN_PASSWORD before the first production start.");
    return;
  }
  await users.insertOne({
    id: await nextId("users"),
    first_name: "Dr. Dinesh",
    last_name: "Kumar",
    email: adminEmail,
    phone: CLINIC.phone,
    password_hash: hashPassword(password),
    role: "admin",
    created_at: nowISO(),
  });
  console.log("Seeded admin account: " + adminEmail);
}

await seed();

app.listen(PORT, () => {
  console.log(CLINIC.name + " API running on http://localhost:" + PORT);
});
