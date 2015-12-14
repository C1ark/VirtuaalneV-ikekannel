// HTML FEATURE CHECK //

//Does support MP3 audio?
var a = document.createElement('audio');
if (!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''))) {
    console.log("Browser supports MP3.");
    FileFormat = "mp3";
} else {
    console.log("Browser dosen't support MP3. Checking for OGG support.");
    if (!!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''))) {
        console.log("Browser supports OGG.");
        FileFormat = "mp3";
    } else {
        console.log("Browser dosen't support OGG. Fallback also failed. Notifying user.");
        alert("Kahjuks ei toeta teie brauser ei OGG ega MP3 faili formaate.");
        throw new Error("No audio is availible. Stopping script execution.");
    }
}

// DEFINING STUFF //

//Preload audio and image.
Sounds = [loadAudio("RA." + FileFormat), loadAudio("SO." + FileFormat), loadAudio("NA." + FileFormat), loadAudio("MI." + FileFormat), loadAudio("LE." + FileFormat), loadAudio("JO." + FileFormat), loadAudio("AlumineSo." + FileFormat)];
Background = loadImage("Kannel.png");

//Set some values before program runs.
ColorCodes = ["#555555", "#00FF00", "#990000", "#FF0000"];
Ratio = 229/1000;
Scale = 1;
keysDown = {};
AbsoluteStrings = [{"N":0, "SX":959, "SY":172, "EX":438, "EY":186, "CC":"#555555", "T":4, "Status":0}, {"N":1, "SX":959, "SY":167, "EX":418, "EY":164, "CC":"#555555", "T":4, "Status":0}, {"N":2, "SX":959, "SY":162, "EX":400, "EY":144, "CC":"#555555", "T":4, "Status":0}, {"N":3, "SX":959, "SY":157, "EX":376, "EY":118, "CC":"#555555", "T":4, "Status":0}, {"N":4, "SX":959, "SY":152, "EX":357, "EY":98, "CC":"#555555", "T":4, "Status":0}, {"N":5, "SX":959, "SY":147, "EX":337, "EY":78, "CC":"#555555", "T":4, "Status":0}, {"N":6, "SX":959, "SY":142, "EX":317, "EY":57, "CC":"#555555", "T":4, "Status":0}];
Strings = AbsoluteStrings;

canvas = document.getElementById("KannelCanvas");
jumbo = document.getElementById("jumbotron");
ctx = canvas.getContext('2d');

filesToLoad = 8;
filesLoaded = 0;


// HIT DETECTION //


function PointDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2));
}

function getMousePos(canvas, evt) {
    //Get the mouse position withing the canvas.
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

//Mathematics.
//Calculate the area of a triangle with the 3 points we know.
//Then extrapolate the height of the triangle via S = ah/2
function LinePointDistance(x1, y1, x2, y2, x3, y3) {
    //Line runs from (x1;y1) to (x2;y2).
    //Point is (x3:y3)
    a = PointDistance(x1, y1, x3, y3);
    b = PointDistance(x2, y2, x3, y3);
    c = PointDistance(x1, y1, x2, y2);

    S = (Math.sqrt((a+b+c) * (-a+b+c) * (a-b+c) * (a+b-c))/4);
    h = (S * 2) / a;
    return h
}


// PRELOADING //


function loadImage(uri)
{
    var img = new Image();
    img.onload = isAppLoaded;
    img.src = uri;
    return img;
}

function loadAudio(uri)
{
    var audio = new Audio();
    //audio.onload = isAppLoaded; // It doesn't works!
    audio.addEventListener('canplaythrough', isAppLoaded, false); // It works!!
    audio.src = uri;
    return audio;
}

function isAppLoaded()
{
    filesLoaded++;
    if (filesLoaded >= filesToLoad) {
        main();
    };
}


// CANVAS DRAWING //


function DrawLine(StartX, StartY, EndX, EndY, ColorCode, Thickness) {
    ctx.beginPath();
    ctx.moveTo(StartX, StartY);
    ctx.lineTo(EndX, EndY);
    ctx.lineWidth = Thickness;
    ctx.strokeStyle = ColorCode;
    ctx.stroke();
}

function ClearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// STRING FUNCTIONS //


function setStatus(StringData, Status) {
    StringData["Status"] = Status;
    StringData["CC"] = ColorCodes[Status];
    DrawString(StringData);
}

function PlayString(StringData) {
    Sounds[StringData["N"]].play();
    Sounds[StringData["N"]].onended = function () {
        setStatus(StringData, 0);
    }
    setStatus(StringData, 1);
}

function MuteString(StringData) {
    if (StringData["Status"] == 0) {
        Sounds[StringData["N"]].pause();
        Sounds[StringData["N"]].currentTime = 0;
    }
    setStatus(StringData, 2);
}

function UnmuteString(StringData) {
    setStatus(StringData, 0);
}

function StringTouch(StringData) {
    if (StringData["Status"] == 0) {
        PlayString(StringData);
    } else {
        if (StringData["Status"] == 2) {
            setStatus(StringData, 3);
            setTimeout(function () {
                if (StringData["Status"] == 3) {
                    if ((StringData["N"] + 50) in keysDown) {
                        setStatus(StringData, 2);
                    } else {
                        setStatus(StringData, 0);
                    }
                }
            }, 1000)
        }
    }
}


// EVENT HANDLING //


function handlemousemove(e) {
    MC = getMousePos(canvas, e);
    //console.log("###############333");
    //console.log(MC);
    N = 0;
    while (N < Strings.length) {
        LPD = LinePointDistance(Strings[N]["SX"] * Scale, Strings[N]["SY"] * Scale, Strings[N]["EX"] * Scale, Strings[N]["EY"] * Scale, MC.x, MC.y);
        if (LPD < 50 * Scale) {
            StringTouch(Strings[N]);
        }
        //console.log(LPD);
        N = N + 1;
    }
}

function handleCordToggle(Keycode, BeingHeld) {
    //If the keycode is a number key from 2 to 8. Keycodes 50 to 56
    if (Keycode > 49 && Keycode < 57) {
        StringID = Keycode - 50;
        String = Strings[StringID];
        if (BeingHeld) {
            MuteString(String);
        } else {
            UnmuteString(String);
        }
    }
}


// REDRAWING FUNCTIONS //


function DrawString(StringData) {
    DrawLine(StringData["SX"] * Scale, StringData["SY"] * Scale, StringData["EX"] * Scale, StringData["EY"] * Scale, StringData["CC"], StringData["T"] * Scale);
}

function DrawBackground() {
    canvas.width = jumbo.offsetWidth - 120;

    //If the entierty of the background image fits show it in full size.
    if (canvas.width > 1000) {
        canvas.height = 229;
        Scale = 1;
        ctx.drawImage(Background, 0, 0);
    } else {
        //Otherwise scale it down to fit.
        Scale = (jumbo.offsetWidth - 120) / 1000;
        canvas.height = canvas.width * Ratio;
        ctx.drawImage(Background, 0, 0, canvas.width, canvas.height);
    }
}

function DrawStrings() {
    N = 0;
    while (N < Strings.length) {
        DrawString(Strings[N]);
        N = N + 1;
    }
}

function Redraw() {
    ClearCanvas();
    DrawBackground();
    DrawStrings();
}


// INITIALIZATSION FUNCTION //


function main() {
    //Draw the entire instrument.
    Redraw();

    //Hook into resize, mousemove and keyboard events.
    canvas.onmousemove = handlemousemove;
    window.onresize = Redraw;

    addEventListener("keydown", function(e) {
        if (e.keyCode in keysDown) {} else {
            handleCordToggle(e.keyCode, true);
        }
        keysDown[e.keyCode] = true;
    }, false);
    addEventListener("keyup", function(e) {
        handleCordToggle(e.keyCode, false);
        delete keysDown[e.keyCode];
    }, false);
}