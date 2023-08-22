const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const getMidFcst = require('./getMidFcst'); // getMidFcst 모듈 추가

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

// 날씨 정보 얻기
app.get('/api/weather', async (req, res) => {
    const targetDate = req.query.date;
    const targetLang = req.query.lang;

    try {
        const weatherData = await getMidFcst.getMidFcst(targetDate, targetLang);
        res.json(weatherData);
    } catch (error) {
        console.error('API 통신 오류: ', error);
        res.status(500).json({ error: '날씨 정보를 불러오는데 실패했습니다.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000...');
});
