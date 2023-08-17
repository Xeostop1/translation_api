// 공공데이터 날씨 가져오기


getToday = () => {
    const curDate = new Date();
    const year = curDate.getFullYear();
    // 월을 추가
    const month = String(curDate.getMonth() + 1).padStart(2, '0');
    const day = String(curDate.getDate()).padStart(2, '0');
    return `${year}${month}${day}0600`;
  };
  today = getToday();
  serviceKey = "v/bmyjQ1Yy/omIctU2m4ivvpRYYIRLoGlOkWWb1OdxHuDHj/QGXFlpDN6OFuzy13yzrQHrLft1Dd8Ly0wwia/A==";
  
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
  }

  module.exports={
    requestData
  }