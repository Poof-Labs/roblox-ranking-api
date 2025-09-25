import express = require('express');
import dotenv = require('dotenv');
import noblox = require('noblox.js');
const { getUserGroupInfo } = require('./utils/roblox');
const { checkApiKey } = require('./utils/middleware');

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
			`✅ Logged in as ${currentUser.displayName} (@${currentUser.name})`
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

	app.listen(PORT, () => {
		console.log(`🚀 API running at http://localhost:${PORT}`);
	});
}

startApp();
