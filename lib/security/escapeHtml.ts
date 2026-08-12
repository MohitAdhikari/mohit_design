/**
 * Escapes HTML-significant characters in untrusted user input before it is
 * interpolated into an HTML email body. Prevents HTML/markup injection from
 * form fields (name, subject, message, email) that are echoed back into
 * admin notification emails.
 */
export function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
