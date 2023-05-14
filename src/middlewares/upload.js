const util = require('util');
const Multer = require('multer');
const maxSize = 2 * 1024 * 1024;

let processFile = Multer({
	// storage: Multer.memoryStorage,
	destination: function (req, file, cb) {
		// Spécifiez le dossier de destination pour les fichiers téléchargés
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		// Générez un nom de fichier unique
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + '-' + uniqueSuffix);
	},
	limits: { fileSize: maxSize },
}).single('file');

let processFileMiddleware = util.promisify(processFile);

module.exports = processFileMiddleware;
