'use strict'
const fse = require('fs-extra');
const fs = require('fs');
const Config = require('../config');
const axios = require('axios');
const config = require('../config');

class UploadImageController {
    padZero (num) {
        return num > 9 ? num : `0${num}`;
    }
    async upload(request, response, next) {
        let params  = request.body;
        let retVal = {
            status: 'fail',
            message: '',
            result: ''
        }

        if (params.token !== Config.api_token) {
            retVal.message = 'token mismatch';
        } else if (!Object.keys(request.files).length) {
            retVal.message = 'Please input a file'
        } else {
            for (let key in request.files) {
                let file = request.files[key];
                if (!file.truncated) {
                    let type = params.type ? params.type : 'default';
                    let site = params.site ? params.site : 'default';
                    let date = new Date();
                    let fileName = file.md5 + file.name.substring(file.name.lastIndexOf('.'));
                    let basePath = `upload/${site}/${type}/${date.getFullYear()}-${this.padZero(date.getMonth() + 1)}-${this.padZero(date.getDate())}`;
                    let path = global.dir + `/public/${basePath}`;
                    let filePath = `${path}/${fileName}`;
                    if (!fs.existsSync( path)) {
                        fs.mkdirSync( path, {recursive: true});
                    }
                    await new Promise ((resolve, reject) => {
                        file.mv(filePath, (err) => {
                            if (err) {
                                console.log('err', err);
                                retVal.message = err.message;
                                reject();
                            }
                            retVal.status = 'successful';
                            retVal.result = `${config.app_url}/${basePath}/${fileName}`;
                            resolve();
                        })
                    })
                } else {
                    retVal.message = 'Max file size 10MB'
                }
            }
        }

        return response.json(retVal);
    }
}

module.exports = new UploadImageController();