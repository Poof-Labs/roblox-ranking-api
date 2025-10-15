"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noblox = require("noblox.js");
async function getUserGroupInfo(userId, groupId) {
    const [username, rank, rankName] = await Promise.all([
        noblox.getUsernameFromId(userId),
        noblox.getRankInGroup(groupId, userId),
        noblox.getRankNameInGroup(groupId, userId),
    ]);
    return { userId, username, rank, rankName };
}
module.exports = { getUserGroupInfo };
//# sourceMappingURL=roblox.js.map