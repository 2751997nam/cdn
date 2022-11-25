const express = require('express');
const router = express.Router();
const ResizeImageController = require('./controllers/ResizeImageController');

router.get('/', function (req, res) {
    return res.json({message: 'cdn service'});
})
 
router.get('/:resolution(\\d+x\\d+)/:quality(\\d+)?/:url(*(.png|.jpeg|.jpg|.webp))', ResizeImageController.resize.bind(ResizeImageController));
router.get('/:resolution(\\d+x\\d+)/:quality(\\d+)?/:url(*)', ResizeImageController.redirectUnsuportImage.bind(ResizeImageController));


module.exports = router;