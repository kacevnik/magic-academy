var TIMER_COUNT=10,Time=0,tid=0,Msg='',RedirectUrl='',arrTimer=new Array();
function prepareTimers(){
  if(arrTimer.length>0){return 1;}
  for(var i=0;i<TIMER_COUNT;++i){
    var t=document.getElementById('timer'+i);
    if(t){arrTimer.push(t);}
  }
  return arrTimer.length>0 ? 1 : 0;
}
function ShowTime(){if(Time--<=0){clearInterval(tid);if(RedirectUrl!=''){window.location=RedirectUrl;}else{var t=document.getElementById('timer_content_div');if(t){t.innerHTML=Msg;}}return true;}
if ((arrTimer.length>0)||prepareTimers()){
var H=Time/(60*60);
H=(H-H%1)+'';if(H.length<2){H='0'+H;}var M=(Time-H*60*60)/60;M=(M-M%1)+'';if(M.length<2){M='0'+M;}var S=(Time-H*60*60-M*60)+'';if(S.length<2){S='0'+S;}
var txt=H+' часов '+M+' мин. '+S+' сек.';
for(var i=0,Ln=arrTimer.length;i<Ln;++i){
arrTimer[i].innerHTML=txt;
}}}
window.addEventListener('load', function() {prepareTimers();tid=setInterval(ShowTime,1000);}, false);