import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Rate limiting map (simple in-memory solution)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 3; // 3 requests per minute

// HTML escaping function to prevent injection
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Rate limiting check
    const ip = clientAddress || 'unknown';
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip);

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= MAX_REQUESTS) {
          return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        userLimit.count++;
      } else {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    const data = await request.json();
    const { name, email, subject, message } = data;

    // Validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Type validation
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid field types' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Length validation
    if (name.length > 100 || email.length > 100 || message.length > 5000 || (subject && subject.length > 200)) {
      return new Response(JSON.stringify({ error: 'Field length exceeds maximum allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Trim whitespace
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const trimmedSubject = subject?.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return new Response(JSON.stringify({ error: 'Fields cannot be empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation (improved regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send email with Resend
    const contactEmail = import.meta.env.CONTACT_EMAIL || 'hello@erickchan.dev';

    // Escape HTML to prevent injection
    const safeName = escapeHtml(trimmedName);
    const safeEmail = escapeHtml(trimmedEmail);
    const safeSubject = trimmedSubject ? escapeHtml(trimmedSubject) : 'Sin asunto';
    const safeMessage = escapeHtml(trimmedMessage).replace(/\n/g, '<br>');

    await resend.emails.send({
      from: 'Erick Chan <noreply@erickchan.dev>',
      to: contactEmail,
      replyTo: trimmedEmail,
      subject: trimmedSubject || `Nuevo mensaje de ${trimmedName}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo mensaje desde erickchan.dev</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; border-left: 4px solid #007bff; padding: 20px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #007bff;">Nuevo mensaje desde erickchan.dev</h2>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #ddd;">
            <p style="margin: 10px 0;"><strong>Nombre:</strong> ${safeName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #007bff;">${safeEmail}</a></p>
            <p style="margin: 10px 0;"><strong>Asunto:</strong> ${safeSubject}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Mensaje:</strong></p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
              <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
            </div>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #f4f4f4; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">Este mensaje fue enviado desde el formulario de contacto en <a href="https://erickchan.dev" style="color: #007bff;">erickchan.dev</a></p>
          </div>
        </body>
        </html>
      `
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: 'Error sending email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
