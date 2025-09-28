async function sendWebhookLog(content: string, embed?: any) {
	try {
		await fetch(process.env.DISCORD_WEBHOOK_URL as string, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				content,
				embeds: embed ? [embed] : [],
			}),
		});
	} catch (err) {
		console.error('❌ Failed to send webhook log:', err);
	}
}

module.exports = { sendWebhookLog };
