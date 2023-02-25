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
let maxZoom = 3.1; // hume 3 tak zoom chahiye tha aur points me 0.1 add krne pe 0.1 add nhi hota balki 0.1....something add hota hai to last time 2.9+0.1>3.0 ho jaata hai aur zoom inn 3 ki bjaye 2.9 tak hi jaa pata hai
let currentZoom = 1;

let recordingState = false;
let mediaRecorder;

(async function () {
  let constraint = { video: true };
  let mediaStream = await navigator.mediaDevices.getUserMedia(constraint); //[#1]
  videoElement.srcObject = mediaStream;   // is line se jo bhi video feed hume webcam se mil rhi hogi hamare videoElement ke ui me show hone lag jaayegi                                  
  mediaRecorder = new MediaRecorder(mediaStream);  //[#2.]
  
  // onstart onstop ondataavailable teeno events hai  jinke saamne by default null pda hota hai 
  // aur jb inke respective fxn ko call lagate hai to ye event invoke hote hai
  mediaRecorder.onstart = function () {  // invoke when we call mediaRecorder.start() aur kyunki humne isko ek fxn assign kr diya hai so after invokation this fxn executes
    console.log("Inside on start");
  };
  mediaRecorder.ondataavailable = function (e) {  // invoke when call mediaRecorder.start() and collect data until we didn't call mediaRecorder.stop() and gives data collected btw running time of these two fxns
    console.log("Inside on data available");
    console.log(e.data);
    let videoObject = new Blob([e.data], { type: "video/mp4" });  // blob : takes data/object (video in this case) and covert the type of video to mp4
    // console.log(videoObject);
    
    // code to dowlaod record video on stop
    // videoObject/imageObject => URL

    // let videoURL = URL.createObjectURL(videoObject);
    // let aTag = document.createElement("a");
    // aTag.download = `Video${Date.now()}.mp4`;
    // aTag.href = videoURL;
    // aTag.click();

    // add video object to db
    addMedia(videoObject , "video"); // humne url ki bjaye videoObject bheja kyunki url bhejne se sometimes hum use video me convert nhi kr paate
  };
  mediaRecorder.onstop = function () {   // invoke and execute when mediaRecorder.stop() chalega
    console.log("Inside on stop");
  };
  
  // record aur capture buttons pe event async fxn ke andar isiliye lgaye hai taki tb tak mediaStream naam ka resolved promise mil chuka ho
  // agr bahar lgate events to inpe event attach ho jaate aur maybe tb tak hmare pass kuch data aaya hi na ho
  recordButton.addEventListener("click", recordMediaFun);
  capturePhoto.addEventListener("click", capturePhotoFun);
})();

for (let i = 0; i < filters.length; i++) {
  filters[i].addEventListener("click", function (e) {  // sb filters pe click event attach kar diya
    let currentFilterSelected = e.target.style.backgroundColor;  // event se value dund ke currentFilterSelected me assign karwa di
    
    if (currentFilterSelected == "") {   //[#4]
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

    // [#5]
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

// zoom in aur zoom out pe click hone se videoElement ko scale kr dete hai 
// jisse videoElement zoom in ya zoom out ho jaata hai depend ki scale ki value increase hui hai ya decrease
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

    setTimeout(function () { // [#3]
    capturePhoto.classList.remove("animate-capture");
  }, 1000);
  
  //   canvas
  let canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth; //video width
  canvas.height = videoElement.videoHeight; // video height

  let ctx = canvas.getContext("2d");

  if (currentZoom != 1) { // [#6]
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(currentZoom, currentZoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  ctx.drawImage(videoElement, 0, 0); // ye hmare feed pe dikh rhe video ka image capture kar leta hai

  // filter-div wale code se dhikhane ke liye to filter attach ho gya tha lekin actually me download krte time photos bina filter ke aa rhi thi
  // isse agr filterSelected agr none nhi hua to canvas pe ek rectangle create ho jaayega filterSelected wali properties ka
  // jo download ke time pe bhi photo pe hoga
  if (filterSelected != "none") {  
    ctx.fillStyle = filterSelected; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);   
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

  // recordingState : false means ki first time click on record button so start recording
  // recordinStarte : true means ki recording chl rhi thi 2nd time click on record button so stop recording
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

// this function update media table means add media to the table
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


/*
#1. 
navigator ek web api hai aur mediaDevices uska object hai jo input devices like camera inko connect krta hai
getUserMedia : mediaDevices obj ka ek method hai jo browser pe ek prompt deta hai jimse ye media input ki permission maangta hai. 
               Isme ek object pass hota hai jisse hum bta skte hai ki hume sirf vedio chahiye ya audio video both. 
               It returns a promise b/c ye ek promisified method hai which resolves(scb) into a object called as MediaStream.
*/

/*
#2.
mediaRecorder ek interface hai (remember interface in oops) which provides functionality to record media
iske parameterized constructor ko call lagayi jaati hai jisme hum apni mediaStream pass krte hai which gives us a object named mediaRecorder.
*/

/*
#3.
setTimeout --> isme ek callback fxn aur time pass hota hai.Jaise hi wo time out yani khatam ho jaata hai ye callback fxn ko call lga deta hai
iski jrurat hume isiliye pdi kyunki humne jo animation lagayi hai uska time 1s ka hai aur ye capturePhotoFun() to milliseconds me chal ke khatam ho jaa rha tha to iski wajah se hamari animation to dikh hi nhi rhi thi
isiliye humne setTimeout fxn lga diya taki jab tak ek second nhi ho jaata fxn capturePhotoFun() hold ho jaaye jisse hamari animation dikhe
ab koi ye bhi soch skta hai ki iss class ko htana hi kyu hai ye animation to 1s me waise hi khtam ho jaayegi
animation to khatamho jaayegi lekin ye class to nhi htegi na
aur agli baar capturePhoto ki classlist me already ye class hogi to ye class dobara se add nhi hogi aur animation nhi chlegi
that means ki agr humne iss class ko lgane ke baar remove nhi kiya to animation sirf 1 baar dekhne ko milegi
*/

/*
#4.
jab last wale div pe click hoga to jo bhi filter hoga wo hat jaayega
last wale div pe click krne se target me backgroundColor ki value "" aati hai to currentFilterSelected ki value "" hogi
to hum pahle check krenge ki kahi koi filter lga hai kya agr koi filter lga hai to hi kaam hoga wrna kuch kaam nhi hoga
agr koi filter lga hai to filter-div laao aur use remove krdo
aur currentSelectedFilter me 'none' daalo taki jab kisi durse filter pe click kre to wo apply ho ske
aur wahi se return kr jaao taki aage koi kaam na ho
*/

/*
#5.
agr uper wali dono conditions me se koi condition nhi lgi
to fir hum niche aate hai 
aur ek div create krke uspe filter-div class lga dete hai
aur us div ka background color jo currentfilter hai wo set kr dete hai

agr to filterSelected 'none' hua that means ki koi filter nhi lga hai sidha iss filter ko lga do
lekin agr filterSelected 'none' nhi hai that means ki pahle se koi filter lga hua hai to pahle us filter ko remove kro aur fir ye filter lagao

aur last me hum filterSelected me currentFilterSelected daal dete hai taki next time jab kisi dusre filter pe click hoto saari condition updated filterSelected ke saath check ho

filterSelected = currentFilterSelected;
ye wali line hum if else se pahle nhi likh skte 
kyunki let's assume ki first time kisi filter pe click hua hai
aur uske liye div bna filter-div class lgi background set hua 
aur hume filterSelected = currentFilterSelected kr diya 
to ab filterSelected 'none' to hai nhi to hum else me jaayenge 
aur filter-div wale div ko remove krne ki koshish krenge joki hai hi nhi aur error aa jaayega
that why we can't write this line before if-else condition.
*/

/*
#6. Canvas Problem - Check Video
*/