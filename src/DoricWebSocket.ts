import { Group, Panel, text, gravity, Color, LayoutSpec, vlayout, scroller, layoutConfig, modal } from 'doric'
import { WebSocket } from './websocket'

@Entry
class WebSocketDemo extends Panel {
    build(rootView: Group): void {
        let webSocket = new WebSocket(context)
        webSocket.onopen = () => {
            modal(context).toast('onopen')
        }
        webSocket.onclose = () => {
            modal(context).toast('onclose')
        }
        webSocket.onerror = () => {
            modal(context).toast('onerror')
        }
        webSocket.onmessage = () => {
            modal(context).toast('onmessage')
        }

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
                text: 'open',
                width: 200,
                height: 50,
                backgroundColor: Color.parse("#70a1ff"),
                textSize: 30,
                textColor: Color.WHITE,
                layoutConfig: layoutConfig().just(),
                onClick: () => {
                    webSocket.open("ws://10.111.210.113:3080/ws")
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
                    webSocket.close()
                }
            }),
        ]).apply({
            layoutConfig: layoutConfig().most().configHeight(LayoutSpec.FIT),
            gravity: gravity().center(),
            space: 10,
        })).apply({
            layoutConfig: layoutConfig().most(),
        }).in(rootView)
    }
}