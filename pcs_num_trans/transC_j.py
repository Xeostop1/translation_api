import pandas as pd
from deepl import Translator
from datetime import date
import logging

# 로깅 설정
logging.getLogger('deepl').setLevel(logging.WARNING)

# DeepL 번역기 초기화
KEY="4e36a497-bc39-241a-d7be-c0f4038ad781:fx"
translator = Translator(KEY) 

def preprocess(text, user_dict):
    # 사용자 사전에 따라 문장 내 단어 교체
    for original_word, translated_word in user_dict.items():
        text = text.replace(original_word, translated_word)
    
    return text

def translate_and_save(df, target_lang, user_dict):
    # 새로운 DataFrame 생성 (번역 결과 저장용)
    df_translated = pd.DataFrame()

    for column in df.columns:
        logging.info(f'"{column}" 컬럼을 {target_lang}로 번역 시작')
        
        # 각 컬럼의 모든 단어를 target_lang으로 번역
        translated_words = []
        for word in df[column]:
             # 사용자 사전 적용
            preprocessed_word = preprocess(word, user_dict) 
            translated_words.append(translator.translate_text(preprocessed_word, target_lang=target_lang))
        
        # 번역 결과를 새 DataFrame에 추가
        df_translated[column] = translated_words

        logging.info(f'"{column}" 컬럼을 {target_lang}로 번역 완료')

    # 새로운 엑셀 파일에 저장 
    today = date.today().strftime("%Y-%m-%d")
    output_filename = f'translated_words_{target_lang}_{today}.xlsx'
    df_translated.to_excel(output_filename, index=False)
    
    logging.info(f'번역 결과를 "{output_filename}" 파일에 저장함')

# **********엑셀 파일 읽기******************
# df = pd.read_excel('1006_pcs_num.xlsx')
df = pd.read_excel('1013_e.xlsx', usecols='C')

# 중국어 사용자 사전 엑셀 파일 읽기 (영어 -> 중국어)
df_user_dict_zh = pd.read_excel('ch_user.xlsx')
user_dict_zh = dict(zip(df_user_dict_zh['e'], df_user_dict_zh['c']))

# 중국어로 번역하고 저장
translate_and_save(df, "ZH", user_dict_zh)

# 일본어 사용자 사전 엑셀 파일 읽기 (영어 -> 일본어)
df_user_dict_ja = pd.read_excel('jp_user.xlsx')
user_dict_ja = dict(zip(df_user_dict_ja['e'], df_user_dict_ja['j']))

# 일본어로 번역하고 저장
translate_and_save(df, "JA", user_dict_ja)
