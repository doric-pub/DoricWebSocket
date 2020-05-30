package pub.doric.extension;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import okio.ByteString;
import pub.doric.extension.bridge.DoricPromise;
import pub.doric.utils.DoricLog;

public class WebSocketInstance {
    private OkHttpClient okHttpClient;
    private WebSocket mWebSocket;

    public DoricPromise onopenPromise;
    public DoricPromise onclosePromise;
    public DoricPromise onerrorPromise;
    public DoricPromise onmessagePromise;

    public WebSocketInstance() {
        okHttpClient = new OkHttpClient.Builder()
                .writeTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .connectTimeout(10, TimeUnit.SECONDS)
                .build();
    }

    public void open(String url) {
        Request request = new Request.Builder()
                .url(url)
                .build();

        mWebSocket = okHttpClient.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                super.onOpen(webSocket, response);

                DoricLog.d("onOpen");
                onopenPromise.resolve();
            }

            @Override
            public void onMessage(WebSocket webSocket, String text) {
                super.onMessage(webSocket, text);
            }

            @Override
            public void onMessage(WebSocket webSocket, ByteString bytes) {
                super.onMessage(webSocket, bytes);
            }

            @Override
            public void onClosing(WebSocket webSocket, int code, String reason) {
                super.onClosing(webSocket, code, reason);
            }

            @Override
            public void onClosed(WebSocket webSocket, int code, String reason) {
                super.onClosed(webSocket, code, reason);

                DoricLog.d("onClosed");
                onclosePromise.resolve();
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                super.onFailure(webSocket, t, response);

                DoricLog.d("onFailure");
                onerrorPromise.resolve();
            }
        });
    }

    public void send(ByteString bytes) {
        mWebSocket.send(bytes);
    }

    public void close() {
        try {
            mWebSocket.close(1006, "user triggered close");
        } catch (Exception exception) {
            DoricLog.e(exception.toString());
        }
    }
}
