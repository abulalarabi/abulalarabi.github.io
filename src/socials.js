for(var i=0;i<configs.icons.length;i++){
    var fai = document.createElement('div');
    fai.className = 'icons-social';

    var ico = document.createElement('a');
    ico.target="_blank";
    ico.rel = "noopener noreferrer";
    ico.href = configs.icons[i].url;
    var img = document.createElement('i');
    img.className = configs.icons[i].image;
    $(ico).append(img);
    fai.append(ico);
    $("#faicons").append(fai);
}