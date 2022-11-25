var express = require('express');
var app = express();
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');

const route = require('./route');
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

const clearCachedFile = async () => {
    let files = await new Promise ((resolve, reject) => {
        let command = `find ${__dirname + '/public'} -type f -atime +30`;
        exec(command, function (err, stdout, stderr) {
            if (!err) {
                if (stdout) {
                    resolve(stdout.trim().split('\n'));
                } else {
                    resolve([]);
                }
            } else {
                console.log('err', err);
                reject([]);
            }
        })
    })

    for (let i = 0; i < files.length; i++) {
        fs.unlinkSync(files[i])
    }
}
setInterval(() => {
    clearCachedFile();
}, 30 * 86400 * 1000);