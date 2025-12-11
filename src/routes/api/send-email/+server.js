import nodemailer from "nodemailer";
import { json } from "@sveltejs/kit";
import { GMAIL_USER, GMAIL_APP_PASSWORD, ALLOWED_ORIGIN } from "$env/static/private";


// Helper: escape for RegExp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ...existing code...

const templateModules = import.meta.glob("$lib/htmls/*.html", { as: "raw" });

async function loadHtmlTemplate(templateName, variables) {
    const filename = `${templateName}.html`;
    const match = Object.keys(templateModules).find((k) => k.endsWith(`/${filename}`) || k.endsWith(`\\${filename}`));

    if (!match) {
        console.error("Template loading error: no template found. Tried keys:", Object.keys(templateModules));
        throw new Error(`Template not found: ${filename}`);
    }

    const getRaw = templateModules[match];
    const html = await getRaw();

    let rendered = html;
    Object.entries(variables || {}).forEach(([key, value]) => {
        const safeKey = escapeRegExp(key);
        const re = new RegExp(`\\{${safeKey}\\}`, "g");
        rendered = rendered.replace(re, String(value ?? ""));
    });

    return rendered;
}


export async function POST({ request, url }) {
    // --- CORS PROTECTION ---
    const origin = request.headers.get("origin");

    if (!origin || origin !== ALLOWED_ORIGIN) {
        return new Response("Forbidden", { status: 403 });
    }

    // Validate JSON payload
    let data;
    try {
        data = await request.json();
    } catch {
        return json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { to, subject, template, variables } = data;

    if (!to || !subject || !template) {
        return json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- Load and render HTML template ---
    let html;
    try {
        html = await loadHtmlTemplate(template, variables || {});
    } catch (err) {
        return json({ error: err.message }, { status: 400 });
    }

    // --- Nodemailer Transport ---
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD
        }
    });

    try {
        await transporter.sendMail({
            from: GMAIL_USER,
            to,
            subject,
            html
        });

        return json({ success: true });
    } catch (err) {
        console.error("Email error:", err);
        return json({ error: "Email failed" }, { status: 500 });
    }
}

// --- HANDLE CORS PREFLIGHT ---
export function OPTIONS({ request }) {
    const origin = request.headers.get("origin");

    if (origin === ALLOWED_ORIGIN) {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            }
        });
    }

    return new Response("Forbidden", { status: 403 });
}