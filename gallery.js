//yha pe db dobara se create kiya taki agr db na ho to creat ho jaaye
// agr ho to sidha onsuccess chalega aur fetchMedia ko call lg jaayegi
let db;
let dbOpenRequest = indexedDB.open("Gallery", 1);
dbOpenRequest.onupgradeneeded = function (e) {
  db = e.target.result;
  db.createObjectStore("Media", { keyPath: "mid" }); // table will only be create when db is create first time
};
dbOpenRequest.onsuccess = function (e) {
  db = e.target.result;
  fetchMedia();
};
dbOpenRequest.onerror = function (e) {
  alert("Inside on error !!");
};

// same wahi indexedDB.html (facts) me showMedia wale fxn jaisa kaam hai iska 
function fetchMedia() {
  let txnObject = db.transaction("Media", "readonly");
  let mediaTable = txnObject.objectStore("Media");
  let cursorObject = mediaTable.openCursor(); // to iterate on all the rows / tuples
  cursorObject.onsuccess = function (e) {
    let cursor = cursorObject.result;  // isse ek row milegi
    if (cursor) {
      let mediaObj = cursor.value;  // us row me se value yani media ka object milega
      if (mediaObj.type == "photo") {  
        appendPhoto(mediaObj);
      } else {
        appendVideo(mediaObj);
      }
      cursor.continue();
    }
  };
}

function appendPhoto(mediaObj) {
  
  // sbse pahle aate hi ui create hoga particular photo ke liye
  // aur kyunki src me media.url daala hai isiliye img me hume clicked photo dhikegi
  let mediaDiv = document.createElement("div");
  mediaDiv.classList.add("media-div");
  mediaDiv.innerHTML = `<img class="media-img" src=${mediaObj.url } alt=""> 
    <div class="media-buttons">
        <div class="download-media">Download</div>
        <div class="delete-media">Delete</div>
    </div>`;
  mediaDiv.querySelector(".download-media").addEventListener("click", function () {
      downloadMedia(mediaObj);
    });
  mediaDiv.querySelector(".delete-media").addEventListener("click", function () {
      deleteMedia(mediaObj, mediaDiv);
    });

  document.querySelector(".gallery").append(mediaDiv);
}

function appendVideo(mediaObj) {
  let mediaDiv = document.createElement("div");
  mediaDiv.classList.add("media-div");
  mediaDiv.innerHTML = `<video class="media-video" controls autoplay loop></video>
    <div class="media-buttons">
        <div class="download-media">Download</div>
        <div class="delete-media">Delete</div>
    </div>`;
  mediaDiv.querySelector("video").src = URL.createObjectURL(mediaObj.url); //[#1]
  mediaDiv
    .querySelector(".download-media")
    .addEventListener("click", function () {
      downloadMedia(mediaObj);
    });
  mediaDiv
    .querySelector(".delete-media")
    .addEventListener("click", function () {
      deleteMedia(mediaObj, mediaDiv);
    });
  document.querySelector(".gallery").append(mediaDiv);
}

function downloadMedia(mediaObject) {
  let aTag = document.createElement("a");
  if (mediaObject.type == "photo") {
    aTag.download = `${mediaObject.mid}.jpg`;
    aTag.href = mediaObject.url;
  } else {
    aTag.download = `${mediaObject.mid}.mp4`;
    aTag.href = URL.createObjectURL(mediaObject.url);
  }
  aTag.click();
}

function deleteMedia(mediaObject, mediaDiv) { // sath me mediaDiv bhi pass kiya hai jisse ui se remove kr skenge
  let mid = mediaObject.mid;
  let txnObject = db.transaction("Media", "readwrite");
  let mediaTable = txnObject.objectStore("Media");
  mediaTable.delete(mid); // db se remove us key aur value ko jo mid di hogi

  mediaDiv.remove(); //UI se remove
}

/*
#1. 
kyunki humne script.js me media ko add krne wale fxn addMedia() me url key me mediaURL daal rkha hai
aur jab addMedia() fxn ko video ke case me call lgti hai tb humne videoObject pass kiya hai naki koi url
so cursor.value gives us mediaObj => { mid: Date.now(), type: mediaType, url: mediaURL } (something like this)
mediaObj.url gives us mediaURL => which is a videoObject 
then we convert this videoObject to a url jisko finally src me assign krwa dete hai
(photo ke case me hume media.URL ek url hi deta hai jise sidhe src me assgin krwa skte hai)
*/