(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{13:function(e,n,t){e.exports=t(21)},19:function(e,n,t){},20:function(e,n,t){},21:function(e,n,t){"use strict";t.r(n);var a=t(1),o=t.n(a),r=t(5),i=t.n(r),c=(t(19),t(6)),l=t(7),s=t(11),d=t(8),u=t(12),g=t(9),h=t.n(g),m=(t(20),t(3)),p=t(10),f=function(e){function n(e){var t;return Object(c.a)(this,n),(t=Object(s.a)(this,Object(d.a)(n).call(this,e))).componentWillMount=function(){},t.state={darkBackgroundModes:["day","terminal","torquoise","alizarin","amythyst","carrot","peterriver"],lightBackgroundModes:["night","lightred","lightpurple","lightgreen","lightblue","lightyellow"],backgroundType:m.backgroundType,appClass:m.plainBackgroundMode,devIntro:m.devIntro,devDesc:m.devDesc,backgroundMode:"default",backgroundIndex:0,bgStyle:{},icons:m.icons||[],tagLine:m.tagLine},t}return Object(u.a)(n,e),Object(l.a)(n,[{key:"render",value:function(){var e=this.state,n=e.appClass,t=e.bgStyle,a=e.backgroundMode,r=e.devIntro,i=e.devDesc,c=e.icons,l=e.tagLine;return o.a.createElement("div",{className:n,style:t},o.a.createElement("div",{className:a},o.a.createElement("main",{className:"App-main"},o.a.createElement(p.a,{type:"lines",bg:!0}),o.a.createElement("div",{className:"container"},o.a.createElement("h1",{className:"intro"},r),o.a.createElement("div",{className:"shell"},o.a.createElement(h.a,null,l)),o.a.createElement("div",{className:"tagline"},i),o.a.createElement("div",{className:"icons-social"},c.map(function(e,n){return o.a.createElement("a",{target:"_blank",key:n,rel:"noopener noreferrer",href:"".concat(e.url)},o.a.createElement("i",{className:"fab ".concat(e.image)}),o.a.createElement("i",{className:"faa ".concat(e.image)}))}))))))}}]),n}(a.Component),v=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function b(e,n){navigator.serviceWorker.register(e).then(function(e){e.onupdatefound=function(){var t=e.installing;null!=t&&(t.onstatechange=function(){"installed"===t.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://bit.ly/CRA-PWA."),n&&n.onUpdate&&n.onUpdate(e)):(console.log("Content is cached for offline use."),n&&n.onSuccess&&n.onSuccess(e)))})}}).catch(function(e){console.error("Error during service worker registration:",e)})}i.a.render(o.a.createElement(f,null),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL(".",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",function(){var n="".concat(".","/service-worker.js");v?(function(e,n){fetch(e).then(function(t){var a=t.headers.get("content-type");404===t.status||null!=a&&-1===a.indexOf("javascript")?navigator.serviceWorker.ready.then(function(e){e.unregister().then(function(){window.location.reload()})}):b(e,n)}).catch(function(){console.log("No internet connection found. App is running in offline mode.")})}(n,e),navigator.serviceWorker.ready.then(function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://bit.ly/CRA-PWA")})):b(n,e)})}}()},3:function(e){e.exports={backgroundType:"plain",plainBackgroundMode:"daylight",devIntro:"Abul Al Arabi",devDesc:"Under Construction",gradientColors:"#EE7752, #E73C7E, #23A6D5, #23D5AB",backgroundImageUrl:"http://hdwpro.com/wp-content/uploads/2017/03/Art-Background-Image.png",tagLine:"root@root:~# echo HCI and Robotics Enthusiast",icons:[{image:"fa-scholar",url:"https://scholar.google.com/citations?user=zekn92QAAAAJ&hl=en&oi=ao"},{image:"fa-github",url:"https://github.com/abulalarabi/"},{image:"fa-twitter",url:"https://twitter.com/abulalarabi"},{image:"fa-linkedin",url:"https://www.linkedin.com/in/abul-al-arabi"}]}}},[[13,1,2]]]);
//# sourceMappingURL=main.179ec2f1.chunk.js.map