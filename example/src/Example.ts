import { Group, Panel, text, gravity, Color, LayoutSpec, vlayout, scroller, layoutConfig, modal, loge, hlayout, input, Input, log } from 'doric'
import { WebSocket } from 'doric-websocket'
import AccessMessage from './mercury/AccessMessage'
import Constant from './mercury/Constant'
import CommandEnum from './mercury/CommandEnum'
import NextHeaderEnum from './mercury/NextHeaderEnum'
import Header from './mercury/Header'
import DataUtil from './mercury/DataUtil'

@Entry
class WebSocketDemo extends Panel {
    private input?: Input
    private webSocket?: WebSocket
    build(rootView: Group): void {
        scroller(vlayout([
            text({
                text: "WebSocket Demo",
                layoutConfig: layoutConfig().configWidth(LayoutSpec.MOST),
                textSize: 30,
                textColor: Color.WHITE,
                backgroundColor: Color.parse("#7bed9f"),
                textAlignment: gravity().center(),
                height: 50,
            }),
            text({
                text: 'create',
                width: 200,
                height: 50,
                backgroundColor: Color.parse("#70a1ff"),
                textSize: 30,
                textColor: Color.WHITE,
                layoutConfig: layoutConfig().just(),
                onClick: () => {
                    this.webSocket = new WebSocket(context)
                    this.webSocket.onopen = () => {
                        modal(context).toast('onopen')

                        let message = new AccessMessage()
                        message.flag = Constant.MESSAGE_FLAG
                        message.command = CommandEnum.CLIENT_HAND_SHAKE
                        message.version = Constant.PROTOCOL_VERSION

                        message.extendHeaders = [
                            new Header(NextHeaderEnum.MSG_ID, DataUtil.Instance.string2ArrayBuffer('1'))
                        ]
                        let handShakeBody = {
                            "d": "201910301116457baa552ea335f3b97de57db7a16af86f0188360107ff600a",
                            "p": 7,
                            "a": 10,
                            "sv": "10.15.3",
                            "av": "5.4.0",
                            "t": 0
                        }
                        message.body = DataUtil.Instance.string2ArrayBuffer(JSON.stringify(handShakeBody))
                        this.webSocket?.send(message.encode())
                    }
                    this.webSocket.onclose = () => {
                        modal(context).toast('onclose')
                    }
                    this.webSocket.onerror = () => {
                        modal(context).toast('onerror')
                    }
                    this.webSocket.onmessage = (arrayBuffer: ArrayBuffer) => {
                        let accessMessage = new AccessMessage()
                        accessMessage.decode(arrayBuffer)
                        loge(accessMessage)
                        modal(context).toast('onmessage')
                    }
                }
            }),
            text({
                text: 'open',
                width: 200,
                height: 50,
                backgroundColor: Color.parse("#70a1ff"),
                textSize: 30,
                textColor: Color.WHITE,
                layoutConfig: layoutConfig().just(),
                onClick: () => {
                    this.webSocket?.open("ws://test-mercury.hibixin.com:3080/ws")
                }
            }),
            text({
                text: 'close',
                width: 200,
                height: 50,
                backgroundColor: Color.parse("#70a1ff"),
                textSize: 30,
                textColor: Color.WHITE,
                layoutConfig: layoutConfig().just(),
                onClick: () => {
                    this.webSocket?.close()
                }
            }),
            text({
                text: 'destroy',
                width: 200,
                height: 50,
                backgroundColor: Color.parse("#70a1ff"),
                textSize: 30,
                textColor: Color.WHITE,
                layoutConfig: layoutConfig().just(),
                onClick: () => {
                    this.webSocket?.destroy()
                }
            }),

            hlayout([
                text({
                    text: 'send',
                    width: 200,
                    height: 50,
                    backgroundColor: Color.parse("#70a1ff"),
                    textSize: 30,
                    textColor: Color.WHITE,
                    layoutConfig: layoutConfig().just(),
                    onClick: () => {
                        let promise = this.input?.getText(context);
                        promise?.then(text => {
                            log(text)
                            var buf = new ArrayBuffer(text.length * 2);
                            var bufView = new Uint8Array(buf);
                            for (var i = 0, strLen = text.length; i < strLen; i++) {
                                bufView[i] = text.charCodeAt(i);
                                log("text :"+text.charCodeAt(i))
                            }
                            this.webSocket?.send(buf)
                        })
                    }
                }),
            ], {
                width: Environment.screenWidth,
                height: 50,
                gravity: gravity().center()
            }),

            hlayout([
                this.input = input({
                    width: 200,
                    height: 50,
                    textSize: 15,
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    },
                    hintText: "input",
                    hintTextColor: Color.BLACK,
                }),
            ], {
                width: Environment.screenWidth,
                gravity: gravity().center()
            })

        ]).apply({
            layoutConfig: layoutConfig().most().configHeight(LayoutSpec.FIT),
            gravity: gravity().center(),
            space: 10,
        })).apply({
            layoutConfig: layoutConfig().most(),
        }).in(rootView)
    }
}