var express = require('express');
var app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { clearCachedFile } = require('./helpers/helper');
const bodyParser= require('body-parser');
const route = require('./route');

global.dir = __dirname;

app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.use(route);

app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
});

var server = app.listen(3434, function () {
    var host = server.address().address
    var port = server.address().port
    if (host == '::') {
        host = '127.0.0.1';
    }
    console.log("cdn service : http://%s:%s", host, port)
})

setInterval(() => {
    clearCachedFile();
}, 30 * 86400 * 1000);