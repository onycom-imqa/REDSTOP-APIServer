var express = require('express');
var router = express.Router();
var axios = require('axios');

var resultList = [];
var VUs;
var responseTime;
var failures;
var failuresSlashS;
var tps;
var count;

router.get('/', function (req, res) {
    console.log('마이크 테스트');
    let url = 'http://52.79.221.114:3000/api/v1/send-scenario/kukaro/2/default';
    axios.get(url)
        .then(function (response) {
            console.log('response입니다.');
            console.log(Object.keys(response));
            // console.log(response.data);
            resultList = [];
            VUs = 10;
            responseTime = 0;
            failures = 0;
            failuresSlashS = 0;
            tps = 0;
            count = 0;
            return response.data;
        })
        .then(function (data) {
            console.log('넘어왔어여');
            let tmp = 0;
            for (let atom of data) {
                if (atom.type === 'api') {
                    tmp++;
                }
            }
            const MAXCOUNT = VUs * tmp;
            for (let atom of data) {
                if (atom.type === 'api') {
                    for (let i = 0; i < VUs; i++) {
                        axios.post(
                            'http://52.79.221.114:3000/api/v1/apitest',
                            {
                                data: {},
                                url: atom.url,
                                method: atom.method
                            }
                        ).then(response => {
                            count++;
                            responseTime += response.data.result.time;
                            console.log('응답 성공 : ' + count);
                            console.log(Object.keys(response.data.result));
                            if (count === MAXCOUNT) {
                                makeData()
                                res.status(200).send({
                                    number: VUs,
                                    number2: responseTime,
                                    number3: failures,
                                    number4: failuresSlashS,
                                    number5: tps
                                });
                            }
                        }).catch(err => {
                            count++;
                            failures++;
                            responseTime += err.response.data.result.time;
                            console.log('응답 실패 : ' + count);
                            console.log(Object.keys(err.response.data.result));
                            if (count === MAXCOUNT) {
                                makeData()
                                res.status(200).send({
                                    number: VUs,
                                    number2: responseTime,
                                    number3: failures,
                                    number4: failuresSlashS,
                                    number5: tps
                                });
                            }
                        })
                    }
                }
            }
        })
        .catch(function (error) {
            console.log('error입니다.');
            console.log(error);
        });
    // var randVal = Math.random() * 50 + 1;
    // var randVal2 = Math.random() * 50 + 1;
    // var randVal3 = Math.random() * 50 + 1;
    // var randVal4 = Math.random() * 50 + 1;
    // var randVal5 = Math.random() * 50 + 1;
    //
    // res.status(200).send({
    //     number: Math.round(randVal),
    //     number2: Math.round(randVal2),
    //     number3: Math.round(randVal3),
    //     number4: Math.round(randVal4),
    //     number5: Math.round(randVal5)
    // });
});

function makeData() {
    console.log('make data')
    failuresSlashS = failures / VUs;
    tps = VUs/responseTime;
    responseTime/= count;
    console.log('VUs : ' + VUs);
    console.log('responseTime : ' + responseTime);
    console.log('failures : ' + failures);
    console.log('failuresSlashS : ' + failuresSlashS);
    console.log('tps : ' + tps);
}

module.exports = router;
