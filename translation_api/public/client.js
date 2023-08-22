function displayTranslatedForecast(lang) {
    fetch(`/weather-forecast/${lang}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const forecastElement = document.getElementById('forecast');
          forecastElement.innerHTML = data.data.replaceAll('\n', '<br>');
        } else {
          console.error('Error fetching translated weather forecast:', data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching translated weather forecast:', error.message);
      });
  }
  
  // 예시로 한국어로 날씨 정보를 출력하도록하였으나, 원하는 언어 코드로 변경 가능합니다.
  displayTranslatedForecast('ko');
  