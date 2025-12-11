import nodemailer from "nodemailer";
import { json } from "@sveltejs/kit";
import { GMAIL_USER, GMAIL_APP_PASSWORD, ALLOWED_ORIGIN } from "$env/static/private";

import { readFile } from "fs/promises";
import path from "path";

// Helper: escape for RegExp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// ...existing code...

// Helper function to load and render HTML template (read from disk)
// Tries common candidate paths and reports which were attempted when missing.
async function loadHtmlTemplate(templateName, variables) {
    const candidates = [
        path.join(process.cwd(), "lib", "htmls", `${templateName}.html`),
        path.join(process.cwd(), "src", "lib", "htmls", `${templateName}.html`)
    ];

    let lastErr;
    for (const candidatePath of candidates) {
        try {
            const html = await readFile(candidatePath, "utf8");

            let rendered = html;
            Object.entries(variables || {}).forEach(([key, value]) => {
                const safeKey = escapeRegExp(key);
                const re = new RegExp(`\\{${safeKey}\\}`, "g");
                rendered = rendered.replace(re, String(value ?? ""));
            });

            return rendered;
        } catch (err) {
            lastErr = err;
        }
    }

    console.error("Template loading error: no template found. Tried paths:", candidates, "last error:", lastErr);
    throw new Error(`Template not found. Tried paths:\n${candidates.join("\n")}`);
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