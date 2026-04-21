const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Task Tracker <onboarding@resend.dev>";

export const sendEmail = async ({ to, subject, html, text }) => {
    if (!RESEND_API_KEY) {
        return {
            delivered: false,
            provider: "preview",
            preview: {
                to,
                subject,
                html,
                text,
            },
        };
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: EMAIL_FROM,
            to,
            subject,
            html,
            text,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Email delivery failed: ${errorText}`);
    }

    const data = await response.json();

    return {
        delivered: true,
        provider: "resend",
        id: data.id,
    };
};
