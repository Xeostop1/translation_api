const fetch = require('cross-fetch');
const https = require('https');
const querystring = require('querystring');
const mysql = require('mysql2/promise');

// 현재 시간 가져오기
const getToday = () => {
  const curDate = new Date();
  const year = curDate.getFullYear();
  const month = String(curDate.getMonth() + 1).padStart(2, '0');
  const day = String(curDate.getDate()).padStart(2, '0');
  return `${year}${month}${day}0600`;
};

// 요청 정보 지정
const today = getToday();
const serviceKey = "v/bmyjQ1Yy/omIctU2m4ivvpRYYIRLoGlOkWWb1OdxHuDHj/QGXFlpDN6OFuzy13yzrQHrLft1Dd8Ly0wwia/A==";
const url = 'http://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst';
const queryParams = new URLSearchParams([
  ["ServiceKey", serviceKey],
  ["pageNo", "1"],
  ['numOfRows', '10'],
  ['dataType', 'JSON'],
  ['stnId', '108'],
  ['tmFc', today],
]);

async function requestData() {
  const full_url = `${url}?${queryParams.toString()}`;
  try {
    const response = await fetch(full_url, { method: "GET" });
    if (response.ok) {
      const data_list = await response.json();
      const items = data_list.response.body.items.item;
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
