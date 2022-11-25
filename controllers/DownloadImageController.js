'use strict'
const fse = require('fs-extra');
const Config = require('../config');
const axios = require('axios');

class DownloadImageController {
    async download(request, response) {
        let params  = request.body;
        let retVal = {
            status: 'fail',
            message: '',
            result: ''
        }

        if (params.token !== Config.api_token) {
            retVal.message = 'token mismatch';
        } else {
            if (params.url && params.path) {
                try {
                    let result = await this.downloadImage(params.url, params.path);
                    if (result) {
                        retVal.status = 'successful';
                    }
                } catch (error) {
                    retVal.message = error.message;                    
                }
            } else {
                retVal.message = 'missing URL or path';
            }
        }

        return response.json(retVal);
    }

    async downloadImage (url, path) {
        path = './public' + path;
        return await axios({
            url,
            responseType: 'stream',
        }).then(async response => {
            fse.outputFileSync(path, '');
            return new Promise((resolve, reject) => {
                response.data.pipe(fse.createWriteStream(path, {
                    flags: 'w'
                }))
                .on('error',(error)=>{
                    console.log(error)
                    reject(false);
                })
                .on('finish', function (err) {
                    resolve(true);
                });
            })
        }).catch(error => {
            console.log('downloadImage error', error);
            return false;
        });
    }
}

module.exports = new DownloadImageController();