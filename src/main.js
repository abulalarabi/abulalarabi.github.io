
function aboutme(){
    var abttxt = about.about;
    var placeholder = document.getElementById("aboutmetext");
    placeholder.textContent = abttxt;
}

var hideTabs = ['awards', 'workshops','skills','projects'];

(function() {
    hideTabs.forEach(element => {
        //console.log(element);
        $('#'+element).hide();
    });

    aboutme();
    configs.focusedDiv = "about";
    
    
 })();


