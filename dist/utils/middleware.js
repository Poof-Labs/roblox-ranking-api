"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
function checkApiKey(req, res, next) {
    const key = req.headers['x-api-key'];
    if (!key || key !== process.env.API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }
    next();
}
module.exports = { checkApiKey };
//# sourceMappingURL=middleware.js.map