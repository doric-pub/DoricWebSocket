package pub.doric.library;

import pub.doric.DoricComponent;
import pub.doric.DoricLibrary;
import pub.doric.DoricRegistry;

@DoricComponent
public class DoricWebSocketLibrary extends DoricLibrary {
    @Override
    public void load(DoricRegistry registry) {
        registry.registerNativePlugin(DoricWebSocketPlugin.class);
    }
}
