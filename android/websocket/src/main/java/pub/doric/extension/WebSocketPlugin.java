package pub.doric.extension;

import com.github.pengfeizhou.jscore.JSObject;
import com.github.pengfeizhou.jscore.JavaValue;

import java.util.HashMap;
import java.util.concurrent.atomic.AtomicInteger;

import pub.doric.DoricContext;
import pub.doric.extension.bridge.DoricMethod;
import pub.doric.extension.bridge.DoricPlugin;
import pub.doric.extension.bridge.DoricPromise;
import pub.doric.plugin.DoricJavaPlugin;

@DoricPlugin(name = "websocket")
public class WebSocketPlugin extends DoricJavaPlugin {

    private HashMap<Integer, WebSocketInstance> webSocketInstances = new HashMap<>();

    private AtomicInteger counter = new AtomicInteger(0);

    public WebSocketPlugin(DoricContext doricContext) {
        super(doricContext);
    }

    @DoricMethod
    public void create(JSObject object, DoricPromise promise) {
        int identifier = counter.incrementAndGet();

        WebSocketInstance webSocket = new WebSocketInstance();
        webSocketInstances.put(identifier, webSocket);

        String onopen = object.getProperty("onopen").asString().value();
        webSocket.onopenPromise = new DoricPromise(getDoricContext(), onopen);

        String onclose = object.getProperty("onclose").asString().value();
        webSocket.onclosePromise = new DoricPromise(getDoricContext(), onclose);

        String onerror = object.getProperty("onerror").asString().value();
        webSocket.onerrorPromise = new DoricPromise(getDoricContext(), onerror);

        String onmessage = object.getProperty("onmessage").asString().value();
        webSocket.onmessagePromise = new DoricPromise(getDoricContext(), onmessage);

        promise.resolve(new JavaValue(identifier));
    }

    @DoricMethod
    public void open(JSObject object, DoricPromise promise) {
        int identifier = object.getProperty("identifier").asNumber().toInt();
        String url = object.getProperty("url").asString().value();

        WebSocketInstance webSocket = webSocketInstances.get(identifier);
        if (webSocket != null)
            webSocket.open(url);
    }

    @DoricMethod
    public void close(JSObject object, DoricPromise promise) {
        int identifier = object.getProperty("identifier").asNumber().toInt();

        WebSocketInstance webSocket = webSocketInstances.get(identifier);
        if (webSocket != null) {
            webSocket.close();
            promise.resolve(new JavaValue(true));
        } else {
            promise.resolve(new JavaValue(false));
        }
    }

    @DoricMethod
    public void destroy(JSObject object, DoricPromise promise) {
        int identifier = object.getProperty("identifier").asNumber().toInt();

        WebSocketInstance webSocket = webSocketInstances.get(identifier);
        webSocketInstances.remove(identifier);

        if (webSocket != null) {
            webSocket.close();
            promise.resolve(new JavaValue(true));
        } else {
            promise.resolve(new JavaValue(false));
        }
    }

    @Override
    public void onTearDown() {
        super.onTearDown();

        for (Integer key : webSocketInstances.keySet()) {
            WebSocketInstance webSocket = webSocketInstances.get(key);
            if (webSocket != null) {
                webSocket.close();
            }
        }

        webSocketInstances.clear();
    }
}
