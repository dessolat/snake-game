const canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  body = document.querySelector('body'),
  modal = document.querySelector('.wrapper'),
  modalTitle = document.querySelector('.modal__title'),
  modalButton = document.querySelector('.modal__btn'),
  modalLengthInput = document.querySelector('.modal__length-input'),
  modalFruitsInput = document.querySelector('.modal__fruits-input'),
  modalSpeedInput = document.querySelector('.modal__speed-input');

ctx.font = '30px serif';
ctx.fillStyle = 'white';

const pxStep = 50,
  OPTIONS = {
    DIRECTION: 'down',
    HEAD_IMAGE: null,
    BODY_IMAGE: null,
    DIRECTION_CHANGED: false,
    FRUIT_RENDERED: false,
    GAME_SPEED: null,
    NUMBER_FRUITS: 1,
    SNAKE_LENGTH: 1
  };

let fruitCoords = [],
  coords = [],
  highScore = 0,
  score = 0,
  fruitEaten = false;

const loadingImages = path => {
  return new Promise(resolve => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
};

//Awaiting for loading images
Promise.all([
  loadingImages('./images/snake-head-down.png'),
  loadingImages('./images/snake-head-left.png'),
  loadingImages('./images/snake-head-up.png'),
  loadingImages('./images/snake-head-right.png'),
  loadingImages('./images/snake-tail.png'),
  loadingImages('./images/apple.png'),
  loadingImages('./images/collision.png')
]).then(images => {
  const snakeHeadDownImg = images[0],
    snakeHeadLeftImg = images[1],
    snakeHeadUpImg = images[2],
    snakeHeadRightImg = images[3],
    snakeTailImg = images[4],
    fruitImg = images[5],
    collisionImg = images[6];

  //Main game function (loop)
  const main = () => {
    let posX = coords[0].x;
    let posY = coords[0].y;

    fruitEaten = false;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    renderFruits();
    ctx.fillText(`Текущий счёт: ${score}   Рекорд: ${highScore}`, 177, 35);

    switch (OPTIONS.DIRECTION) {
      case 'up':
        posY -= 1;
        break;
      case 'down':
        posY += 1;
        break;
      case 'left':
        posX -= 1;
        break;
      case 'right':
        posX += 1;
        break;
      default:
        break;
    }

    coords.unshift({ x: posX, y: posY });

    fruitCoords.forEach((fruitCoord, index) => {
      if (posX === fruitCoord.x && posY === fruitCoord.y) {
        eatingFruitSound();
        score += 1;
        fruitEaten = true;
        fruitCoords.splice(index, 1);
        renderRandomFruit();

        !(score % 5) && (OPTIONS.GAME_SPEED -= 10);
      }
    });

    !fruitEaten && coords.pop();

    //Rendering snake head and body
    for (let i = coords.length - 1; i >= 0; i--) {
      if (i > 0) {
        ctx.drawImage(snakeTailImg, pxStep * coords[i].x, pxStep * coords[i].y);
        continue;
      }
      ctx.drawImage(OPTIONS.HEAD_IMAGE, pxStep * posX, pxStep * posY);
    }

    //Checking collision
    if (checkBorderCollision(posX, posY) || checkTailCollision(posX, posY)) {
      ctx.drawImage(collisionImg, pxStep * posX, pxStep * posY);
      endGame();
      return false;
    }

    OPTIONS.DIRECTION_CHANGED && (OPTIONS.DIRECTION_CHANGED = false);
    setTimeout(main, OPTIONS.GAME_SPEED);
  };

  //Checking border collision
  const checkBorderCollision = (posX, posY) => {
    if (posX < 1 || posX > 12 || posY < 1 || posY > 10) return true;
  };

  //Checking tail collision
  const checkTailCollision = (posX, posY) => {
    for (let i = 1; i < coords.length; i++) {
      if (posX === coords[i].x && posY === coords[i].y) return true;
    }
    return false;
  };

  const setDirection = event => {
    switch (event.key) {
      case 'ArrowUp':
        if (OPTIONS.DIRECTION !== 'down' && !OPTIONS.DIRECTION_CHANGED) {
          OPTIONS.DIRECTION = 'up';
          OPTIONS.HEAD_IMAGE = snakeHeadUpImg;
          OPTIONS.DIRECTION_CHANGED = true;
        }
        break;
      case 'ArrowDown':
        if (OPTIONS.DIRECTION !== 'up' && !OPTIONS.DIRECTION_CHANGED) {
          OPTIONS.DIRECTION = 'down';
          OPTIONS.HEAD_IMAGE = snakeHeadDownImg;
          OPTIONS.DIRECTION_CHANGED = true;
        }
        break;
      case 'ArrowLeft':
        if (OPTIONS.DIRECTION !== 'right' && !OPTIONS.DIRECTION_CHANGED) {
          OPTIONS.DIRECTION = 'left';
          OPTIONS.HEAD_IMAGE = snakeHeadLeftImg;
          OPTIONS.DIRECTION_CHANGED = true;
        }
        break;
      case 'ArrowRight':
        if (OPTIONS.DIRECTION !== 'left' && !OPTIONS.DIRECTION_CHANGED) {
          OPTIONS.DIRECTION = 'right';
          OPTIONS.HEAD_IMAGE = snakeHeadRightImg;
          OPTIONS.DIRECTION_CHANGED = true;
        }
        break;
      default:
        break;
    }
  };

  const renderFruits = () => {
    for (fruitCoord of fruitCoords) {
      ctx.drawImage(fruitImg, pxStep * fruitCoord.x, pxStep * fruitCoord.y);
    }
  };

  const renderRandomFruit = () => {
    let fruitX = Math.floor(Math.random() * 12 + 1);
    let fruitY = Math.floor(Math.random() * 10 + 1);
    for (let coord of coords) {
      if (coord.x === fruitX && coord.y === fruitY) {
        renderRandomFruit();
        return false;
      }
    }

    for (let fruitCoord of fruitCoords) {
      if (fruitCoord.x === fruitX && fruitCoord.y === fruitY) {
        renderRandomFruit();
        return false;
      }
    }

    fruitCoords.push({ x: fruitX, y: fruitY });
    ctx.drawImage(fruitImg, pxStep * fruitX, pxStep * fruitY);
  };

  const endGame = () => {
    document.removeEventListener('keydown', setDirection);
    score > highScore && (highScore = score);
    setTimeout(() => {
      showModal('Сыграем еще? 😊');
    }, 2000);
  };

  const showModal = (modalButtonText = 'Начать игру') => {
    modalButton.textContent = modalButtonText;
    modal.style.display = 'block';
    modalButton.addEventListener('click', init);
  };

  const hideModal = () => {
    modalButton.removeEventListener('click', init);
    modal.style.display = 'none';
  };

  const eatingFruitSound = () => {
    var audio = new Audio();
    audio.src = './sounds/eating.mp3';
    audio.autoplay = true;
  };

  //Initial rendering
  const init = () => {
    hideModal();

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    //Setting initial options
    OPTIONS.HEAD_IMAGE = snakeHeadDownImg;
    OPTIONS.BODY_IMAGE = snakeTailImg;
    OPTIONS.DIRECTION = 'down';
    OPTIONS.GAME_SPEED = 350 - +modalSpeedInput.value * 40;
    OPTIONS.NUMBER_FRUITS = +modalFruitsInput.value;
    OPTIONS.SNAKE_LENGTH = +modalLengthInput.value;

    coords = [];
    fruitCoords = [];
    score = 0;

    for (let i = 0; i < OPTIONS.SNAKE_LENGTH; i++) coords.push({ x: 6, y: 5 - i });

    //Snake rendering
    ctx.drawImage(OPTIONS.HEAD_IMAGE, pxStep * coords[0].x, pxStep * coords[0].y);

    for (let i = 1; i < OPTIONS.SNAKE_LENGTH; i++) {
      ctx.drawImage(OPTIONS.BODY_IMAGE, pxStep * coords[i].x, pxStep * coords[i].y);
    }

    for (let i = 0; i < OPTIONS.NUMBER_FRUITS; i++) renderRandomFruit();

    countDownTimer(3, true);
  };

  //Countdown timer before game starts
  const countDownTimer = (count, firstStart) =>
    new Promise(resolve => {
      setTimeout(
        () => {
          ctx.clearRect(205, 0, 300, 50);
          ctx.fillText(`Игра начнётся через: ${count}`, 205, 35);
          resolve(count);
        },
        firstStart ? 50 : 1000
      );
    }).then(count => (count > 0 ? countDownTimer(count - 1, false) : startGame()));

  const startGame = () => {
    document.addEventListener('keydown', setDirection);
    
    //Starting main game loop
    main();
  };

  showModal();
});
