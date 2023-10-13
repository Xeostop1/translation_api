const axios = require("axios");
const translationUtils = require("./translationUtils");

// 중기예보 조회
async function getMidFcst(dateInput, lang = "ko") {
    console.log(`데이트 인풋값 확인1: ${dateInput}`);

    
    // 기존 번역 데이터 조회
    const existingTranslation = await translationUtils.getTranslationByIdAndLanguage(dateInput, lang);
    console.log(`데이트 인풋값 확인2: ${dateInput}`);
    if (existingTranslation) {
        console.log("데이터베이스에 저장된 데이터를 사용합니다.");
        return JSON.parse(existingTranslation.translations);
    }
}

    // API 호출 횟수
    let apiCallCounter = 0;

    // API 호출 횟수 증가
    function increaseApiCounter() {
        console.log("increaseApiCounter() 호출됨");
        apiCallCounter += 1;
        console.log("현재 API 호출 횟수:", apiCallCounter);
    }

 
    // API 호출 및 데이터 조회
    async function fetchData(dateInput, lang) {
        // API 호출 및 데이터 조회
        const API_SERVICE_KEY_HERE = "v/bmyjQ1Yy/omIctU2m4ivvpRYYIRLoGlOkWWb1OdxHuDHj/QGXFlpDN6OFuzy13yzrQHrLft1Dd8Ly0wwia/A==";
        const queryParams = new URLSearchParams([
            ["ServiceKey", API_SERVICE_KEY_HERE],
            ["pageNo", "1"],
            ["numOfRows", "10"],
            ["dataType", "JSON"],
            ["stnId", "108"],
            ["tmFc", dateInput],
        ]);
        const url = "http://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst";
        try {
            // 'params' 옵션을 추가하여 queryParams를 사용하도록 수정
            const response = await axios.get(url, { params: queryParams });
            increaseApiCounter(); // 전체 호출 횟수 증가
            const responseData = response.data.response.body.items.item;
    
            // DB에 번역 결과 저장
            const translationsJson = JSON.stringify(responseData);
            await translationUtils.saveTranslation(dateInput, lang, translationsJson);
    
            console.log("반환된 데이터:", responseData);
            return responseData;
        } catch (error) {
            console.log("공공 데이터 API 호출 중 문제 발생:", error);
            throw new Error(`데이터를 가져오는데 실패했습니다: ${error}`);
        }
    }
    

// 함수내보내기 
module.exports = {
    getMidFcst,
};
