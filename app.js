const http = require("http");
var path = require('path');
var fs = require('fs');
const host = '0.0.0.0';
const port = process.env.PORT || 3434;
const sharp = require('sharp');
const axios = require("axios");

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

    img = await download(url).catch();
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
    ext = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)[1];
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
    res.setHeader('Cache-control', 'public, max-age=15552000');
    res.setHeader('Content-Type', `image/${ext}`);
    res.setHeader('access-control-allow-origin', '*');
    res.writeHead(200);
    res.end(img);
}

const requestListener = async function(req, res) {

    res.setHeader('X-Powered-By', 'GCR');

    let regex;
    let url;
    let match;
    let img;

    regex = /(\d+)x(\d+)\/((\d+)\/|)(.*.(png|jpeg|jpg|webp))/i;
    if (req.url.toLowerCase().match(regex)) {
        match = regex.exec(req.url);
        url = match[5];
        let width = parseInt(match[1]);
        let height = parseInt(match[2]);
        let quality = parseInt(match[5]);
        await resizeImage(req, res, url, width, height, quality ? quality : 100);
        return;
    }

    regex = /(\d+)x(\d+)\/((\d+)\/|)(.*.(svg|jfif|gif))/i;

    if (req.url.toLowerCase().match(regex)) {
        match = regex.exec(req.url);
        url = match[5];
        url = `https://${url}`;
        return redirect(req, res, url);
    }

    if (req.url == '/favicon.ico') {
        res.writeHead(404);
        res.end("No favicon");
        return;
    }


    if (!match) {
        console.error(`Url invalid ${req.url}`);
        res.writeHead(404);
        res.end("Url invalid");
        return;
    }

};

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

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is listening on ${host}:${port}`)
});