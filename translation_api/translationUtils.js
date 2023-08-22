const axios = require("axios");
const connection = require("./db"); // db.js 모듈 가져오기

const CLIENT_ID = "H24exeKjE56KuHGRm9lr";
const CLIENT_SECRET = "7VVyvH_j0";
const PAPAGO_URL = "https://naveropenapi.apigw.ntruss.com/nmt/v1/translation";

let apiCallCounter = 0;

// API 호출 카운터 증가
function increaseApiCounter() {
    console.log("increaseApiCounter() 호출됨");
    apiCallCounter += 1;
}

// API 호출 카운터값 조회
function getApiCallCounter() {
    console.log("getApiCallCounter() 호출됨");
    return apiCallCounter;
}

// 번역 API 호출
async function callTranslateApi(text, targetLanguage, sourceLanguage) {
    try {
        increaseApiCounter();

        const response = await axios.post(PAPAGO_URL, {
            source: sourceLanguage,
            target: targetLanguage,
            text,
        }, {
            headers: {
                "X-NCP-APIGW-API-KEY-ID": CLIENT_ID,
                "X-NCP-APIGW-API-KEY": CLIENT_SECRET,
            },
        });

        return response.data.message.result.translatedText;

    } catch (error) {
        console.log("번역 API 호출 중 문제 발생:", error);
        throw new Error(`번역에 실패했습니다: ${error}`);
    }
}

// 번역 데이터 DB 조회(****필드 값이 안맞음 )
// async function getTranslationByIdAndLanguage(id, language) {
//     console.log("getTranslationByIdAndLanguage() 호출됨");

//     return new Promise((resolve, reject) => {
//         connection.query(
//             "SELECT * FROM weather_translations_json WHERE id = ?",
//             [id], (error, results) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     const translations = JSON.parse(results[0].translations);
//                     resolve(translations[language]);
//                 }
//             }
//         );
//     });
// }


// 번역 데이터 DB 저장
async function saveTranslation(id, language, text) {
    console.log("saveTranslation() 호출됨");

    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT INTO weather_translations_json (id, language, updated_date, translations) VALUES (?, ?, NOW(), ?)",
            [id, language, text], (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
}


// 함수 내보내기
module.exports = {
    callTranslateApi,
    //getTranslationByIdAndLanguage,
    saveTranslation,
}
