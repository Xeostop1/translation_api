const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const translationUtils = require('./translationUtils');
const publicDataApi = require('./publicDataApi');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

// 최신정보 가지고 오기
app.get('/api/weather/latest', async (req, res) => {
    const lang = req.query.lang || 'ko';
    console.log('최신 날짜 정보 요청');
    try {
        const result = await db.getLatestDateInfo(lang);
        res.json(result);
    } catch (error) {
        console.error('최신 날짜 정보 조회 오류:', error);
        res.status(500).send('Internal Server Error');
    }
});

// 날씨 정보 가져오기
app.get('/api/weather', async (req, res) => {
    const targetDate = req.query.date;
    console.log(`타켓데이트 확인: ${targetDate}`)
    const targetLang = req.query.lang;

    if (!targetDate || !targetLang) {
        res.status(400).json({ error: 'date와 lang 쿼리 파라미터가 필요합니다.' });
        return;
    }

    console.log('날씨 정보 요청:', targetDate, targetLang);

    try {
        // 날씨 데이터 검색
        console.log('날씨 데이터 검색 시작');
        const weatherAPIResult = await publicDataApi.getMidFcst(targetDate);
        console.log('날씨 데이터 검색 완료:', weatherAPIResult);
        
        // 번역
        console.log('번역 시작');
        const translatedResults = await translationUtils.translateAPI(weatherAPIResult, targetLang);
        const translations = translatedResults.map(result => result.translatedText);
        console.log('번역 완료:', translations);
        
        // 저장
        console.log('DB 저장 시작');
        await translationUtils.saveTranslation(targetDate, targetLang, JSON.stringify(translations));
        console.log('DB 저장 완료');
        
        res.json(translations);
    } catch (error) {
        console.error('API 통신 오류: ', error);
        res.status(500).json({ error: '날씨 정보를 불러오는데 실패했습니다.' });
    }
});

// 서버 시작
app.listen(3000, () => {
    console.log('서버가 포트 3000에서 실행 중입니다...');
});
