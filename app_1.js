const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/forecast', async (req, res) => {
  const lang = req.query.lang || 'ko';
  try {
    const translatedForecast = await fetchTranslatedForecastFromDb(lang);
    res.send(translatedForecast);
  } catch (error) {
    console.error('번역된 일기예보 가져오기 오류: ', error);
    res.status(500).send('서버 오류');
  }
});

async function fetchTranslatedForecastFromDb(lang) {
  // DB에서 일기예보 데이터를 가져온 후, 선택된 언어로 번역합니다.
  // 이 함수는 데이터베이스와 번역 로직에 따라 구현해야 합니다.
}

app.listen(port, () => {
  console.log(`서버 시작: http://localhost:${port}`);
});
