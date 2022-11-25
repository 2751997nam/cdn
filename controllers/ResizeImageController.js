const sharp = require('sharp');
const axios = require("axios");
var path = require('path');
var fs = require('fs');

async function download(img) {
    let url = `https://${img}`;
    try {
        return ((await axios.get(url, {
            responseType: 'arraybuffer'
        })).data);
    } catch (e) {
        return null
    }
}

async function resizeImage(req, res, url, width, height, quality = 100) {
    let img = await download(url).catch();
    if (!img) {
        // console.error(`Image not found ${req.url}`);
        url = `https://${url}`;
        return redirect(req, res, url);
    }
    let resize = {
        fit: sharp.fit.inside,
    }
    if (width) {
        resize.width = width;
    }
    if (height) {
        resize.height = height;
    }
    let ext = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)[1];
    ext = (ext == 'jpg') ? 'jpeg' : ext;
    if (ext == 'jpeg') {
        img = await sharp(img, {
            limitInputPixels: false
        }).resize(resize).jpeg({
            progressive: true,
            quality: quality,
            force: false
        }).toBuffer();
    } else if (ext == 'png') {
        img = await sharp(img, {
            limitInputPixels: false
        }).resize(resize).png({
            progressive: true,
            quality: quality,
            force: false
        }).toBuffer();
    } else {
        img = await sharp(img, {
            limitInputPixels: false,
            quality: quality,
        }).resize(resize).toBuffer();
    }
    saveFile(req.url, img);
    res.setHeader('Cache-control', 'public, max-age=15552000');
    res.setHeader('Content-Type', `image/${ext}`);
    res.setHeader('access-control-allow-origin', '*');
    res.writeHead(200);
    res.end(img);
}

const saveFile = (url, data) => {
    let path = './public' + url.substring(0, url.lastIndexOf('/'));
    if (!fs.existsSync( path)) {
        fs.mkdirSync( path, {recursive: true});
    }
    fs.writeFile('./public' + url, data, function () {});
}

const resize = async (req, res) => {
    res.setHeader('X-Powered-By', 'GCR');

    let resolution = req.params.resolution.split('x');
    let width = parseInt(resolution[0]);
    let height = parseInt(resolution[1]);
    let url = req.params.url;
    let quality = req.params.quality ? parseInt(req.params.quality) : 100;

    await resizeImage(req, res, url, width, height, quality);
}

const redirectUnsuportImage = (req, res) => {
    let url = `https://${req.params.url}`;
    return redirect(req, res, url);
}

async function redirect(req, res, url) {
    try {
        url = new URL(url);
        res.writeHead(302, {
            'Location': url
        });
    } catch (e) {

    }
    res.end();
}

module.exports = {
    resize,
    redirectUnsuportImage
}