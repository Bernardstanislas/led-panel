var i2c = require('i2c-bus');

var led = i2c.openSync(1);

var I2C_ADDRESS = 0x70;
var turn_on = 0x21;
var HT16K33_BLINK_CMD = 0x80;
var HT16K33_BLINK_DISPLAYON = 0x01;
var HT16K33_BLINK_OFF = 0x00;
var HT16K33_CMD_BRIGHTNESS = 0xE0;
var brightness_level = 15;

var clearBitmap = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
];

function send(buffer) {
    led.i2cWriteSync(I2C_ADDRESS, buffer.length, buffer);
}

function prepare() {
    send(new Buffer([turn_on]));
    send(new Buffer([HT16K33_BLINK_CMD | HT16K33_BLINK_DISPLAYON | HT16K33_BLINK_OFF , HT16K33_CMD_BRIGHTNESS | brightness_level]));
}

function writeBitmap(bitmap) {
    bitmap.forEach(function(row, index) {
        row.unshift(row.pop());
        var rowValue = parseInt(row.join(''), 2);
        send(new Buffer([index*2 & 0xFF, rowValue]));
    });
}

var testBitmap = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,1,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
];

prepare();
writeBitmap(clearBitmap);
writeBitmap(testBitmap);
