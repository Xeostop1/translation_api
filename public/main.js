// 언어에 따른 최신 날씨 정보 가져오는 기능
const fetchLatestWeatherInfo = async (lang) => {
    console.log(`매개변수 확인: ${lang}`)
    console.log('최신 날씨 정보 요청 시작');
    const response = await fetch(`/api/weather/latest?lang=${lang}`);
    if (response.ok) {
      console.log('최신 날씨 정보 요청 완료');
      return await response.json();
    } else {
      console.error('최신 날짜 정보 요청 실패');
      throw new Error('최신 날짜 정보를 가져오지 못했습니다.');
    }
  };
  
  const updateWeatherInfo = async (lang) => {
    console.log('최신 날씨 정보 표시 시작');
    const result = await fetchLatestWeatherInfo(lang);
    const weatherInfoContainer = document.getElementById('latestWeatherInfo');
    
    if (result) {
      console.log('최신 날씨 정보 로드 완료:', result);
      weatherInfoContainer.textContent = JSON.stringify(result);
    } else {
      console.warn('최신 날짜 정보가 없음');
      weatherInfoContainer.textContent = '최신 날짜 정보가 없습니다.';
    }
  };
  
  const languageSelect = document.getElementById('languageSelect');
  languageSelect.addEventListener('change', () => {
    updateWeatherInfo(languageSelect.value);
  });
  
  console.log('최신 날씨 정보 표시 시작');
  updateWeatherInfo('ko');
  
  // 모든 언어의 번역문 가져오기
const fetchTranslations = async () => {
  console.log('번역문 정보 요청 시작');
  const response = await fetch('/api/translations');
  if (response.ok) {
      console.log('번역문 정보 요청 완료');
      return await response.json();
  } else {
      console.error('번역문 정보 요청 실패');
      throw new Error('번역문 정보를 가져오지 못했습니다.');
  }
};