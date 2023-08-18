const express = require('express');
const app = express();
const port = 3000;

const fetch = require('cross-fetch');
const https = require('https');
const querystring = require('querystring');
const mysql = require('mysql2/promise');

app.use(express.static('public'));


// 현재 시간 가져오기
function getToday() {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, '0');
  const day = String(today.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

//날짜형식으로 변환 
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};
const parseDate = (input) => {
  const date = new Date(input);
  if (isValidDate(date)) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else {
    throw new Error(`유효하지 않은 날짜 형식: ${input}`);
  }
};


//7일 날짜 요청 
const getDaysOfPeriod = (startDate, period) => {
  try {
    const validStartDate = parseDate(`${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`);

    const dateList = [];
    for (let i = 0; i < period; i++) {
      const newDate = new Date(new Date(validStartDate).getTime() + i * 24 * 60 * 60 * 1000);
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      dateList.push(`${year}${month}${day}0600`);
    }
    return dateList;
  } catch (error) {
    console.error(`날짜 구하는 중 오류 발생: ${error.message}`);
  }
};

const today = getToday();
const daysOfPeriod = getDaysOfPeriod(today, 7);
console.log('daysOfPeriod:', daysOfPeriod);


//공공 api 가져오기
const serviceKey = "v/bmyjQ1Yy/omIctU2m4ivvpRYYIRLoGlOkWWb1OdxHuDHj/QGXFlpDN6OFuzy13yzrQHrLft1Dd8Ly0wwia/A==";
const url = 'http://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst';
const queryParams = new URLSearchParams([
  ["ServiceKey", serviceKey],
  ["pageNo", "1"],
  ['numOfRows', '10'],
  ['dataType', 'JSON'],
  ['stnId', '108'],
  ['tmFc', `${today}0600`],
]);

// async function requestData() {
//   const full_url = `${url}?${queryParams.toString()}`;
//   try {
//     const response = await fetch(full_url, { method: "GET" });
//     if (response.ok) {
//       const data_list = await response.json();
//       const items = data_list.response.body.items.item;
//       // 오늘부터 7일동안날짜 필터링
//       const daysOfPeriod = getDaysOfPeriod(today, 7);
//       // items에서 필터를 검 → daysOfPeriod(오늘날짜부터 7일이) 포함되었니(includes) api아이템중 fcstDate에 
//       const filteredItems = items.filter(item => daysOfPeriod.includes(item.fcstDate))
//       const descriptions = Object.values(items).map(i => i.wfSv);
//       const descriptionsText = descriptions.join(' \n');
//       console.log(descriptionsText);
//       return descriptionsText
//     } else {
//       console.error("상태 에러(데이터 불러오지 못함)", response.status);
//     }
//   } catch (error) {
//     console.error("API 요청 에러", error.message);
//   }
//   return "";
// }

//db연결 후 데이터 전송
// const firstEntry = false;
async function fetchTranslatedForecastFromDb(lang) {
  console.log("fetchTranslatedForecastFromDb 함수 호출, 파라미터: lang =", lang);
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1225',
    database: 'translations_db',
  });

  let rows = null;

  try {
    // 쿼리 부분
    const selectQuery = `
      SELECT * 
      FROM weather_translations_json
      WHERE lang = ? AND updated_date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 HOUR)
      ORDER BY updated_date DESC
      LIMIT 1
    `;
    [rows] = await connection.query(selectQuery, [lang]);

  } catch (error) {
    console.error(`날씨 예보를 가져오는 중 발생한 오류 메시지: ${error.message}`);
  } finally {
    await connection.end();
    console.log("데이터베이스 연결 종료");
  }

  // 이 부분에서 반환 값을 처리합니다.
  if (rows && rows.length > 0 && rows[0]) {
    const translation = JSON.parse(rows[0].translations);
    console.log("fetchTranslatedForecastFromDb 함수 종료");
    console.log("불러온 데이터: ", rows);
    return translation;
  }
  return "";
}



//main 실행 
// (async function main() {
//   let connection;
  

//     const ko_weather = await requestData();

//     // 4개 언어를 번역
//     // const translated_en_weather = await translate(ko_weather, 'en');
//     // const translated_ja_weather = await translate(ko_weather, 'ja');
//     // const translated_zh_weather = await translate(ko_weather, 'zh-CN');

//     // const translations = {
//     //   ko: ko_weather,
//     //   en: translated_en_weather,
//     //   ja: translated_ja_weather,
//     //   zh: translated_zh_weather,
//     // };
//     const initialLanguage = 'ko';
//   const initialData = await fetchTranslatedForecastFromDb(initialLanguage, true);
//   const initialResponse = {
//     success: true,
//     data: initialData,
//   };
//   displayData(initialResponse);


//     const jsonString = JSON.stringify(translations).replace(/'/g, "\\'");
//     try {
//     const connection = await mysql.createConnection({
//       host: '127.0.0.1',
//       user: 'root',
//       password: '1225',
//       database: 'translations_db',
//     });
//   }catch(error){
//     console.error(`main 함수 실행 중 오류 발생 : ${error.message}`)
//   }finally{
//     if (connection) {
//       await connection.end();
//       console.log("데이터 베이스 연결 종료");
//   }
// }
//   }) ();

  //엔드포인트
  app.get('/weather-forecast/:lang', async (req, res) => {
    try {
      const lang = req.params.lang;
      let result = await fetchTranslatedForecastFromDb(lang);
      
      console.log('요청된 언어:', lang);
  
      const firstEntry = req.query.firstEntry === 'true';
      console.log('첫 번째 항목인가요?', firstEntry);
  
      const forecast = await fetchTranslatedForecastFromDb(lang, firstEntry);
      console.log('가져온 날씨 예보 데이터:', forecast);
  
      // res.send(result); // 중복된 호출로 인해 발생한 오류 제거
      res.status(200).json({ success: true, data: forecast });
    } catch (error) {
      console.error('날씨 예보를 가져오는 중 발생한 오류 메시지:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  

app.listen(port, () => {
  console.log(`앱이 ${port} 포트에서 실행 중입니다.`);
});
