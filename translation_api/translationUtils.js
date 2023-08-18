const axios = require("axios");
const connection = require("./db"); // db.js 모듈 가져오기

const CLIENT_ID = "H24exeKjE56KuHGRm9lr";
const CLIENT_SECRET = "7VVyvH_j0";
const PAPAGO_URL = "https://naveropenapi.apigw.ntruss.com/nmt/v1/translation";

let apiCallCounter = 0;

// API 호출 카운터 증가
// 항목: API 호출 카운터
function increaseApiCounter() {
    console.log("increaseApiCounter() 호출됨");
    apiCallCounter += 1;
}

// API 호출 카운터값 조회
// 항목: API 호출 카운터 조회
function getApiCallCounter() {
    console.log("getApiCallCounter() 호출됨");
    return apiCallCounter;
}

// 번역 API 호출
// 항목: 번역 API
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

// 번역 데이터 DB 조회
// 항목: 번역 데이터 조회
async function getTranslationByIdAndLanguage(id, language) {
    console.log("getTranslationByIdAndLanguage() 호출됨");

    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM translations WHERE id = ? AND language = ?",
            [id, language], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            }
        );
    });
}

// 번역 데이터 DB 저장
// 항목: 번역 데이터 저장
async function saveTranslation(id, language, text) {
    console.log("saveTranslation() 호출됨");

    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT INTO translations (id, language, text) VALUES (?, ?, ?)",
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

// 번역 처리
// 항목: 번역 처리
async function translate(id, text, targetLanguage, sourceLanguage = "ko") {
    console.log("translate() 호출됨");

    // 1. DB에서 번역 데이터 조회
    const existingData = await getTranslationByIdAndLanguage(id, targetLanguage);

    // 기존 번역 데이터가 있는 경우, 바로 반환
    if (existingData) {
        return existingData.text;
    }

    // 2. 번역 API 호출
    const translatedText = await callTranslateApi(text, targetLanguage, sourceLanguage);

    // 3. DB에 번역 결과 저장
    await saveTranslation(id, targetLanguage, translatedText);

    return translatedText;
}

module.exports = {
    translate,
    getApiCallCounter,
};
