import noblox = require('noblox.js');

async function getUserGroupInfo(userId: number, groupId: number) {
	const [username, rank, rankName] = await Promise.all([
		noblox.getUsernameFromId(userId),
		noblox.getRankInGroup(groupId, userId),
		noblox.getRankNameInGroup(groupId, userId),
	]);

	return { userId, username, rank, rankName };
}

module.exports = { getUserGroupInfo };
