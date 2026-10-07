import json, sys, os, re
H=os.path.dirname(os.path.abspath(__file__))
core_css=open(f'{H}/core.css').read(); core_js=open(f'{H}/core.js').read()
BASE='''*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}[hidden]{display:none!important}'''
FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,500..800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">'
def page(title, desc, body, script, full=True):
    head=f'<title>{title}</title>\n<meta name="description" content="{desc}">\n{FONTS}\n<style>{BASE}\n{core_css}</style>\n'
    html=head+f'<div class="wrap">\n{body}\n</div>\n<script>\n{script}\n</script>\n'
    if full: html='<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+html.replace('<div class="wrap">','</head>\n<body>\n<div class="wrap">',1)+'</body>\n</html>\n'
    return html
SESS={1:("Can We Trust the Numbers?","Session 1: night lights, defence spending and honest charts."),
      2:("Can We Trust a Poll?","Session 2: margins of error, the Moldovan referendum and European views of China."),
      3:("Who Depends on Whom?","Session 3: import dependence, concentration and vulnerability indices."),
      4:("Poland, Spain and the Line","Session 4: regression, controls and outliers in European defence spending."),
      5:("German Cars in Kyrgyzstan","Session 5: difference-in-differences and event studies of sanctions circumvention."),
      6:("What Hormuz Costs","Session 6: costing a geoeconomic shock and auditing an AI's analysis.")}
def build(out, full):
    os.makedirs(out, exist_ok=True)
    for n,(t,d) in SESS.items():
        bp=f'{H}/s{n}.body.html'
        if not os.path.exists(bp): continue
        data=open(f'{H}/s{n}.json').read() if os.path.exists(f'{H}/s{n}.json') else '{}'
        script=f'window.SESSION={n};\nconst DATA = {data};\n'+core_js+'\n'+open(f'{H}/s{n}.js').read()
        open(f'{out}/session{n}.html','w').write(page(t,d,open(bp).read(),script,True))
    if os.path.exists(f'{H}/index.body.html'):
        script='window.SESSION=0;\nconst DATA = {};\n'+core_js+'\n'+open(f'{H}/index.js').read()
        open(f'{out}/index.html','w').write(page("Quantitative Methods for Geopolitics","A free, self-paced course in quantitative methods for geopolitics and geoeconomics.",open(f'{H}/index.body.html').read(),script,full))
def extra(out):
    script='window.SESSION=0;\nconst DATA = {};\n'+core_js
    open(f'{out}/certificate.html','w').write(page("Course Certificate","Certificate of completion for the self-paced course.",open(f'{H}/certificate.body.html').read(),"window.SESSION='cert';\nconst DATA = {};\n"+core_js+'\n'+open(f'{H}/certificate.js').read(),True))
    open(f'{out}/intro.html','w').write(page("Why This Course","Why quantitative methods matter in geopolitics: learning outcomes and practical skills.",open(f'{H}/intro.body.html').read(),script,True))
build(f'{H}/site', True); extra(f'{H}/site')       # GitHub Pages
print(sorted(os.listdir(f'{H}/site')))
