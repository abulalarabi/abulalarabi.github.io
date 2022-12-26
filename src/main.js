
function aboutme(){
    var abttxt = about.about;
    var placeholder = document.getElementById("aboutmetext");
    placeholder.textContent = abttxt;
}

//var tabs = []

(function() {
    aboutme();
    configs.focusedDiv = "about";
 })();


