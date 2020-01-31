const fs = require('fs');
const util = require('util');
const http = require('http');
const moment = require('moment');

const data_file = './data.json';

const pickAnother = (data, isLeapYear) => {
    const elements = [];
    const map = Object.values(data).reduce((prev, item) => {
        prev[item.value] = true;

        return prev;
    }, {});

    for (let i = 1, l = isLeapYear ? 366 : 365; i <= l; i++) {
        if (!map[i]) {
            elements.push(i);
        }
    }

    return elements[parseInt(Math.random() * elements.length)];
};

const read_data = async file => {
    return util.promisify(fs.readFile)(file)
        .then(data => JSON.parse(data))
        .catch(() => ({}));
};

http.createServer((req, res) => {
    res.setHeader('Content-type', 'application/json');

    if (req.method.toUpperCase() === 'GET') {
        read_data(data_file).then(data => {
            const now = moment();
            if (Object.keys(data).length == now.dayOfYear()) {
                res.end(JSON.stringify(data));
                return;
            }

            const iterator = moment(`${now.year()}-01-01`);
            while (iterator.dayOfYear() <= now.dayOfYear()) {
                const key = iterator.format('YYYY-MM-DD');

                if (!data[key]) {
                    data[key] = {
                        value: pickAnother(data, now.isLeapYear()),
                        done: false,
                    };
                }
                iterator.add(1, 'days');
            }

            util.promisify(fs.writeFile)(data_file, JSON.stringify(data))
                .then(() => res.end(JSON.stringify(data)))
                .catch(() => res.end(JSON.stringify({message: 'unknow error'})));
        });
    } else if (req.method.toUpperCase() === 'POST') {
        let body = '';

        req.on('data', data => (body += data));
        req.on('end', () => {
            try {
                const {key} = JSON.parse(body);

                read_data(data_file).then(data => {
                    if (!data[key]) {
                        res.writeHead(404);
                        res.end(JSON.stringify({message: 'not found'}));
                        return;
                    }

                    data[key].done = !data[key].done;
                    util.promisify(fs.writeFile)(data_file, JSON.stringify(data))
                        .then(() => res.end(JSON.stringify(data)))
                        .catch(() => res.end(JSON.stringify({message: 'unknow error'})));
                });
            } catch {
                res.writeHead(400);
                res.end(JSON.stringify({message: 'invalid request'}));
            }
        });
    } else {
        res.writeHead(405);
        res.end(JSON.stringify({message: 'invalid method'}));
    }
}).listen(8081, '127.0.0.1');

