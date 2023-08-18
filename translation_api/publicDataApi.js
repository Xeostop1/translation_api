// publicDataApi.js

// 가짜 데이터베이스
const fakeDB = {
    "20210930": [
      { category: "A", data: "Example A" },
      { category: "B", data: "Example B" },
    ],
  };
  
  // API 호출 횟수
  let apiCallCounter = 0;
  
  // API 호출 횟수 증가
  function increaseApiCounter() {
    console.log("increaseApiCounter() 호출됨");
    apiCallCounter += 1;
    console.log("현재 API 호출 횟수:", apiCallCounter);
  }
  
  // 날짜 형식 변경
  function formatDate(dateInput) {
    const date = new Date(dateInput);
    return date.toISOString().substring(0, 10).replace(/-/g, "") + "0600";
  }
  
  // 중기예보 조회
  async function getMidFcst(dateInput) {
    const formattedDate = formatDate(dateInput);
    const dbData = fakeDB[formattedDate];
  
    // 데이터베이스 데이터 사용
    if (dbData) {
      console.log("데이터베이스에 저장된 데이터를 사용합니다.");
      console.log("반환된 데이터:", dbData);
      return dbData;
    }
  
    // API 호출 및 데이터 조회
    const queryParams = new URLSearchParams([
      ["ServiceKey", "API_SERVICE_KEY_HERE"],
      ["pageNo", "1"],
      ["numOfRows", "10"],
      ["dataType", "JSON"],
      ["stnId", "108"],
      ["tmFc", formattedDate],
    ]);
  
    try {
      const response = await axios.get(`https://api.example.com/dataURI?${queryParams.toString()}`);
      increaseApiCounter(); // 전체 호출 횟수 증가
      const responseData = response.data.response.body.items.item;
  
      // 데이터베이스에 데이터 저장
      fakeDB[formattedDate] = responseData;
      console.log("반환된 데이터:", responseData);
      return responseData;
    } catch (error) {
      console.log("공공 데이터 API 호출 중 문제 발생:", error);
      throw new Error(`데이터를 가져오는데 실패했습니다: ${error}`);
    }
  }
  
  // 이 모듈에서 해당 함수를 사용할 수 있도록 내보냅니다.
  module.exports = {
    getMidFcst,
  };
  