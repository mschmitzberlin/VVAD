
function setmsg () {
  postMessage ("running");
}

function storageEventHandler(evt){
  console.log( evt.key );
}

  onmessage = function (event) {
    
    var eventData = event.data;
    if (eventData =="start") {
        msgInterval = setInterval ("setmsg()", 1000);
    }
    if (eventData =="stop") {
        clearInterval(msgInterval);
       
    }
    postMessage("running" + eventData);
  };