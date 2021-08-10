'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var doric = require('doric');

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function websocket(context) {
    return {
        create: (onopen, onclose, onerror, onmessage) => {
            return context.callNative('websocket', 'create', {
                onopen: onopen,
                onclose: onclose,
                onerror: onerror,
                onmessage: onmessage
            });
        },
        open: (identifier, url) => {
            return context.callNative('websocket', 'open', { identifier: identifier, url: url });
        },
        send: (identifier, data) => {
            return context.callNative('websocket', 'send', { identifier: identifier, data: data });
        },
        close: (identifier) => {
            return context.callNative('websocket', 'close', { identifier: identifier });
        },
        destroy: (identifier) => {
            return context.callNative('websocket', 'destroy', { identifier: identifier });
        },
    };
}
class WebSocket {
    constructor(context) {
        this._onopen = () => {
            if (this.onopen)
                this.onopen();
        };
        this._onerror = () => {
            if (this.onerror)
                this.onerror();
        };
        this._onclose = () => {
            if (this.onclose)
                this.onclose();
        };
        this._onmessage = (message) => {
            doric.log("_onmessage : " + message);
            let strings = message.split(',');
            let length = strings.length - 1;
            let arrayBuffer = new ArrayBuffer(length);
            let dataView = new DataView(arrayBuffer);
            for (let index = 0; index < length; index++) {
                dataView.setUint8(index, parseInt(strings[index]));
            }
            if (this.onmessage)
                this.onmessage(arrayBuffer);
        };
        this.identifier = -1;
        this.context = context;
        let onopenFunction = context.function2Id(this._onopen);
        let oncloseFunction = context.function2Id(this._onclose);
        let onerrorFunction = context.function2Id(this._onerror);
        let onmessageFunction = context.function2Id(this._onmessage);
        let create = () => __awaiter(this, void 0, void 0, function* () {
            return yield websocket(this.context).create(onopenFunction, oncloseFunction, onerrorFunction, onmessageFunction);
        });
        create().then((identifier) => {
            this.identifier = identifier;
        }).catch(() => { });
    }
    open(url) {
        let open = () => __awaiter(this, void 0, void 0, function* () {
            return yield websocket(this.context).open(this.identifier, url);
        });
        open();
    }
    send(arrayBuffer) {
        doric.log("send");
        let result = "";
        let array = new Uint8Array(arrayBuffer);
        doric.loge(array.byteLength);
        array.forEach(function (byte) {
            result += `${byte},`;
        });
        let send = () => __awaiter(this, void 0, void 0, function* () {
            return yield websocket(this.context).send(this.identifier, result);
        });
        send();
    }
    close() {
        let close = () => __awaiter(this, void 0, void 0, function* () {
            return yield websocket(this.context).close(this.identifier);
        });
        close().then((result) => { doric.modal(this.context).toast(String(result)); }).catch(() => { });
    }
    destroy() {
        let destroy = () => __awaiter(this, void 0, void 0, function* () {
            return yield websocket(this.context).destroy(this.identifier);
        });
        destroy().then((result) => { doric.modal(this.context).toast(String(result)); }).catch(() => { });
    }
}

exports.WebSocket = WebSocket;
//# sourceMappingURL=bundle_doricwebsocket.js.map
