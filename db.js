const mysql = require('mysql');
const util = require('util');


//커넥터
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1225',
  database: 'translations_db'
});

// 데이터베이스에 연결
connection.connect((error) => {
  if (error) {
      console.error("데이터베이스 연결 오류:", error);
  } else {
      console.log("데이터베이스 연결 성공");
  }
});

//마지막 날짜 데이터 확인(언어별)
const getLatestDateInfo = async (lang) => {
  console.log(`언어확인: ${lang}`);
  console.log(`getLatestDateInfo 호출 확인`);
  const query = util.promisify(connection.query).bind(connection);
  try {
    const sql = 'SELECT id, description, updated_date, translations' +
                ' FROM weather_translations_json' +
                ' ORDER BY updated_date DESC LIMIT 1';
    const rows = await query(sql);
    console.log("함수 종료 전 로우 확인:", rows);

    if (rows[0]) {
      const parsedTranslations = JSON.parse(rows[0].translations);
      const result = {
        ...rows[0],
        translations: parsedTranslations[lang] || "Unavailable",
      };
      return result;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

// 번역 데이터 DB 조회(****필드 값이 안맞음 )
async function getTranslationByIdAndLanguage(id, language) {
    console.log("getTranslationByIdAndLanguage() 호출됨");

    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM weather_translations_json WHERE id = ?",
            [id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    const translations = JSON.parse(results[0].translations);
                    resolve(translations[language]);
                }
            }
        );
    });
}



//모든 번역문 호출 
const getTranslations = async () => {
  console.log(`getTranslations 호출 확인`);
  const query = util.promisify(connection.query).bind(connection);
  try {
      const sql = `
      SELECT
          description,
          translations->"$.en" as en,
          translations->"$.ja" as ja,
          translations->"$.zh" as zh
      FROM
          weather_translations_json;
      `;
      const rows = await query(sql);
      console.log("함수 종료 전 로우 확인:", rows);
      return rows;
  } catch (error) {
      throw error;
  }
};

// 번역 데이터 DB 조회(****필드 값이 안맞음 )
async function getTranslationByIdAndLanguage(id, language) {
    console.log("getTranslationByIdAndLanguage() 호출됨");

    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM weather_translations_json WHERE id = ?",
            [id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    const translations = JSON.parse(results[0].translations);
                    resolve(translations[language]);
                }
            }
        );
    });
}



module.exports = {
  getLatestDateInfo,
  getTranslations, // 추가된 함수 내보내기
  getTranslationByIdAndLanguage
};