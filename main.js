import './style.css'
import javascriptLogo from './public/webtris_logo.webp'
import Tetris from './components/tetris.js'

document.querySelector('#app').innerHTML = `
  <div>
  <a href="/">
    <img class="logo vanilla" width="150" src="${javascriptLogo}" /></a>
    <p id="score" class="vanilla">Score: 0</p>
    <div id="game"></div>
  </div>
`

// Define the Tetris game class
let tetris = new Tetris();

// Initialize the game
tetris.init();

document.addEventListener('keydown', (event) => {
  console.log(event.key);
  if (event.key === 'Enter') {
    window.location.reload();
  }
});