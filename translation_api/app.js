const express = require('express');
const app = express();
const port = 3000;

const fetch = require('cross-fetch');
const https = require('https');
const querystring = require('querystring');
const mysql = require('mysql2/promise');

app.use(express.static('public'));

app.get('/weather-forecast/:lang', async (req, res) => {
  try {
    const lang = req.params.lang;
    const firstEntry = req.query.firstEntry === 'true' || false;
    const data = await fetchTranslatedForecastFromDb(lang, firstEntry);

    res.json({ message: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







// 현재 시간 가져오기
function getToday() {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, '0');
  const day = String(today.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

//7일 날짜 요청 
const getDaysOfPeriod = (startDate, period) => {
  const dateList = [];
  for (let i = 0; i < period; i++) {
    const newDate = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    dateList.push(`${year}${month}${day}0600`);
  }
  return dateList;
};;
const today = getToday();
const daysOfPeriod = getDaysOfPeriod(today, 7);
console.log('daysOfPeriod:', daysOfPeriod);


// 요청 정보 지정

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

async function requestData() {
  const full_url = `${url}?${queryParams.toString()}`;
  try {
    const response = await fetch(full_url, { method: "GET" });
    if (response.ok) {
      const data_list = await response.json();
      const items = data_list.response.body.items.item;
      // 오늘부터 7일동안날짜 필터링
      const daysOfPeriod = getDaysOfPeriod(today, 7);
      // items에서 필터를 검 → daysOfPeriod(오늘날짜부터 7일이) 포함되었니(includes) api아이템중 fcstDate에 
      //근데 이 변수를 쓸일이 없는데? 망했어 오늘  api끝났네 아이구구구구구구 그러면 있는걸로만 하자 
      //지금 계속 api를 부르고 있으니까 db에서 날짜 체킹을 해서 있으면 
      // api부르지 않고, if로 체크해서 없으면 디비에 넣기 
      //7일 날짜 넣기 

      
      const filteredItems = items.filter(item => daysOfPeriod.includes(item.fcstDate))
      const descriptions = Object.values(items).map(i => i.wfSv);
      const descriptionsText = descriptions.join(' \n');
      console.log(descriptionsText);
      return descriptionsText
    } else {
      console.error("상태에러(데이터불러오지x)", response.status);
    }
  } catch (error) {
    console.error("API요청에러", error.message);
  }
}

// 번역 함수
const translate = async (text, target_language) => {
  const data = querystring.stringify({
    source: 'ko',
    target: target_language,
    text: text,
  });

  const client_id = 'H24exeKjE56KuHGRm9lr';
  const client_secret = '7mVVyvH_j0';
  const options = {
    hostname: 'openapi.naver.com',
    path: '/v1/papago/n2mt',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Naver-Client-Id': client_id,
      'X-Naver-Client-Secret': client_secret,
      'Content-Length': data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let response_str = '';

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        response_str += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed_data = JSON.parse(response_str);
          resolve(parsed_data.message.result.translatedText);
        } else {
          reject(new Error(`Error Code: ${res.statusCode}`));
        }
      });
    });

    req.write(data, 'utf-8');
    req.end();
  });
};

(async function main() {
  try {
    const ko_weather = await requestData();

    // 4개 언어를 번역
    const translated_en_weather = await translate(ko_weather, 'en');
    const translated_ja_weather = await translate(ko_weather, 'ja');
    const translated_zh_weather = await translate(ko_weather, 'zh-CN');

    const translations = {
      ko: ko_weather,
      en: translated_en_weather,
      ja: translated_ja_weather,
      zh: translated_zh_weather,
    };

    const jsonString = JSON.stringify(translations).replace(/'/g, "\\'");

    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '1225',
      database: 'translations_db',
    });

    async function fetchTranslatedForecastFromDb(lang, firstEntry = false) {
      const connection = await mysql.createConnection(dbConfig);
    
      let query = "";
    
      if (firstEntry) {
        query = `
          SELECT translations
          FROM weather_translations_json
          WHERE id = (SELECT MIN(id) FROM weather_translations_json)
        `;
      } else {
        query = `
          SELECT translations
          FROM weather_translations_json
          WHERE id = (SELECT MAX(id) FROM weather_translations_json)
        `;
      }
    
      const [rows] = await connection.query(query);
    
      connection.end();
    
      if (rows.length > 0) {
        const translations = JSON.parse(rows[0].translations);
        return translations[lang] || '번역 메시지를 찾을 수 없습니다.';
      } else {
        throw new Error('저장된 일기예보가 없습니다.');
      }
    }


    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS weather_translations_json (
      id INT AUTO_INCREMENT PRIMARY KEY,
      description TEXT NOT NULL,
      updated_date DATETIME NOT NULL,
      translations TEXT NOT NULL
);`;

    await connection.query(createTableQuery);
    console.log('테이블생성.');

    // DB에 저장
    const insertQuery = `INSERT INTO weather_translations_json (description, updated_date, translations) VALUES ('${ko_weather}', NOW(), '${jsonString}')`;
    const [result] = await connection.query(insertQuery);
    console.log('Inserted data into the database:', result.insertId);

    connection.end();
  } catch (err) {
    console.error('Error: ' + err.stack);
  }
})();

app.listen(port, () => {
  console.log(`서버 시작: http://localhost:${port}`);
});
