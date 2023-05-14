const processFile = require('../middlewares/upload');
const { format } = require('util');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
	keyFilename: 'google-cloud-key.json',
});
const bucket = storage.bucket('alex-test-386112.appspot.com');

const upload = async (req, res, next) => {
	try {
		await processFile(req, res);

		if (!req.file) {
			return res.status(400).json({ message: 'Please upload a file' });
		}

		const blob = bucket.file(req.file.originalname);
		const blobStream = blob.createWriteStream({
			resumable: false,
		});

		blobStream.on('error', (err) => {
			res.status(500).json({ message: err.message });
		});

		blobStream.on('finish', async (data) => {
			const publicUrl = format(
				`https://storage.googleapis.com/${bucket.name}/${blob.name}`
			);

			try {
				// Make the file public
				await bucket.file(req.file.originalname).makePublic();
			} catch {
				return res.status(500).json({
					message: `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
					url: publicUrl,
				});
			}
			res.status(200).json({
				message: 'Uploaded the file successfully: ' + req.file.originalname,
				url: publicUrl,
			});
		});

		blobStream.end(req.file.buffer);
	} catch (error) {
		if (err.code == 'LIMIT_FILE_SIZE') {
			return res.status(500).send({
				message: 'File size cannot be larger than 2MB!',
			});
		}
		res.status(500).json({
			message: `Could not upload the file: ${req.file.originalname}. ${err}`,
		});
	}
};

const getListFiles = async (req, res, next) => {
	try {
		const [files] = await bucket.getFiles();
		let filesInfos = [];

		files.forEach((file) => {
			filesInfos.push({
				name: file.name,
				url: file.metadata.mediaLink,
			});
		});
		res.status(200).json(filesInfos);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'unable to read list of files' });
	}
};

const download = async (req, res, next) => {
	try {
		console.log(req.params.name);
		const [metaData] = await bucket.file(req.params.name).getMetadata();
		res.redirect(metaData.mediaLink);
	} catch (error) {
		res.status(500).json({
			message: `couldn't download file ${error}`,
		});
	}
};

module.exports = {
	upload,
	getListFiles,
	download,
};
