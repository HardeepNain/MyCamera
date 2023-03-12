// initialize DB
let db;

let dbOpenRequest = indexedDB.open("Gallery", 1);
dbOpenRequest.onupgradeneeded = function (e) {
  db = e.target.result;
  db.createObjectStore("Media", { keyPath: "mid" }); // Object Store will only be create when db is create first time
};

dbOpenRequest.onsuccess = function (e) {
  db = e.target.result;
};

dbOpenRequest.onerror = function (e) {
  alert("Inside on error !!");
};

/*
Jaise hi hmara code run hoga to Gallery ke naam se indexedDB me ek database create ho jaayega
*/

