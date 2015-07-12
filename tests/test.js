/**
 The MIT License (MIT)

 Copyright (c) 2015 @biddster

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

"use strict";
var assert = require('chai').assert;


function loadNode(config, mod) {
    var RED = {
        nodes: {
            registerType: function (nodeName, nodeConfigFunc) {
                this.nodeConfigFunc = nodeConfigFunc;
            },
            createNode: function () {
            }
        },
        on: function (name, onFunc) {
            this.onInput = onFunc;
        },
        send: function (msg) {
            this.msg = msg;
        },
        error: function (error) {
            this.nodeError = error;
        },
        log: function () {
            console.log.apply(this, arguments);
        }
    };
    mod(RED);
    RED.nodes.nodeConfigFunc.call(RED, config);
    return RED;
}


var ninjaSend = require('../ninja/ninja-send.js');
var ninjaReceive = require('../ninja/ninja-receive.js');


describe('Ninja', function () {
    describe('send', function () {
        it('should error if you send humidity (30)', function () {
            var send = loadNode({d: '30', da: 'blah'}, ninjaSend);
            send.onInput({});
            assert(send.nodeError);
        });
        it('should error if you send temparature (31)', function () {
            var send = loadNode({d: '31', da: 'blah'}, ninjaSend);
            send.onInput({});
            assert(send.nodeError);
        });
        it('should build the correct JSON for RF', function () {
            var send = loadNode({d: 'RF', da: '0xc0f33'}, ninjaSend);
            send.onInput({});
            assert.isUndefined(send.nodeError);
            assert.strictEqual("{\"DEVICE\":[{\"G\":\"0\",\"V\":0,\"D\":11,\"DA\":\"000011000000111100110011\"}]}\r\n", send.msg.payload);
        });
        it('should build the correct JSON for 11', function () {
            var send = loadNode({d: '11', da: '0xc0f33'}, ninjaSend);
            send.onInput({});
            assert.isUndefined(send.nodeError);
            assert.strictEqual("{\"DEVICE\":[{\"G\":\"0\",\"V\":0,\"D\":11,\"DA\":\"000011000000111100110011\"}]}\r\n", send.msg.payload);
        });
    });
    describe('receive', function () {
        it('should parse real JSON', function () {
            var receive = loadNode({}, ninjaReceive);
            receive.onInput({payload: "{\"DEVICE\":[{\"G\":\"0\",\"V\":0,\"D\":11,\"DA\":\"000011000000111100110011\"}]}\r\n"});
            assert.isUndefined(receive.nodeError);
            assert.strictEqual(11, receive.msg.topic);
            assert.strictEqual('0c0f33', receive.msg.payload);
        });
    });
});
