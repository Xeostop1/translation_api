const fetch = require('cross-fetch'); getToday = () => {
  const curDate = new Date();
  const year = curDate.getFullYear();
  // 월을 추가
  const month = String(curDate.getMonth() + 1).padStart(2, '0');
  const day = String(curDate.getDate()).padStart(2, '0');
  return ${year}${month}${day}0600;
  };
  today = getToday();
  serviceKey = "v/bmyjQ1Yy/omIctU2m4ivvpRYYIRLoGlOkWWb1OdxHuDHj/QGXFlpDN6OFuzy13yzrQHrLft1Dd8Ly0wwia/A=="; const url = 'http://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst';
  const queryParams = new URLSearchParams([
  ["ServiceKey", serviceKey],
  ["pageNo", "1"],
  ['numOfRows', '10'],
  ['dataType', 'JSON'],
  ['stnId', '108'],
  ['tmFc', today],
  ]); async function requestData() {
  const full_url = ${url}?${queryParams.toString()};
  try {
  const response = await fetch(full_url, { method: "GET" });
  if (response.ok) {
  const data_list = await response.json();
  //js는 .으로 들어가지 아이고 헷갈린다
  //wfSv 값은 여러개라서 반복문 사용해야함 →items 객체라 for of가 어려움 → map으로 배열화
  const items = data_list.response.body.items.item; // body items에 접근
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
  } // 번역 완료 db 삽입 가능
  const https = require('https');
  const querystring = require('querystring');
  const mysql = require('mysql2/promise'); 
  const client_id = 'H24exeKjE56KuHGRm9lr';
  const client_secret = '7mVVyvH_j0';
   (async function main() {
  try {
  const change_language="ja"
  const ko_weather = await requestData();
  const data = querystring.stringify({
  source: 'ko',
  target: change_language,
  text: ko_weather,
  });
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
  
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1225',
    database: 'translations_db',
  });
  
  console.log('Connected to MySQL.');
  
  const createTableQuery = `
  CREATE TABLE weather_translations_json (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    updated_date TIMESTAMP,
    translations JSON
    );`;
  
  await connection.query(createTableQuery);
  console.log('Table created or already exists.');
  
  const req = https.request(options, (res) => {
    let response_str = '';
  
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      response_str += chunk;
    });
  
    res.on('end', async () => {
      if (res.statusCode === 200) {
        const parsed_data = JSON.parse(response_str);
        const originalText = ko_weather;
        const translatedText = parsed_data.message.result.translatedText;
        console.log(translatedText);
  
        // const insertQuery = `INSERT INTO translations (original_text, translated_text) VALUES ('${originalText}', '${translatedText}');`;
        const insertQuery = `INSERT INTO weather_translations_json (description, updated_date, translations) VALUES ('${originalText}', NOW(), '"ko":${originalText}, "eng":${}, "ja":${}, "zh":${},
        ')`
  
        const [result] = await connection.query(insertQuery);
        console.log('Inserted data into the database:', result.insertId);
        connection.end();
      } else {
        console.error('Error Code:', res.statusCode);
      }
    });
  });
  
  req.write(data, 'utf-8');
  req.end();