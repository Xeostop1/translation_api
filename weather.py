import requests
from datetime import date
import urllib.request
import json


#날씨
#디코딩으로 바꿔야 쓸 수 있데
# user_key='v%2FbmyjQ1Yy%2FomIctU2m4ivvpRYYIRLoGlOkWWb1OdxHuDHj%2FQGXFlpDN6OFuzy13yzrQHrLft1Dd8Ly0wwia%2FA%3D%3D'
user_key='v/bmyjQ1Yy/omIctU2m4ivvpRYYIRLoGlOkWWb1OdxHuDHj/QGXFlpDN6OFuzy13yzrQHrLft1Dd8Ly0wwia/A=='

url = 'http://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst'
today= f"{date.today()}"
today_str=today.replace("-","")
today_time=today_str+"0600"


params ={'serviceKey' : user_key, 
         'pageNo' : '1', 'numOfRows' : '10', 
         'dataType' : 'JSON', 'stnId' : '108', 
         'tmFc' : today_time }

response = requests.get(url, params=params)
#mjson변환
data = response.json()  
# response_str=response.content.decode('utf-8')
description = data["response"]["body"]["items"]["item"][0]["wfSv"]


#papago
client_id = "H24exeKjE56KuHGRm9lr" 
client_secret = "7mVVyvH_j0" 
encText = urllib.parse.quote(f"{description}")
data = "source=ko&target=en&text=" + encText
url = "https://openapi.naver.com/v1/papago/n2mt"
request = urllib.request.Request(url)
request.add_header("X-Naver-Client-Id",client_id)
request.add_header("X-Naver-Client-Secret",client_secret)
response = urllib.request.urlopen(request, data=data.encode("utf-8"))
rescode = response.getcode()
if(rescode==200):
    response_body = response.read()
    response_str = response_body.decode('utf-8')  
    data = json.loads(response_str)               
    translation_eng = data["message"]["result"]["translatedText"]
    print(translation_eng)
    
else:
    print("Error Code:" + rescode)

