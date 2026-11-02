/**
 * THE one place a WhatsApp link is built. Used by the floating button, the Contact page and anywhere else WhatsApp
 * appears. The number and message are edited in the admin (Settings) and arrive from the API as raw text.
 *
 * Returns https://wa.me/<digits>?text=<URL-encoded message>, or null when the number is not a real one yet
 * (for example the seeded "[placeholder]"). Callers hide the button/row when this returns null.
 */
export function whatsappDigits(number: string | null | undefined): string {
  return (number ?? '').replace(/\D/g, '');
}

export function whatsappUrl(number: string | null | undefined, message: string | null | undefined): string | null {
  const digits = whatsappDigits(number);
  // International numbers are 8-15 digits including the country code.
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent((message ?? '').trim())}`;
}

/** "+919544710055": the number as text, for showing it on the page. */
export function whatsappDisplay(number: string | null | undefined): string {
  return `+${whatsappDigits(number)}`;
}
