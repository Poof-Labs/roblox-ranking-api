import express = require('express');
import dotenv = require('dotenv');
import noblox = require('noblox.js');
import getPlayerThumbnail = require('noblox.js');
import getAvatar = require('noblox.js');
const { getUserGroupInfo } = require('./utils/roblox');
const { checkApiKey } = require('./utils/middleware');
const { sendWebhookLog } = require('./utils/webhookLog');
const { getAvatarUrl } = require('./utils/getAvatarUrl');

dotenv.config();
const app = express();
app.use(express.json());

const PORT = 3000;
const groupId = 35544076;

async function startApp() {
	try {
		const currentUser = await noblox.setCookie(
			process.env.ROBLOX_COOKIE as string
		);
		console.log(
			`✅ Logged in as ${currentUser.displayName} (@${currentUser.name} | ${currentUser.id})`
		);
	} catch (err) {
		console.error('❌ Failed to login with cookie:', err);
		process.exit(1);
	}

	// Get user info
	app.get('/rank/:userId', checkApiKey, async (req, res) => {
		try {
			const userId = Number(req.params.userId);
			const info = await getUserGroupInfo(userId, groupId);
			res.json(info);
		} catch (err) {
			res.status(500).json({ error: String(err) });
		}
	});

	// Promote
	app.post('/promote/:userId', checkApiKey, async (req, res) => {
		try {
			const userId = Number(req.params.userId);
			const newRole = await noblox.promote(groupId, userId);
			const info = await getUserGroupInfo(userId, groupId);
			res.json({ success: true, newRole, info });
		} catch (err) {
			res.status(500).json({ error: String(err) });
		}
	});

	// Demote
	app.post('/demote/:userId', checkApiKey, async (req, res) => {
		try {
			const userId = Number(req.params.userId);
			const newRole = await noblox.demote(groupId, userId);
			const info = await getUserGroupInfo(userId, groupId);
			res.json({ success: true, newRole, info });
		} catch (err) {
			res.status(500).json({ error: String(err) });
		}
	});

	app.post('/set/:userId', checkApiKey, async (req, res) => {
		try {
			const { userId: userIdParam } = req.params;
			const { rankName, reason, moderator } = req.body;

			if (!rankName || !reason || !moderator) {
				return res.status(400).json({ error: 'Missing required fields' });
			}

			const userId = Number(userIdParam);
			if (isNaN(userId)) {
				return res.status(400).json({ error: 'Invalid userId' });
			}

			const oldInfo = await getUserGroupInfo(userId, groupId);
			const oldRankName = oldInfo?.rankName || null;

			const roles = await noblox.getRoles(groupId);
			const role = roles.find(
				(r) => r.name.toLowerCase() === rankName.toLowerCase()
			);
			if (!role) {
				return res.status(400).json({ error: `Rank '${rankName}' not found` });
			}

			const newRole = await noblox.setRank(groupId, userId, role.rank);
			const info = await getUserGroupInfo(userId, groupId);

			const avatarUrl = await getAvatarUrl(userId);

			const embedData = {
				title: 'Rank Change',
				color: 0x27f561,
				fields: [
					{ name: 'User ID', value: userId.toString(), inline: true },
					{ name: 'Username', value: info.username, inline: true },
					{ name: 'Old Rank', value: oldRankName ?? 'Unknown', inline: true },
					{ name: 'New Rank', value: info.rankName, inline: true },
					{ name: 'Reason', value: `\`\`\`${reason}\`\`\`` },
				],
				timestamp: new Date().toISOString(),
				// Only add thumbnail property if avatarUrl is not null
				...(avatarUrl && { thumbnail: { url: avatarUrl } }),
			};

			await sendWebhookLog(
				`Rank change executed by **${moderator}**`,
				embedData
			);

			res.json({ success: true, newRole, oldRankName, info });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	});

	app.listen(PORT, () => {
		console.log(`🚀 API running at http://localhost:${PORT}`);
	});
}

startApp();
