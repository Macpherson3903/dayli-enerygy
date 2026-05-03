/**
 * Honeypot field name for /contact. Avoids `website`, `url`, or `company` so
 * password managers and autofill rarely populate it (those caused silent 200s with no DB/email).
 */
export const CONTACT_HONEYPOT_FIELD = "dayli_nt_confirm_v1";
