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

const PORT = 2201;
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

			const moderatorRobloxId = await noblox.getIdFromUsername(moderator);
			const moderatorThumbnails = await noblox.getThumbnails([
				{
					targetId: Number(moderatorRobloxId),
					type: 'AvatarHeadShot',
					size: '150x150',
					isCircular: true,
				},
			]);
			const moderatorAvatarUrl = moderatorThumbnails[0]?.imageUrl;

			const embedData = {
				color: 0x27f561,
				author: {
					name: `Rank Change Executed by ${moderator}`,
					icon_url:
						moderatorAvatarUrl || 'https://cdn1.novaverse.cc/placeholder.png',
					url: `https://www.roblox.com/users/${moderatorRobloxId}/profile`,
				},
				title: `${info.username} (${userId})`,
				url: `https://www.roblox.com/users/${userId}/profile`,
				thumbnail: avatarUrl
					? { url: avatarUrl }
					: 'https://cdn1.novaverse.cc/placeholder.png',
				fields: [
					{ name: 'Old Rank', value: oldRankName ?? 'Unknown', inline: true },
					{ name: 'New Rank', value: info.rankName, inline: true },
					{
						name: 'Reason',
						value: reason ? `\`\`\`${reason}\`\`\`` : 'No reason provided',
					},
				],
				footer: {
					text: `Rank change executed at`,
				},
				timestamp: new Date().toISOString(),
			};

			await sendWebhookLog(``, embedData);

			res.json({ success: true, newRole, oldRankName, info });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	});

	app.listen(PORT, '0.0.0.0', () => {
		console.log(`🚀 API running at http://localhost:${PORT}`);
	});
}

startApp();
