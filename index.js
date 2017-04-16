'use strict';
const electron = require('electron');

const app = electron.app;

// adds debug features like hotkeys for triggering dev tools and reload
//require('electron-debug')({showDevTools: true})
require('electron-debug')()

let uiWindow;

function onClosed() {
	// close all windows when ui window is closed
	const windows = electron.BrowserWindow.getAllWindows()
	for(let i = 0; i < windows.length; i++){
		windows[i].close()
	}
	app.quit()
}

app.on('ready', () => {
	uiWindow = new electron.BrowserWindow({	
		x: 0,
		y: 0,
		width: 400,
		hieght: 1000
	});
	uiWindow.loadURL(`file://${__dirname}/ui.html`)
	uiWindow.on('closed', onClosed);
});
