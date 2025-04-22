var intoinfo = document.getElementById('introline');

var typewriter = new Typewriter(intoinfo, {
  loop: false,
  delay: 75,
});

/*
typewriter
  .pauseFor(2500)
  .typeString('A simple yet powerful native javascript')
  .pauseFor(300)
  .deleteChars(10)
  .typeString('<strong>JS</strong> plugin for a cool typewriter effect and ')
  .typeString('<strong>only <span style="color: #27ae60;">5kb</span> Gzipped!</strong>')
  .pauseFor(1000)
  .start();
  */

typewriter
.pauseFor(1500)
.typeString('cat ./research.txt<br>')
.pauseFor(500)
.typeString('<strong>Robotics, LLM based Planning, Human-Robot Interaction, ML</strong>')
.start();



var contactinfo = document.getElementById('contactinfo');
var typewriter2 = new Typewriter(contactinfo, {
  loop: false,
  delay: 75,
});

typewriter2
.pauseFor(6500)
.typeString('cat ./email.txt<br>')
.pauseFor(500)
.typeString('<strong>abulalarabi@tamu.edu<br>arabiabulal@gmail.com<br>Website just got migrated, hence under development...</strong>')
.start();

