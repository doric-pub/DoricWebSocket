/*
 * Copyright [2019] [Doric.Pub]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { BridgeContext, modal, loge } from "doric"

function websocket(context: BridgeContext) {
    return {
        create: (onopen: string, onclose: string, onerror: string, onmessage: string) => {
            return context.callNative('websocket', 'create', {
                onopen: onopen,
                onclose: onclose,
                onerror: onerror,
                onmessage: onmessage
            }) as Promise<Number>
        },
        open: (identifier: Number, url: String) => {
            return context.callNative('websocket', 'open', { identifier: identifier, url: url })
        },
        send: (identifier: Number, data: String) => {
            return context.callNative('websocket', 'send', { identifier: identifier, data: data })
        },
        close: (identifier: Number) => {
            return context.callNative('websocket', 'close', { identifier: identifier }) as Promise<Boolean>
        },
    }
}

export class WebSocket {

    public onopen?: Function

    private _onopen: Function = () => {
        if (this.onopen) this.onopen()
    }

    public onerror?: Function

    private _onerror: Function = () => {
        if (this.onerror) this.onerror()
    }

    public onclose?: Function

    private _onclose: Function = () => {
        if (this.onclose) this.onclose()
    }

    public onmessage?: Function

    private _onmessage: Function = (message: String) => {
        let strings = message.split(',')
        let length = strings.length - 1

        let arrayBuffer = new ArrayBuffer(length)
        let dataView = new DataView(arrayBuffer)
        for (let index = 0; index < length; index++) {
            dataView.setUint8(index, parseInt(strings[index]))
        }
        if (this.onmessage) this.onmessage(arrayBuffer)
    }

    private context: BridgeContext

    private identifier: Number = -1

    constructor(context: BridgeContext) {
        this.context = context

        let onopenFunction = context.function2Id(this._onopen)
        let oncloseFunction = context.function2Id(this._onclose)
        let onerrorFunction = context.function2Id(this._onerror)
        let onmessageFunction = context.function2Id(this._onmessage)

        let create = async () => {
            return await websocket(this.context).create(onopenFunction, oncloseFunction, onerrorFunction, onmessageFunction)
        }
        create().then((identifier: Number) => {
            this.identifier = identifier
        }).catch(() => {})
    }

    public open(url: String) {
        let open = async () => {
            return await websocket(this.context).open(this.identifier, url)
        }
        open()
    }

    public send(arrayBuffer: ArrayBuffer) {
        let result: String = ""
        let array = new Uint8Array(arrayBuffer)
        loge(array.byteLength)
        array.forEach(function (byte: number) {
            result += `${byte},`
        })
        let send = async () => {
            return await websocket(this.context).send(
                this.identifier,
                result
            )
        }
        send()
    }

    public close() {
        let close = async () => {
            return await websocket(this.context).close(this.identifier)
        }
        close().then((result: Boolean) => {modal(this.context).toast(String(result))}).catch(() => {})
    }
}