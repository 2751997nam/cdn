const express = require('express');
const router = express.Router();
const ResizeImageController = require('./controllers/ResizeImageController');
const DownloadImageController = require('./controllers/DownloadImageController');
const UploadImageController = require('./controllers/UploadImageController');

router.get('/', function (req, res) {
    return res.json({message: 'cdn service'});
})
 
router.get('/images/:resolution(\\d+x\\d+)/:quality(\\d+)?/:fitIn(fit-in)?/:transparent(transparent)?/:url(*(.png|.jpeg|.jpg|.webp))', ResizeImageController.resize.bind(ResizeImageController));
router.get('/images/:resolution(\\d+x\\d+)/:quality(\\d+)?/:fitIn(fit-in)?/:transparent(transparent)?/:url(*)', ResizeImageController.redirectUnsuportImage.bind(ResizeImageController));
router.get('/flush-cache', ResizeImageController.flushCache.bind(ResizeImageController));
router.post('/download', DownloadImageController.download.bind(DownloadImageController));
router.post('/upload', UploadImageController.upload.bind(UploadImageController));

module.exports = router;