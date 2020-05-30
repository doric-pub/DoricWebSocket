package pub.doric.extension;

import pub.doric.DoricLibrary;
import pub.doric.DoricRegistry;

public class WebSocketLibrary extends DoricLibrary {
    @Override
    public void load(DoricRegistry registry) {
        registry.registerNativePlugin(WebSocketPlugin.class);
    }
}
