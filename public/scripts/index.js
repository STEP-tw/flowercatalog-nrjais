let animatePot = function(event){
  let flower = event.target;
  flower.style.visibility = 'hidden';
  setTimeout(()=>{
    flower.style.visibility = 'visible';
  },1000);
}

let init = function(){
  document.getElementById('flowergif').onclick = animatePot;
}

window.onload = init;
