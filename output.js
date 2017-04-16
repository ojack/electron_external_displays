const remote = require('electron').remote
const electronScreen = require('electron').screen
const ipcRenderer = require('electron').ipcRenderer

const currWindow = remote.getCurrentWindow()

console.log(currWindow)
//include non-electron npm module
const streamToDevice = require('stream-to-device')

//list displays
let displays = electronScreen.getAllDisplays()

var deviceStream
var uiCoords = [0, 0]
var externalDisplays = []

//get user camera
var getUserMedia = require('getusermedia')
getUserMedia(function (err, stream) {
    // if the browser doesn't support user media 
    // or the user says "no" the error gets passed 
    // as the first argument. 

    if (err) {
       console.log('failed')
    } else {
       console.log('got a stream', stream)  

       //init audio streaming to specific device
       deviceStream = streamToDevice(stream, 'default')

       //add video stream to thumbnail on main screen
       thumb.srcObject = stream
       thumb.play()
       initDisplayContexts(stream)
    }
})

//create video thumbnail
var thumb = document.createElement('video')
thumb.width = 300
thumb.height = 200
thumb.muted = true
thumb.style.position = "absolute"

updateCoords()
document.body.appendChild(thumb)

//Receive messages from UI and main process
//toggle between test pattern and user camera
ipcRenderer.on('show-test', (event, message) => {
    for(var i = 0; i < externalDisplays.length; i++){
      externalDisplays[i].video.style.display = "none"
      drawTestPattern(externalDisplays[i], i)
    } 
})

ipcRenderer.on('show-video', (event, message) => {
  for(var i = 0; i < externalDisplays.length; i++){
    externalDisplays[i].video.style.display = "block"
  } 
})

//set output device for audio stream
ipcRenderer.on('set-device', (event, id) => {
 if(deviceStream) deviceStream.setDevice(id)
})

//change coords of video thumbnail based on window behavior
ipcRenderer.on('set-coords', (event, coords) => {
    uiCoords = coords
    updateCoords()
})

ipcRenderer.on('blur', (event)=> {
 thumb.style.visibility = "hidden" 
  thumb.style.display = "none"
  
})

ipcRenderer.on('focus', (event)=> {
    thumb.style.display = "block"
    thumb.style.visibility = "visible"

})

function updateCoords(){
 // console.log(uiCoords, thumb)
    if(uiCoords !== null && thumb){
      var newCoords = transformCoords(uiCoords)
      var x = newCoords[0] + 10
      var y = newCoords[1] + 300
      console.log(newCoords)
      thumb.style.top = y + "px"
      thumb.style.left = x + "px"
    }
}

//Position a div to cover each external display
function initDisplayContexts(stream){
  for(let i = 0; i < displays.length; i++){
    console.log(JSON.stringify(displays[i].bounds))
    //only create context for external displays
    if(displays[i].bounds.x !== 0) console.log("x not 0");
    if(displays[i].bounds.y !== 0) console.log("y not 0");
    if(displays[i].bounds.x !== 0 || displays[i].bounds.y !== 0){
      console.log("CREATING EXTERNAL DISPLAY")
      var displayCoords = transformCoords([displays[i].bounds.x, displays[i].bounds.y])
      console.log("DISP COORDS", JSON.stringify(displayCoords))

      let div = document.createElement('div')
     
      div.style.position = "absolute"
      div.style.width = displays[i].bounds.width + "px"
      div.style.height = displays[i].bounds.height + "px"
      div.style.top = displayCoords[1] + "px"
      div.style.left = displayCoords[0] + "px"
      div.style.backgroundColor = "#000"
      console.log(div)
      document.body.appendChild(div)

      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      canvas.width = displays[i].bounds.width
      canvas.height = displays[i].bounds.height
      div.appendChild(canvas)

      let video = document.createElement('video')
      video.style.position = "absolute"
      video.style.top = "0px"
      video.style.left = "0px"
      video.muted = true
      video.style.objectFit = "fill"
      /*video.width = displays[i].bounds.width
      video.height = displays[i].bounds.height*/
      video.style.width = "100%"
     // video.style.height = "100%"
      //video.style.display = "none"
      video.srcObject = stream
      video.play()

      div.appendChild(video)
      let displayObj = {info: displays[i], displayIndex: i, div: div, ctx: ctx, width: displays[i].bounds.width, height: displays[i].bounds.height, video: video}
      externalDisplays.push(displayObj)

      
    }
  }
}


//Draws a test pattern on the canvas element for each display. 
function drawTestPattern(d){
    let ctx = d.ctx
    ctx.lineWidth = 10
    ctx.strokeStyle="#FFFFFF";
    ctx.strokeRect(0, 0, d.width, d.height)

    //draw columns
    ctx.lineWidth = 2
    let colWidth = d.width/20;
    for(var i = 1; i < 20; i++){
      ctx.moveTo(colWidth*i, 0)
      ctx.lineTo(colWidth*i, d.height)
      ctx.stroke()
    }

    //draw rows
     let rowWidth = d.height/20;
    for(var i = 1; i < 20; i++){
      ctx.moveTo(0, rowWidth*i)
      ctx.lineTo(d.width, rowWidth*i)
      ctx.stroke()
    }

    //Draw number of display index
    ctx.font = '300pt Calibri';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText(d.displayIndex, d.width/2, d.height/2+150);


}

//screen coords are written with origin of main screen at (0,0),
//while output screen has origin at farthest left screen
// if some displays have negative coords, must translate all 
function transformCoords(coords){
  let pos = currWindow.getPosition()

  
  let newCoords = [];
  newCoords[0] = coords[0]-pos[0];
  newCoords[1] = coords[1]-pos[1];
   console.log("new", JSON.stringify(newCoords))
  return(newCoords)
}





