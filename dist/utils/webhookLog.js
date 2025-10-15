"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function sendWebhookLog(content, embed) {
    try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,
                embeds: embed ? [embed] : [],
            }),
        });
    }
    catch (err) {
        console.error('❌ Failed to send webhook log:', err);
    }
}
module.exports = { sendWebhookLog };
//# sourceMappingURL=webhookLog.js.map