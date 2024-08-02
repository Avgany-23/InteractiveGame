// Нажатие кнопки button-main (кнопка start на странице). Сохрагнение данных
document.getElementById('button-main').addEventListener('click', function() {
  if (check_pamams()) { 
      localStorage.setItem('reloadNeeded', 'true');                                                     // Сохранение данных о перезагрузке
      localStorage.setItem('paper', document.querySelector('.field[name="quantityScissors"]').value)    // Сохранение данных о количестве бумаги
      localStorage.setItem('scissors', document.querySelector('.field[name="quantityScissors"]').value) // Сохранение данных о количестве ножниц
      localStorage.setItem('stone', document.querySelector('.field[name="quantityStone"]').value)       // Сохранение данных о количестве камней
      localStorage.setItem('speed', document.querySelector('.field[name="speedObjects"]').value)        // Сохранение данных о скорости объектов
      location.reload();                                                                                // Перезагрузка страницы
    }
  });


// Проверяем наличие данных в localStorage после перезагрузки страницы. Запуск скрипта
if (localStorage.getItem('reloadNeeded') === 'true') {
  create_objects(localStorage.getItem('scissors'), localStorage.getItem('stone'), localStorage.getItem('paper'))  // создаем объекты

  // Функция для вызова анимации с задержкой в 200 мс.
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function delayedGreeting() {
    await sleep(200);
    start_show(localStorage.getItem('speed'));
    updateCounts(one_time=false)
  }
  delayedGreeting();
  localStorage.removeItem('reloadNeeded'); // Очистка данных из localStorage
}




// -------------- Функции для работы скрипта --------------

function check_pamams() {
  /*Функция проверяет, правильно ли введены параметры в полях страницы. 
  Функция ничего не принимает, возвращает true, если создание произошло успешно, false - в ином случае */
  let quantityScissors = document.querySelector('.field[name="quantityScissors"]').value;  // Количество ножниц
  let quantityStone = document.querySelector('.field[name="quantityStone"]').value;        // Количество камней
  let quantityPaper = document.querySelector('.field[name="quantityPaper"]').value;        // Количество бумаги
  let speedObjectsValue = document.querySelector('.field[name="speedObjects"]').value;     // Скорость объектов

  // Если какой-то параметр выходит за min или max диапазон, то создание объектов не произойдёт
  if (speedObjectsValue > 15 || speedObjectsValue < 1 || 
      quantityScissors > 30 || quantityScissors < 1 || 
      quantityStone > 30 || quantityStone < 1 || 
      quantityPaper > 30 || quantityPaper < 1) {
      return false
  }
  return true
}


function loadHTMLFile(url, callback) {
  /*Функция для записи объекта в файл*/
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var data = xhr.responseText;
      var parser = new DOMParser();
      var doc = parser.parseFromString(data, 'text/html');
      callback(doc);
    };
  };
  xhr.open('GET', url, true);
  xhr.send();
}


function createElements(doc, figures, count) {
  /* Функция для создания элементов из загруженного HTML файла 
  Принимет doc - документ загрузки, figures - объект фигуры, count - количество создаваемых фигур (number)*/
  const object = doc.querySelectorAll(`.${figures}`)[0];
  const gameWindow = document.querySelector('.game_window');  // Находим блок с классом game_window
  for (let i = 1; i <= count; i++) {
    object.id = object.id + i;                                // Создание нужного id объекта
    gameWindow.appendChild(object.cloneNode(true));           // Добавление объектов в найденный блок
    object.id = object.id.replace(/\d+/g, '');                // Удаление цифр, чтобы не повторялись при создании следующих объектов
  }
}
  
  
function create_objects(scissors, stone, paper) {
  /* Функция для создания объектов с установленными пользователем параметрами в верхнем окне страницы
  Возвращает undefined*/
  loadHTMLFile('objects.html', function(doc, figures) {       // Создание фигуры камней
    createElements(doc, 'stone', stone);
  });
  loadHTMLFile('objects.html', function(doc, figures) {       // Создание фигуры бумаги
    createElements(doc, 'papper', paper);
  });
  loadHTMLFile('objects.html', function(doc, figures) {       // Создание фигуры ножниц
    createElements(doc, 'scissors', scissors);
  });
}


const gameWindow = document.getElementById('game_windowID');    // Получение объекта поля, по которому перемещается фигура
var regex_scissor = /^scisID\d{1,}$/;                           // Паттерн регулярки для SVG-ножниц
var regex_stone = /^stoneID\d{1,}$/;                            // Паттерн регулярки для SVG-комней
var regex_paper = /^paperID\d{1,}$/;                            // Паттерн регулярки для SVG-бумаги

function move_figures(coord_x, coord_y, fig, speed) {
  /* Функция принимает начальные координаты х, y (Number) и Название фигуры (string)
  Функция перемещает объекты по полю game_windowID
  Возвращает undefined*/
  let figure = document.getElementById(fig);                      // Получение объекта фигуры (ножницы, камень или бумага)
  let x = coord_x;                                                // Начальные координаты объекта по Х
  let y = coord_y;                                                // Начальные координаты объекта по У
  let dx = Math.random() * 2 - 1;                                 // Направление движения по Х
  let dy = Math.random() * 2 - 1;                                 // Направление движения по У
  function moveFigure() {
    x += dx * speed;                                  // Вектор перемещения и скорость по Х
    y += dy * speed;                                  // Вектор перемещения и скорость по У

    // Если объект доходит до левой или правой гринцы, то меняется вектор напрвления по Х
    if (x < 0 || x + figure.clientWidth > gameWindow.clientWidth) {
      dx = -dx;
    }
    // Если объект доходит до нижней или верхней границы, то меняется вектор направления по У
    if (y < 0 || y + 2 * figure.clientHeight > gameWindow.clientHeight) {
      dy = -dy;
    }
    figure.style.left = (x + 'px');                                // Шаг движения по Х
    figure.style.top = (y + 'px');                                 // Шаг движения по У
    requestAnimationFrame(moveFigure);                             // Перемещение функции на 1 шаг
  }
  moveFigure();                                                    // Вызов функции, чтобы объект постоянно находился в движении
}


// Функцию запускает анимаци. Ничего не принимает. Возвращает undefined.
function start_show(speed) {
  var svgs = document.getElementsByTagName('svg');    // Получение всех SVG объектов
  for (let svg of svgs) {
    // Выбор начальной точки старта в зависимости от SVG-фигуры (ножницы, камень или бумага)
    if (regex_scissor.test(svg.id)) {
      [x_start, y_start] = [500 + (1 + Math.random()) * 100, Math.random() * 10];
    } else if (regex_stone.test(svg.id)) {
      [x_start, y_start] = [Math.random() * 10, 400 + (1 + Math.random()) * 100];
    } else if (regex_paper.test(svg.id)) {
      [x_start, y_start] = [1000 + (1 + Math.random()) * 100, 400 + (1 + Math.random()) * 100];
    }
    move_figures(x_start, y_start, svg.getAttribute('id'), speed);  // Запуск функции движения фигур
  }
  setInterval(handleCollisions, 0.1);  // функция для обработки столкновения фигур с задержкой 100мс
}


// Функция для проверки столкновения фигур
function checkCollision(figure1, figure2) {
  /* Функция для проверки столкновения фигур 
  figure1, figure2 - объекты HTML
  Функция возвращает bool значение true or false*/
  var rect1 = figure1.getBoundingClientRect();
  var rect2 = figure2.getBoundingClientRect();
  return !(rect1.right < rect2.left ||
           rect1.left > rect2.right ||
           rect1.bottom < rect2.top ||
           rect1.top > rect2.bottom);
}


function changeFigure(figure1, figure2) {
  /* Функция для изменения фигуры при столкновении 
  figure1, figure2 - объекты HTML
  Возвращает undefined*/
  let currentId1 = figure1.getAttribute('id');  // Взятие id первого объекта
  let currentId2 = figure2.getAttribute('id');  // Взятие id второго объекта

  // Если камень столкнулся с ножницами, то ножницы превращаются в камень
  if (currentId1.slice(0, 2) == 'sc' && currentId2.slice(0, 2) == 'st') { 
    figure1.setAttribute('id', currentId2);                             // Изменение id первого объекта на id второго объекта
    figure1.innerHTML = figure2.innerHTML;                              // Замена HTML изображения
    figure1.classList.remove('scissors');                               // Удаление прошлого класса scissors
    figure1.classList.add('stone');                                     // Добавление нового класса stone
    figure1.id = currentId2;                                            // Замена id
    figure1.viewBox.baseVal.x = figure2.viewBox.baseVal.x;              // Изменение viewBox первого объекта по x
    figure1.viewBox.baseVal.y = figure2.viewBox.baseVal.y;              // Изменение viewBox первого объекта по y
    figure1.viewBox.baseVal.width = figure2.viewBox.baseVal.width;      // Изменение ширины первого объекта
    figure1.viewBox.baseVal.height = figure2.viewBox.baseVal.height;    // Изменение высоты первого объекта
    updateCounts()                                                      // Обновление счетчика объекта

  // Если камень столкнулся с бумагой, то камень превращается в бумагу
  } else if (currentId1.slice(0, 2) == 'st' && currentId2.slice(0, 2) == 'pa') {
    figure1.setAttribute('id', currentId2);                             // Изменение id первого объекта на id второго объекта
    figure1.innerHTML = figure2.innerHTML;                              // Замена HTML изображения
    figure1.classList.remove('stone');                                  // Удаление прошлого класса stone
    figure1.classList.add('papper');                                    // Добавление нового класса papper
    figure1.id = currentId2;                                            // Замена id
    figure1.viewBox.baseVal.x = figure2.viewBox.baseVal.x;              // Изменение viewBox первого объекта по x
    figure1.viewBox.baseVal.y = figure2.viewBox.baseVal.y;              // Изменение viewBox первого объекта по y
    figure1.viewBox.baseVal.width = figure2.viewBox.baseVal.width;      // Изменение ширины первого объекта
    figure1.viewBox.baseVal.height = figure2.viewBox.baseVal.height;    // Изменение высоты первого объекта
    updateCounts()                                                      // Обновление счетчика объекта

  // Если бумага столкнулась с ножницами, то бумага превращается в ножницы
   } else if (currentId1.slice(0, 2) == 'sc' && currentId2.slice(0, 2) == 'pa') {
    figure2.setAttribute('id', currentId1);                             // Изменение id второго объекта на id первого объекта
    figure2.innerHTML = figure1.innerHTML;                              // Замена HTML изображения
    figure2.classList.remove('papper');                                 // Удаление прошлого класса papper
    figure2.classList.add('scissors');                                  // Добавление нового класса papper
    figure2.id = currentId1;                                            // Замена id
    figure2.viewBox.baseVal.x = figure1.viewBox.baseVal.x;              // Изменение viewBox первого объекта по x
    figure2.viewBox.baseVal.y = figure1.viewBox.baseVal.y;              // Изменение viewBox первого объекта по y
    figure2.viewBox.baseVal.width = figure1.viewBox.baseVal.width;      // Изменение ширины первого объекта
    figure2.viewBox.baseVal.height = figure1.viewBox.baseVal.height;    // Изменение высоты первого объекта
    updateCounts()                                                      // Обновление счетчика объекта
  }
}


function handleCollisions() {
  /* Функция для обработки столкновений. При столкновении разных объектов
  изображение одной фигуры меняется на изображение второй фигуры.
  Функция ничего не принимает. Возвращает undefined
  */
  let sciss = document.querySelectorAll('.scissors');
  let ston = document.querySelectorAll('.stone');
  let pape = document.querySelectorAll('.papper');
  const figures = [...Array.from(sciss), ...Array.from(ston), ...Array.from(pape)];
  for (var i = 0; i < figures.length; i++) {
    for (var j = i + 1; j < figures.length; j++) {
      
      if (checkCollision(figures[i], figures[j])) {
        changeFigure(figures[i], figures[j]);
      }
    }
  }
}


function updateCounts(one_time=false) {
  /* Функция для подсчета объектов. 
  one_time - для установки значений при первичной инициализации объектов
  функция возвращает undefined
  */
  const elements = document.querySelectorAll('.scissors, .stone, .papper');  // получение объектов
  let counts = {                                      //  массив с количеством объектов
    'scissor': 0,
    'stone': 0,
    'paper': 0
  };
  elements.forEach(function(element) {          // подсчет текущего количества объектов
  let id = element.id.slice(0, 4);

    if (id === 'scis') {
      counts['scissor']++;
    } else if (id === 'ston') {
      counts['stone']++;
    } else if (id === 'pape') {
      counts['paper']++;
    }
  });

  if (one_time) {
    counts['scissor'] -= 1;
    counts['stone'] -= 1;
    counts['paper'] -= 1;
  }

  const gameWindow = document.getElementById('game_windowID');                // получение класса game_windowID
  const countElements = gameWindow.getElementsByClassName('count')[0];        // Получение класс count для заполнения

  countElements.children[0].textContent = `stone: ${counts['stone']}`;        // установка количества камней
  countElements.children[1].textContent = `paper: ${counts['paper']}`;        // установка количества бумаги
  countElements.children[2].textContent = `scissors: ${counts['scissor']}`;   // установка количества ножниц
}