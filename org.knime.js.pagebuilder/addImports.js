/* eslint-disable func-style */
const fs = require('fs');
const path = require('path');

const appendLine = `import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';\n`;

function fromDir(startPath, filter) {
    if (!fs.existsSync(startPath)) {
        console.log('no dir ', startPath);
        return;
    }
    console.log('hier', startPath);
    let files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        let filename = path.join(startPath, files[i]);
        let stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            fromDir(filename, filter); // recurse
        } else if (filename.endsWith(filter)) {
            console.log('-- found: ', filename);
            let data = fs.readFileSync(filename); // read existing contents into data
            let fd = fs.openSync(filename, 'w+');
            let buffer = Buffer.from(appendLine);

            fs.writeSync(fd, buffer, 0, buffer.length, 0); // write new data
            fs.writeSync(fd, data, 0, data.length, buffer.length); // append old data

            fs.close(fd);
        }
    }
}

fromDir('./test', '.test.js');
