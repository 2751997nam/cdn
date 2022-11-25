const { exec } = require('child_process');
const fs = require('fs');

const clearCachedFile = async () => {
    if (!fs.existsSync(global.dir + '/public/images')) {
        fs.mkdirSync( global.dir + '/public/images', {recursive: true});
    }
    let files = await new Promise ((resolve, reject) => {
        let command = `find ${global.dir + '/public/images'} -type f -atime +30`;
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

module.exports = {
    clearCachedFile
}