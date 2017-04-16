Hacky way to send the same media stream to multiple displays in electron.

Click to show test pattern or local user media in each external display.

### To run:
```node install```
```npm run start```

### Why?
I couldn't find a way to share MediaStreamObjects between individual Electron BrowserWindows, without writing to a local file.


### How does it work?
Giant transparent window covers all available connected displays. Content is positioned so that it appears full screen in external monitors. 
(output.js)

UI windows sends information to displays via IPC. Stream preview window on main screen is positioned relative to UI window (buggy)
(ui.js)


