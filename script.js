let videoElement = document.querySelector("video");
let recordButton = document.querySelector(".inner-record");
let capturePhoto = document.querySelector(".inner-capture");
let filters = document.querySelectorAll(".filter");
let filterSelected = "none";
let zoomIn = document.querySelector(".zoomIn");
let zoomOut = document.querySelector(".zoomOut");
let galleryBtn = document.querySelector(".gallery-btn");

galleryBtn.addEventListener("click" , function(){
  window.location.assign("gallery.html");   // it is used to load a new document(html).
})

let minZoom = 1;
let maxZoom = 3.1;
let currentZoom = 1;

let recordingState = false;
let mediaRecorder;

(async function () {
  let constraint = { video: true };
  let mediaStream = await navigator.mediaDevices.getUserMedia(constraint);  // ye method browser pe ek prompt deta hai jimse ye media input ki permission maangta hai.isme ek object pass hota hai. it returns a promise
  videoElement.srcObject = mediaStream;   // is line se jo bhi video feed hume webcam se mil rhi hogi hamare videoElement me show hone lag jaayegi                                  
  mediaRecorder = new MediaRecorder(mediaStream);  // mediaRecorder naam ka ek nya object banta hai. Aur parameterized constructor ko call lagayi jaati hai
  // onstart onstop ondataavailable teeno events hai jo unke respective fxn ko call lagane se invoke hote hai
  mediaRecorder.onstart = function () {  // invoke and execute when mediaRecorder.start() chalega
    console.log("Inside on start");
  };
  mediaRecorder.ondataavailable = function (e) {  // invoke and execute when mediaRecorder.start() and mediaRecorder.stop() both executed and gives data collected btw running time of these two fxns
    console.log("Inside on data available");
    console.log(e.data);
    let videoObject = new Blob([e.data], { type: "video/mp4" });  // isse humne video jis type me aa rhi thi use change kar diya
    // console.log(videoObject);
    // videoObject/imageObject => URL
    // aTag

    // let videoURL = URL.createObjectURL(videoObject);
    // let aTag = document.createElement("a");
    // aTag.download = `Video${Date.now()}.mp4`;
    // aTag.href = videoURL;
    // aTag.click();

    // add video object to db
    addMedia(videoObject , "video");
  };
  mediaRecorder.onstop = function () {   // invoke and execute when mediaRecorder.stop() chalega
    console.log("Inside on stop");
  };
  recordButton.addEventListener("click", recordMediaFun);
  capturePhoto.addEventListener("click", capturePhotoFun);
})();

for (let i = 0; i < filters.length; i++) {
  filters[i].addEventListener("click", function (e) {  // sb filters pe click event attach kar diya
    let currentFilterSelected = e.target.style.backgroundColor;  // event se value dund ke currentFilterSelected me assign karwa di
    
    if (currentFilterSelected == "") {   // jab last wale div pe click hoga to target me backgroundColor ki value "" aati hai to jisse filter hat jata hai
      if (document.querySelector(".filter-div")) {
        document.querySelector(".filter-div").remove();
        filterSelected = "none";
        return;
      }
    }

    console.log(currentFilterSelected);
    if (filterSelected == currentFilterSelected) {  // agr koi filter pahle se selected hai aur usi pe dobara click krenge to kuch nhi hoga sidha return ho jaayega
      return;
    }

    let filterDiv = document.createElement("div");  // click hote hi ek nya div bnega
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = currentFilterSelected;  // us div ka backgroundColor me humne currentFilterSelected assign kar diya taki lage ki filter apply ho gya hai

    if (filterSelected == "none") {  // agr koi bhi filter selected nhi hoga to sidha div append ho jaayega
      document.body.append(filterDiv);
    } else {                                    // agr koi bhi filter selected hua to pahle jis filter ka div lag rkha ha wo remove hoga fir nya div append ho jaayega
      document.querySelector(".filter-div").remove();
      document.body.append(filterDiv);
    }
    filterSelected = currentFilterSelected;
  });
}

zoomIn.addEventListener("click", function () {
  if (currentZoom + 0.1 > maxZoom) {
    return;
  }
  currentZoom = currentZoom + 0.1;
  videoElement.style.transform = `scale(${currentZoom})`;
});

zoomOut.addEventListener("click", function () {
  if (currentZoom - 0.1 < minZoom) {
    return;
  }
  currentZoom = currentZoom - 0.1;
  videoElement.style.transform = `scale(${currentZoom})`;
});

function capturePhotoFun() {
  capturePhoto.classList.add("animate-capture");

  // setTimeout --> isme ek callback fxn aur time pass hota hai.Jaise hi wo time out yani khatam ho jaata hai ye callback fxn ko call lga deta hai
  // iski jrurat hume isiliye pdi kyunki humne jo animation lagayi hai uska time 1s ka hai aur ye capturePhotoFun() to milliseconds me chal ke khatam ho jaa rha tha to iski wajah se hamari animation to dikh hi nhi rhi thi 
  // isiliye humne setTimeout fxn lga diya taki jab tak ek second nhi ho jaata fxn capturePhotoFun() hold ho jaaye jisse hamari animation dikhe
  setTimeout(function () {
    capturePhoto.classList.remove("animate-capture");
  }, 1000);

  //   canvas
  let canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth; //video width
  canvas.height = videoElement.videoHeight; // video height

  let ctx = canvas.getContext("2d");

  if (currentZoom != 1) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(currentZoom, currentZoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  ctx.drawImage(videoElement, 0, 0); // ye hmare feed pe dikh rhe video ka image capture kar leta hai

  if (filterSelected != "none") {  // isse agr filterSelected agr none nhi hua to 
    ctx.fillStyle = filterSelected;  
    ctx.fillRect(0, 0, canvas.width, canvas.height);   // canvas pe ek rectangle create ho jaayega filterSelected wali properties ka
  }

  // download canvas as an image
  // let aTag = document.createElement("a");
  // aTag.download = `Image${Date.now()}.jpg`;
  // aTag.href = canvas.toDataURL("image/jpg");
  // aTag.click();

  // save image to DB
  let canvasURL = canvas.toDataURL("image.jpg");
  addMedia(canvasURL, "photo");
}

function recordMediaFun() {
  if (recordingState) {
    // already recording is going on
    // stop the recording
    mediaRecorder.stop();
    recordingState = false;
    recordButton.classList.remove("animate-record");
  } else {
    // start the recording
    mediaRecorder.start();
    recordingState = true;
    recordButton.classList.add("animate-record");
  }
}

function addMedia(mediaURL, mediaType) {
  //   db me media add hojaega
  let txnObject = db.transaction("Media", "readwrite"); // start transaction on mediaTable
  let mediaTable = txnObject.objectStore("Media"); // this will get access to mediaTable

  mediaTable.add({ mid: Date.now(), type: mediaType, url: mediaURL }); // it will add this object in mediaTable or mediaStore

  txnObject.onerror = function (e) {
    console.log("txn failed");
    console.log(e);
  };
}
