// Keep the original interactive background without unbounded particles or hidden-tab work.
(() => {
  function updateBackground() {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    const light = document.documentElement.dataset.theme === 'light';
    const stops = light
      ? [[0, [225, 228, 233]], [5, [231, 234, 239]], [8, [246, 248, 251]], [12, [255, 255, 255]], [17, [244, 247, 250]], [20, [231, 234, 239]], [24, [225, 228, 233]]]
      : [[0, [0, 0, 0]], [5, [4, 5, 7]], [8, [13, 15, 20]], [12, [28, 31, 38]], [17, [17, 19, 25]], [20, [5, 6, 9]], [24, [0, 0, 0]]];
    const index = stops.findIndex(([time]) => time > hour);
    const [startHour, start] = stops[index - 1];
    const [endHour, end] = stops[index];
    const progress = (hour - startHour) / (endHour - startHour);
    const color = start.map((value, channel) => Math.round(value + (end[channel] - value) * progress));
    document.documentElement.style.setProperty('--sky-color', `rgb(${color.join(', ')})`);
  }
  updateBackground();
  window.setInterval(() => { if (!document.hidden) updateBackground(); }, 60000);
  document.addEventListener('themechange', updateBackground);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateBackground(); });

  if (typeof particlesJS !== 'function') return;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const particleColor = () => document.documentElement.dataset.theme === 'light' ? '#536b91' : '#ffffff';
  particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": window.innerWidth < 700 ? 40 : 80,
        "density": {
          "enable": false,
          "value_area": 700
        }
      },
      "color": {
        "value": particleColor()
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
        "polygon": {
          "nb_sides": 5
        },
      },
      "opacity": {
        "value": 0.5,
        "random": false,
        "anim": {
          "enable": false,
          "speed": 0.1,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 3,
        "random": true,
        "anim": {
          "enable": false,
          "speed": 10,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": particleColor(),
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": !motionPreference.matches && !document.hidden,
        "speed": 0.5,
        "direction": "none",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": false,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "window",
      "events": {
        "onhover": {
          "enable": !motionPreference.matches,
          "mode": "grab"
        },
        "onclick": {
          "enable": false,
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 140,
          "line_linked": {
            "opacity": 1
          }
        },
        "bubble": {
          "distance": 400,
          "size": 40,
          "duration": 2,
          "opacity": 8,
          "speed": 3
        },
        "repulse": {
          "distance": 200,
          "duration": 0.4
        },
        "push": {
          "particles_nb": 4
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true
  });

  const scene = window.pJSDom[window.pJSDom.length - 1].pJS;
  function updateMotion() {
    window.cancelRequestAnimFrame(scene.fn.drawAnimFrame);
    scene.particles.move.enable = !motionPreference.matches && !document.hidden;
    scene.interactivity.events.onhover.enable = !motionPreference.matches;
    if (!document.hidden) scene.fn.vendors.draw();
  }
  document.addEventListener('visibilitychange', updateMotion);
  motionPreference.addEventListener('change', updateMotion);
  document.addEventListener('themechange', () => {
    const color = particleColor();
    const rgb = color === '#ffffff' ? { r: 255, g: 255, b: 255 } : { r: 83, g: 107, b: 145 };
    scene.particles.color.value = color;
    scene.particles.line_linked.color = color;
    scene.particles.line_linked.color_rgb_line = rgb;
    scene.particles.array.forEach((particle) => { particle.color.rgb = rgb; });
    if (!document.hidden) scene.fn.particlesDraw();
  });
  document.addEventListener('click', (event) => {
    if (motionPreference.matches || document.hidden || document.querySelector('dialog[open]')) return;
    if (event.target.closest('a, button, input, textarea, select, summary, .publication-card')) return;
    const count = Math.min(4, 140 - scene.particles.array.length);
    if (count <= 0) return;
    const ratio = scene.canvas.pxratio || 1;
    scene.fn.modes.pushParticles(count, { pos_x: event.clientX * ratio, pos_y: event.clientY * ratio });
  });
})();
