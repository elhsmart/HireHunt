/**
 * Listens for the app launching then creates the window
 */
chrome.app.runtime.onLaunched.addListener(function() {

    var options = {
        screenWidth:  screen.availWidth,
        screenHeight: screen.availHeight,
        width: 0.8,
        height: 0.8
    }

    chrome.app.window.create('index.html', {
        id: Date(),
        frame: { type: "none" },
        outerBounds: {
            width: Math.round(options.width * screen.availWidth),
            height: Math.round(options.height * screen.availHeight),
            minWidth: 800,
            minHeight: 500,
            left: Math.round((options.screenWidth - (options.screenWidth * options.width)) / 2),
            top: Math.round((options.screenHeight - (options.screenHeight * options.height)) / 2)
        }
    });
});
