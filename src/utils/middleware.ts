const express = require('express');
import type { NextFunction, Request, Response } from 'express';

function checkApiKey(req: Request, res: Response, next: NextFunction) {
	const key = req.headers['x-api-key'] as string | undefined;

	if (!key || key !== process.env.API_KEY) {
		return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
	}

	next();
}

module.exports = { checkApiKey };
