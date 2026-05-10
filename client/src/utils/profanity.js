/**
 * Profanity-checking utilities.
 * Wraps the backend /api/profanity-check endpoint so every text input
 * and every displayed string can be validated / censored server-side.
 */

const API = "/api";

/**
 * Ask the server whether `text` contains profanity.
 * Returns `{ isProfane: boolean, censored: string }`.
 */
export async function checkProfanity(text) {
  if (!text || !text.trim()) return { isProfane: false, censored: text };
  try {
    const res = await fetch(`${API}/profanity-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return { isProfane: false, censored: text };
    return await res.json(); // { isProfane, censored }
  } catch {
    return { isProfane: false, censored: text };
  }
}

/**
 * Quick synchronous check: returns true if the text contains profanity.
 * Uses the async endpoint under the hood — callers must be async.
 */
export async function hasProfanity(text) {
  const result = await checkProfanity(text);
  return result.isProfane;
}

/**
 * Return a censored version of `text` (server-side censor).
 */
export async function censor(text) {
  const result = await checkProfanity(text);
  return result.censored;
}

/**
 * Validate a text field and return an error string (or empty string).
 * `fieldName` is used in the error message.
 */
export async function validateField(text, fieldName = "This field") {
  if (!text || !text.trim()) return `${fieldName} is required.`;
  const result = await checkProfanity(text);
  if (result.isProfane) return `${fieldName} contains inappropriate language.`;
  return "";
}