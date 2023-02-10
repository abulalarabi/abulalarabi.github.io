
function aboutme(){
    var abttxt = about.about;
    var placeholder = document.getElementById("aboutmetext");
    placeholder.textContent = abttxt;
}

var hideTabs = ['research','education','skills','projects','awards','outreach','gallery'];

(function() {
    hideTabs.forEach(element => {
        //console.log(element);
        $('#'+element).hide();
    });

    aboutme();
    configs.focusedDiv = "about";
    
    
 })();


