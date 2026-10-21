# 파일 5개를 아티팩트용 HTML 한 장으로 합친다 (python3 build_artifact.py)
import re
html=open('index.html',encoding='utf-8').read()
css=open('style.css',encoding='utf-8').read()
body=re.search(r'<body>(.*)</body>',html,re.S).group(1)
body=re.sub(r'\s*<script src="[^"]*"></script>','',body)   # 외부 스크립트 태그 제거
js='\n'.join(open(f,encoding='utf-8').read() for f in ['config.example.js','data.js','engine.js','store.js','sound.js','app.js'])
js=js.replace('</script>','<\\/script>')
import base64,os,glob
def datauri(path):
    jpg=path.replace('.png','.jpg')
    if os.path.exists(jpg): return 'data:image/jpeg;base64,'+base64.b64encode(open(jpg,'rb').read()).decode()
    return None
def images_script():
    m={}
    for png in sorted(glob.glob('images/char_*.png')+glob.glob('images/disaster_*.png')):
        u=datauri(png)
        if u: m[png]=u
    import json
    return '<script>window.IMAGES='+json.dumps(m)+'</script>'
out=f'''<title>기후 불평등 게임</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700;900&display=swap">
<style>
/* 레이아웃: 가로 화면 한 장짜리 게임. 토큰 */
:root {{ color-scheme: light; }}
{css.replace('"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif','"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif')}
html, body {{ height: 100%; }}
body {{ padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 0; }}
#app {{ width: 100%; height: 100%; }}
</style>
{body}
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script>
{js}
</script>
'''
out=out.replace('<script>\n'+js, images_script()+'\n<script>\n'+js,1)
open('climate-game-artifact.html','w',encoding='utf-8').write(out)
print(len(out),'bytes')
