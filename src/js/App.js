import React, { Component } from 'react';
import Typist from 'react-typist';
import '../styles/App.css';
import Configs from '../data/configurations.json';
import ParticlesBg from 'particles-bg'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      darkBackgroundModes: [
        'day',
        'terminal',
        'torquoise',
        'alizarin',
        'amythyst',
        'carrot',
        'peterriver'
      ],
      lightBackgroundModes: [
        'night',
        'lightred',
        'lightpurple',
        'lightgreen',
        'lightblue',
        'lightyellow'
      ],
      backgroundType: Configs.backgroundType,
      appClass: Configs.plainBackgroundMode,
      devIntro: Configs.devIntro,
      devDesc:  Configs.devDesc,
      backgroundMode: 'default',
      backgroundIndex: 0,
      bgStyle: {},
      icons: Configs.icons || []
    };
  }

  componentWillMount = () => {
    
  };

  render() {
    const {
      appClass, bgStyle, backgroundMode, devIntro, devDesc, icons
    } = this.state;

    return (
      <div className={appClass} style={bgStyle}>
        <div
          className={backgroundMode}
        >
          <main className="App-main">
            <ParticlesBg type="thick" bg={true} />
            <div className="container">
              <h1 className="intro">{devIntro}</h1>
              <div className="shell">HCI and Robotics Enthusiast</div>
              <div className="tagline">
                <Typist>{devDesc}</Typist>
              </div>
              
              <div className="icons-social">
                {icons.map((icon, i) => (
                  <a
                    target="_blank"
                    key={i}
                    rel="noopener noreferrer"
                    href={`${icon.url}`}
                  >
                    <i className={`fab ${icon.image}`} />
                  </a>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default App;
