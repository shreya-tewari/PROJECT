const USERS_DB_KEY = "proposalai_users_db";
const OTP_STORE_KEY = "proposalai_otp_store";

function hashPassword(password) {
  const encoded = btoa(unescape(encodeURIComponent(password + "_proposalai_salt")));
  return encoded.split("").reverse().join("");
}
function verifyPassword(plain, hashed) { return hashPassword(plain) === hashed; }

export function getUsersDb() {
  try { const raw = localStorage.getItem(USERS_DB_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function saveUsersDb(users) {
  try { localStorage.setItem(USERS_DB_KEY, JSON.stringify(users)); }
  catch (e) { console.error("Failed to save users DB", e); }
}
export function emailExists(email) {
  return getUsersDb().some(u => u.email.toLowerCase() === email.toLowerCase().trim());
}
export function getUserByEmail(email) {
  return getUsersDb().find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
}
export function registerUser({ name, email, password, companyName }) {
  const users = getUsersDb();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim()))
    return { success: false, error: "An account with this email already exists. Please sign in instead." };
  const newUser = {
    id: `USR-${Date.now()}`, name: name.trim(),
    email: email.toLowerCase().trim(),
    companyName: companyName?.trim() || `${name.split(" ")[0]}'s Account`,
    passwordHash: hashPassword(password), role: "Enterprise Client",
    createdAt: new Date().toISOString(), verified: false
  };
  users.push(newUser); saveUsersDb(users);
  return { success: true, user: newUser };
}
export function markUserVerified(email) {
  const users = getUsersDb();
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (idx !== -1) { users[idx].verified = true; saveUsersDb(users); return users[idx]; }
  return null;
}
export function loginUser({ email, password }) {
  const user = getUserByEmail(email);
  if (!user) return { success: false, error: "No account found with this email. Please sign up first." };
  if (!verifyPassword(password, user.passwordHash)) return { success: false, error: "Incorrect password. Please try again." };
  if (!user.verified) return { success: false, error: "Email not verified. Please complete OTP verification.", requiresVerification: true, userEmail: email };
  return { success: true, user };
}
export function generateOtp() { return Math.floor(100000 + Math.random() * 900000).toString(); }
export function storeOtp(email, otp) {
  try {
    const store = JSON.parse(sessionStorage.getItem(OTP_STORE_KEY) || "{}");
    store[email.toLowerCase().trim()] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    sessionStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
  } catch (e) { console.error("Failed to store OTP", e); }
}
export function verifyOtp(email, inputOtp) {
  try {
    const store = JSON.parse(sessionStorage.getItem(OTP_STORE_KEY) || "{}");
    const entry = store[email.toLowerCase().trim()];
    if (!entry) return { valid: false, error: "OTP not found. Please request a new one." };
    if (Date.now() > entry.expiresAt) return { valid: false, error: "OTP has expired. Please request a new one." };
    if (entry.otp !== inputOtp.trim()) return { valid: false, error: "Incorrect OTP. Please check your email and try again." };
    delete store[email.toLowerCase().trim()];
    sessionStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
    return { valid: true };
  } catch { return { valid: false, error: "OTP verification failed. Please try again." }; }
}
export function clearOtp(email) {
  try {
    const store = JSON.parse(sessionStorage.getItem(OTP_STORE_KEY) || "{}");
    delete store[email.toLowerCase().trim()];
    sessionStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
  } catch {}
}
export async function sendOtpEmail(email, name, otp) {
  const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
  const serviceId = env.VITE_EMAILJS_SERVICE_ID || "";
  const templateId = env.VITE_EMAILJS_TEMPLATE_ID || "";
  const publicKey = env.VITE_EMAILJS_PUBLIC_KEY || "";
  if (serviceId && templateId && publicKey) {
    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: publicKey,
          template_params: { to_name: name, to_email: email, otp_code: otp, expiry_minutes: "10" }})
      });
      if (res.ok) return { sent: true, demoMode: false };
    } catch {}
  }
  console.info(`[DEMO MODE] OTP for ${email}: ${otp}`);
  return { sent: true, demoMode: true, demoOtp: otp };
}
