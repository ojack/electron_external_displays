
const BrowserWindow = require('electron').remote.BrowserWindow
const electronScreen = require('electron').screen
const enumerateDevices = require('enumerate-devices')
const currWindow = require('electron').remote.getCurrentWindow()



let displays = electronScreen.getAllDisplays()
var windowCoords = [window.screenX, window.screenY]

console.log(displays)

// Output window is a transparent window that extends to cover all of the available displays. 
//It has click events disabled so that it will be possible to interact 
//with external elements on main screen. Media streams and visual elements
// are all rendered to output window.
//
//UI elements are in other window (UI window)

const outputWindow = createOutputWindow(getExtent(displays))


function createOutputWindow(extent) {
	console.log("extent", extent)
	const win = new BrowserWindow({
		width: extent.width, 
		height: extent.height,
		x: extent.x,
		y: extent.y,
		frame: false,
		nodeIntegration: true,
		enableLargerThanScreen: true,
		transparent: true,
		backgroundThrottling: false,

		alwaysOnTop: true,
		hasShadow:false
	});

	win.loadURL(`file://${__dirname}/output.html`)
	win.setIgnoreMouseEvents(true)
	
	win.on('ready-to-show', function(){
		initOutputParams()//not working for some reason
	})
	return win;
}

// Get extent of ALL available displays, create transparent window to cover all displays
function getExtent(displays){
	let minX, minY, maxX, maxY
	minX = minY = maxX = maxY = 0

	for(var i = 0; i < displays.length; i++){
		minX = Math.min(minX, displays[i].bounds.x)
		minY = Math.min(minY, displays[i].bounds.y)
		maxX = Math.max(maxX, displays[i].bounds.x + displays[i].bounds.width)
		maxY = Math.max(maxY, displays[i].bounds.y + displays[i].bounds.height)
	}

	let params = {x: minX, y: minY, width: maxX-minX, height: maxY-minY};
	console.log(params)
	return {x: minX, y: minY, width: maxX-minX, height: maxY-minY}
}


///Communication between UI elements to output window via IPC

function initOutputParams(){
	outputWindow.webContents.send('set-coords', windowCoords);
}

const testBtn = document.getElementById('test-button')
testBtn.addEventListener('click', function (event) {
	outputWindow.webContents.send('show-test');
})

const videoBtn = document.getElementById('video-button')
videoBtn.addEventListener('click', function (event) {
	outputWindow.webContents.send('show-video');
})

//Check for window position change. Electron's browser window 'onmove' event
// is only fired on mac when move has completed. 


/*var interval = setInterval(function(){
  if(windowCoords[0] != window.screenX || windowCoords[1] != window.screenY){
    console.log('moved!');
    windowCoords[0] = window.screenX;
  	windowCoords[1] = window.screenY;
    outputWindow.webContents.send('set-coords', windowCoords);
  } else {
  	windowCoords[0] = window.screenX;
  	windowCoords[1] = window.screenY;
    //console.log('not moved!');
  }
}, 100);*/
currWindow.on('move', function(){
	windowCoords[0] = window.screenX;
  	windowCoords[1] = window.screenY;
	outputWindow.webContents.send('set-coords', windowCoords);
})

currWindow.on('blur', function(){
	outputWindow.webContents.send('blur');
})

currWindow.on('focus', function(){
	outputWindow.webContents.send('focus');
})

currWindow.on('hidden', function(){
	outputWindow.webContents.send('blur');
})
// create dropdown of available hardware devices 
    enumerateDevices().then(function(devices) {
        var select = document.createElement('select');
 
        devices.forEach(function(d){
            if(d.kind==='audiooutput' || d.kind==='videooutput') {
                var option = document.createElement('option')
      		    option.value = d.deviceId
      		    option.text = d.label;
      		    select.appendChild(option)
            }
        })
 
        document.body.appendChild(select)
 
        //set device on selection 
        select.onchange = function(e){
        	outputWindow.webContents.send('set-device', e.target.value);
           // stream.setDevice(e.target.value)
        }
        
    }).catch(function(err) {
        throw(err)
    })


