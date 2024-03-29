package pub.doric.android;

import android.app.Application;

import pub.doric.Doric;
import pub.doric.library.DoricWebSocketLibrary;

public class MainApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        Doric.init(this);
        Doric.registerLibrary(new DoricWebSocketLibrary());
    }
}
