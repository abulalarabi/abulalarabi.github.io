var configs = {
  "backgroundType": "plain",
  "plainBackgroundMode": "daylight",
  "devIntro": "Abul Al Arabi",
  "devDesc": "Under Construction",
  "gradientColors": "#EE7752, #E73C7E, #23A6D5, #23D5AB",
  "backgroundImageUrl": "http://hdwpro.com/wp-content/uploads/2017/03/Art-Background-Image.png",
  "tagLine": "root@ab:~# echo HCI and Robotics Enthusiast",
  "icons": [
    {
      "image": "fa fa-graduation-cap",
      "url": "https://scholar.google.com/citations?user=zekn92QAAAAJ&hl=en&oi=ao"
    },
    {
      "image": "fab fa-github",
      "url": "https://github.com/abulalarabi/"
    },
    {
      "image": "fab fa-twitter",
      "url": "https://twitter.com/abulalarabi"
    },
    {
      "image": "fab fa-linkedin",
      "url": "https://www.linkedin.com/in/abul-al-arabi"
    },
    {
      "image": "fab fa-researchgate",
      "url": "https://www.researchgate.net/profile/Abul-Al-Arabi"
    }
    
  ]
}


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