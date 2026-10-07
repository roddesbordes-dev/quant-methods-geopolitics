import json, sys, os, re
H=os.path.dirname(os.path.abspath(__file__))
core_css=open(f'{H}/core.css').read(); core_js=open(f'{H}/core.js').read()
BASE='''*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}[hidden]{display:none!important}'''
FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,500..800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">'
def page(title, desc, body, script, full=True, lang='en-GB'):
    head=f'<title>{title}</title>\n<meta name="description" content="{desc}">\n{FONTS}\n<style>{BASE}\n{core_css}</style>\n'
    html=head+f'<div class="wrap">\n{body}\n</div>\n<script>\n{script}\n</script>\n'
    if full: html='<!doctype html>\n<html lang="'+lang+'">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+html.replace('<div class="wrap">','</head>\n<body>\n<div class="wrap">',1)+'</body>\n</html>\n'
    return html
SESS={1:("Can We Trust the Numbers?","Session 1: night lights, defence spending and honest charts."),
      2:("Can We Trust a Poll?","Session 2: margins of error, the Moldovan referendum and European views of China."),
      3:("Who Depends on Whom?","Session 3: import dependence, concentration and vulnerability indices."),
      4:("Poland, Spain and the Line","Session 4: regression, controls and outliers in European defence spending."),
      5:("German Cars in Kyrgyzstan","Session 5: difference-in-differences and event studies of sanctions circumvention."),
      6:("What Hormuz Costs","Session 6: costing a geoeconomic shock and auditing an AI's analysis.")}
SESS_FR={1:("Peut-on se fier aux chiffres ?","Séance 1 : lumières nocturnes, dépenses de défense et graphiques honnêtes."),
      2:("Peut-on se fier à un sondage ?","Séance 2 : marges d'erreur, référendum moldave et opinions européennes sur la Chine."),
      3:("Qui dépend de qui ?","Séance 3 : dépendance aux importations, concentration et indices de vulnérabilité."),
      4:("La Pologne, l'Espagne et la droite","Séance 4 : régression, variables de contrôle et valeurs atypiques des dépenses de défense."),
      5:("Voitures allemandes au Kirghizstan","Séance 5 : différence de différences et étude d'événement du contournement des sanctions."),
      6:("Ce que coûte Ormuz","Séance 6 : chiffrer un choc géoéconomique et vérifier l'analyse d'une IA.")}
OTHER={'en':{'index':("Quantitative Methods for Geopolitics","A free, self-paced course in quantitative methods for geopolitics and geoeconomics."),
             'intro':("Why This Course","Why quantitative methods matter in geopolitics: learning outcomes and practical skills."),
             'certificate':("Course Certificate","Certificate of completion for the self-paced course."),
             'glossary':("Course Glossary","Plain-language definitions of every technical term in the course.")},
       'fr':{'index':("Méthodes quantitatives pour la géopolitique","Un cours gratuit, à suivre à son rythme, de méthodes quantitatives pour la géopolitique et la géoéconomie."),
             'intro':("Pourquoi ce cours","Pourquoi les méthodes quantitatives comptent en géopolitique : objectifs d'apprentissage et compétences pratiques."),
             'certificate':("Attestation du cours","Attestation de réussite du cours à suivre à son rythme."),
             'glossary':("Glossaire du cours","Définitions en mots simples de tous les termes techniques du cours.")}}
TITLES_FR={'"Puzzle"':'"Énigme"','"Lesson A"':'"Leçon A"','"Lesson B"':'"Leçon B"','"Activity A"':'"Activité A"','"Activity B"':'"Activité B"','"Feedback A"':'"Retour A"','"Feedback B"':'"Retour B"','"Exercise"':'"Exercice"','"Exercise 2"':'"Exercice 2"','"Claim audit"':'"Audit d\'affirmation"','"Self-check"':'"Autoévaluation"'}
FR_NUM = 'const __tf=Number.prototype.toFixed; Number.prototype.toFixed=function(d){ return __tf.call(this,d).replace(".", ","); };\n'
gloss_js=open(f'{H}/glossary.js').read()
import sys; sys.path.insert(0,H); from fr_names import fr_data
def src(lang, name):
    p = f'{H}/fr/{name}' if lang=='fr' else f'{H}/{name}'
    return open(p).read() if os.path.exists(p) else None
def fix_fr_body(b):
    for k,v in TITLES_FR.items(): b=b.replace('data-title='+k,'data-title='+v)
    return b.replace('type="number"','type="text" inputmode="decimal"')
def fix_fr_js(j):
    return j.replace('c.d.toFixed(3)','(Math.round(c.d*1000)/1000)').replace('c.g.toFixed(3)','(Math.round(c.g*1000)/1000)')
def prefix(lang, n):
    return f'window.SESSION={n!r};\nwindow.LANG="{lang}";\n'+(FR_NUM if lang=='fr' else '')
def build(out, lang):
    os.makedirs(out, exist_ok=True); L='fr' if lang=='fr' else 'en-GB'
    for n,(t,d) in (SESS_FR if lang=='fr' else SESS).items():
        body=src(lang,f's{n}.body.html'); js=src(lang,f's{n}.js')
        if body is None or js is None: continue
        if lang=='fr': body=fix_fr_body(body); js=fix_fr_js(js)
        data=open(f'{H}/s{n}.json').read() if os.path.exists(f'{H}/s{n}.json') else '{}'
        if lang=='fr' and data!='{}': data=fr_data(n,data)
        script=prefix(lang,n)+f'const DATA = {data};\n'+gloss_js+'\n'+core_js+'\n'+js
        open(f'{out}/session{n}.html','w').write(page(t,d,body,script,True,L))
    for name,jsname,sess in [('index','index.js',0),('intro',None,0),('certificate','certificate.js','cert'),('glossary','glossary-page.js',0)]:
        body=src(lang,f'{name}.body.html')
        if body is None: continue
        if lang=='fr': body=fix_fr_body(body)
        js=(src(lang,jsname) or open(f'{H}/{jsname}').read()) if jsname else ''
        script=prefix(lang,sess)+'const DATA = {};\n'+gloss_js+'\n'+core_js+'\n'+js
        t,d=OTHER['fr' if lang=='fr' else 'en'][name]
        open(f'{out}/{name}.html','w').write(page(t,d,body,script,True,L))
build(f'{H}/site','en'); build(f'{H}/site/fr','fr')
print(sorted(os.listdir(f'{H}/site')), sorted(os.listdir(f'{H}/site/fr')))
