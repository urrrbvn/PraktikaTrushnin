

// const express = require('express');
// const http = require('http');
// const WebSocket = require('websocket').server;
// const axios = require('axios');
// const { LocalStorage } = require('node-localstorage');

// const app = express();
// app.use(express.static('public'));

// const server = http.createServer(app);
// server.listen(3000, () => {
//   console.log('Server is listening on port 3000');
// });

// const wsServer = new WebSocket({ httpServer: server });
// app.use(express.static('public'));

// const localStorage = new LocalStorage('./storage'); // Создайте экземпляр локального хранилища

// // Загрузите данные из локального хранилища или используйте пустой объект
// const keywordToUrls = JSON.parse(localStorage.getItem('keywordToUrls')) || {};

// // Функция для сохранения данных в локальное хранилище
// function saveToLocalStorage() {
//   localStorage.setItem('keywordToUrls', JSON.stringify(keywordToUrls));
// }

// // Здесь вы можете добавить, изменить или удалить URL для ключевого слова
// function addUrlForKeyword(keyword, urls) {
//   if (!Array.isArray(urls)) {
//     urls = [urls]; // Если передан одиночный URL, преобразуйте его в массив
//   }

//   if (!keywordToUrls[keyword]) {
//     keywordToUrls[keyword] = [];
//   }

//   keywordToUrls[keyword].push(...urls); // Используйте spread-оператор для добавления всех URL-адресов из массива
//   saveToLocalStorage();
// }

// // Пример добавления нового URL для ключевого слова
// addUrlForKeyword('example', 'https://example.com');
// addUrlForKeyword('торт', ['https://www.russianfood.com/recipes/bytype/?fid=39','https://eda.ru/recepty/torty']);
// addUrlForKeyword('футбол', ['https://www.championat.com/football/', 'https://www.sport-express.ru/football/']);

// async function downloadContent(url, connection) {
//   const response = await axios.get(url);

//   const contentLength = response.headers['content-length'];
//   const htmlContent = response.data;

//   connection.sendUTF(
//     JSON.stringify({
//       status: 'downloaded',
//       url,
//       size: contentLength,
//       htmlContent,
//     })
//   );

//   return htmlContent;
// }

// function sendUrls(connection, keyword) {
//   const urls = keywordToUrls[keyword];
//   if (!urls) {
//     connection.sendUTF(JSON.stringify({ error: 'Keyword not found' }));
//     return;
//   }
//   connection.sendUTF(JSON.stringify({ urls }));
// }

// wsServer.on('request', (request) => {
//   const connection = request.accept(null, request.origin);

//   connection.on('message', async (message) => {
//     if (message.type === 'utf8') {
//       const keyword = message.utf8Data;
//       sendUrls(connection, keyword);
//     }
//   });

//   connection.on('close', () => {
//     console.log('Connection closed');
//   });
// });

const express = require('express');
const http = require('http');
const WebSocket = require('websocket').server;
const axios = require('axios');
const { LocalStorage } = require('node-localstorage');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

const wsServer = new WebSocket({ httpServer: server });
app.use(express.static('public'));

const localStorage = new LocalStorage('./storage'); // Создайте экземпляр локального хранилища

// Загрузите данные из локального хранилища или используйте пустой объект
const keywordToUrls = JSON.parse(localStorage.getItem('keywordToUrls')) || {};

// Функция для сохранения данных в локальное хранилище
function saveToLocalStorage() {
  localStorage.setItem('keywordToUrls', JSON.stringify(keywordToUrls));
}

// Здесь вы можете добавить, изменить или удалить URL для ключевого слова
function addUrlForKeyword(keyword, urls) {
  if (!Array.isArray(urls)) {
    urls = [urls]; // Если передан одиночный URL, преобразуйте его в массив
  }

  if (!keywordToUrls[keyword]) {
    keywordToUrls[keyword] = [];
  }

  keywordToUrls[keyword].push(...urls); // Используйте spread-оператор для добавления всех URL-адресов из массива
  saveToLocalStorage();
}

function initializeLocalStorage() {
  if (!localStorage.getItem('keywordToUrls')) {
    // Пример добавления нового URL для ключевого слова
    addUrlForKeyword('example', 'https://example.com');
    addUrlForKeyword('торт', ['https://www.russianfood.com/recipes/bytype/?fid=39', 'https://eda.ru/recepty/torty']);
    addUrlForKeyword('футбол', ['https://www.championat.com/football/', 'https://www.sport-express.ru/football/']);
    addUrlForKeyword('машины', ['https://auto.ru/', 'https://auto.mail.ru/catalog/']);
  }
}

initializeLocalStorage(); // Вызовите эту функцию один раз, чтобы инициализировать локальное хранилище

async function downloadContent(url, connection) {
  const response = await axios.get(url);

  const contentLength = response.headers['content-length'];
  const htmlContent = response.data;

  connection.sendUTF(
    JSON.stringify({
      status: 'downloaded',
      url,
      size: contentLength,
      htmlContent,
    })
  );

  return htmlContent;
}

function sendUrls(connection, keyword) {
  const urls = keywordToUrls[keyword];
  if (!urls) {
    connection.sendUTF(JSON.stringify({ error: 'Keyword not found' }));
    return;
  }
  connection.sendUTF(JSON.stringify({ urls }));
}

wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);

  connection.on('message', async (message) => {
    if (message.type === 'utf8') {
      const keyword = message.utf8Data;
      sendUrls(connection, keyword);
    }
  });

  connection.on('close', () => {
    console.log('Connection closed');
  });
});