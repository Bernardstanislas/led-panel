"use strict";

const i2c = require('i2c-bus');
const characters = require('./characters.json');

const led = i2c.openSync(1);

const I2C_ADDRESS = 0x70;
const turn_on = 0x21;
const HT16K33_BLINK_CMD = 0x80;
const HT16K33_BLINK_DISPLAYON = 0x01;
const HT16K33_BLINK_OFF = 0x00;
const HT16K33_CMD_BRIGHTNESS = 0xE0;
const brightness_level = 15;

const WIDTH = 8;

const clearBitmap = [
    [1,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
];

const transpose = matrix => {
    let result = matrix[0].map((col, i) => matrix.map(row => row[i]));
    if (result.length === 0) result = [[]];
    return result;
};

const send = buffer => led.i2cWriteSync(I2C_ADDRESS, buffer.length, buffer);

const prepare = () => {
    send(new Buffer([turn_on]));
    send(new Buffer([HT16K33_BLINK_CMD | HT16K33_BLINK_DISPLAYON | HT16K33_BLINK_OFF , HT16K33_CMD_BRIGHTNESS | brightness_level]));
}

const writeBitmap = bitmap => transpose(bitmap).forEach((row, index) => {
    row.unshift(row.pop());
    const rowValue = parseInt(row.join(''), 2);
    send(new Buffer([index*2 & 0xFF, rowValue]));
});

prepare();
writeBitmap(clearBitmap);

const MESSAGE = 'COUCOU LES LOULOUS';
const matrixes = Array.prototype.map.call(MESSAGE, character => characters[character]);
const messageMatrix = [0,0,0,0,0,0,0,0].map((c, index) => matrixes.reduce((acc, matrix) => acc.concat(matrix[index]), []));

const sliceMatrix = (matrix, index) => matrix.map(line => {
    let result = line.slice(index < 0 ? 0 : index, index + WIDTH);
    if (index < 0) {
        let comp = [];
        for (let i = index; i < 0; i++) {
            comp.push(0);
        }
        result = comp.concat(result);
    }
    if (result.length < WIDTH) {
        let comp = [];
        for (let i = result.length; i < WIDTH; i++) {
            comp.push(0);
        }
        result = result.concat(comp);
    }
    return result;
});

let cursor = -1 * WIDTH;
const render = () => {
    writeBitmap(sliceMatrix(messageMatrix, cursor));
}

setInterval(() => {
    cursor += 1;
    if (cursor > messageMatrix[0].length) cursor = -1 * WIDTH;
    render();
}, 100);
