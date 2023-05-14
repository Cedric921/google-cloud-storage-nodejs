const express = require('express');
const router = express.Router();

const Controller = require('../controllers/file.controller');

router
	.post('/upload', Controller.upload)
	.get('/files', Controller.getListFiles)
	.get('/files/:name', Controller.download);

module.exports = router;
