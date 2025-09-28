async function getAvatarUrl(userId: number): Promise<string | null> {
	try {
		const res = await fetch(
			`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false&thumbnailType=HeadShot`
		);
		const data = await res.json();
		return data?.data?.[0]?.imageUrl || null;
	} catch (err) {
		console.error('❌ Failed to fetch avatar thumbnail:', err);
		return null;
	}
}

module.exports = { getAvatarUrl };
