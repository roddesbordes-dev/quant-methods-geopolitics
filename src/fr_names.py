FR = {'Albania':'Albanie','Algeria':'Algérie','Argentina':'Argentine','Australia':'Australie','Austria':'Autriche','Azerbaijan':'Azerbaïdjan','Bangladesh':'Bangladesh','Belarus':'Biélorussie','Belgium':'Belgique','Benin':'Bénin','Bolivia':'Bolivie','Bosnia and Herzegovina':'Bosnie-Herzégovine','Brazil':'Brésil','Bulgaria':'Bulgarie','Burundi':'Burundi','Cameroon':'Cameroun','Canada':'Canada','Chile':'Chili','China':'Chine','China, Hong Kong SAR':'Hong Kong (Chine)','Colombia':'Colombie','Congo':'Congo','Costa Rica':'Costa Rica',"Cote d'Ivoire":"Côte d'Ivoire",'Croatia':'Croatie','Cuba':'Cuba','Cyprus':'Chypre','Czechia':'Tchéquie','Denmark':'Danemark','Dominican Republic':'République dominicaine','Ecuador':'Équateur','Egypt':'Égypte','El Salvador':'Salvador','Estonia':'Estonie','Finland':'Finlande','France':'France','Georgia':'Géorgie','Germany':'Allemagne','Ghana':'Ghana','Greece':'Grèce','Guatemala':'Guatemala','Haiti':'Haïti','Honduras':'Honduras','Hungary':'Hongrie','India':'Inde','Indonesia':'Indonésie','Iran':'Iran','Iraq':'Irak','Ireland':'Irlande','Israel':'Israël','Italy':'Italie','Japan':'Japon','Jordan':'Jordanie','Kazakhstan':'Kazakhstan','Kenya':'Kenya','Kuwait':'Koweït','Kyrgyzstan':'Kirghizstan','Latvia':'Lettonie','Lebanon':'Liban','Libya':'Libye','Lithuania':'Lituanie','Luxembourg':'Luxembourg','Malawi':'Malawi','Malaysia':'Malaisie','Malta':'Malte','Mexico':'Mexique','Moldova':'Moldavie','Montenegro':'Monténégro','Morocco':'Maroc','Myanmar':'Myanmar','Nepal':'Népal','Netherlands':'Pays-Bas','New Zealand':'Nouvelle-Zélande','Nicaragua':'Nicaragua','Nigeria':'Nigeria','North Macedonia':'Macédoine du Nord','Norway':'Norvège','Oman':'Oman','Other Europe, nes':'Autres pays d\'Europe','Pakistan':'Pakistan','Panama':'Panama','Paraguay':'Paraguay','Peru':'Pérou','Philippines':'Philippines','Poland':'Pologne','Portugal':'Portugal','Qatar':'Qatar','Romania':'Roumanie','Russia':'Russie','Rwanda':'Rwanda','Saudi Arabia':'Arabie saoudite','Senegal':'Sénégal','Serbia':'Serbie','Singapore':'Singapour','Slovakia':'Slovaquie','Slovenia':'Slovénie','South Africa':'Afrique du Sud','South Korea':'Corée du Sud','Spain':'Espagne','Sri Lanka':'Sri Lanka','Sweden':'Suède','Switzerland':'Suisse','Syria':'Syrie','Taiwan (“Other Asia”)':'Taïwan (« autre Asie »)','Tajikistan':'Tadjikistan','Thailand':'Thaïlande','Togo':'Togo','Tunisia':'Tunisie','Turkiye':'Turquie','Turkmenistan':'Turkménistan','Türkiye':'Turquie','USA':'États-Unis','Ukraine':'Ukraine','United Arab Emirates':'Émirats arabes unis','United Kingdom':'Royaume-Uni','United States':'États-Unis','Uruguay':'Uruguay','Uzbekistan':'Ouzbékistan','Venezuela':'Venezuela','Vietnam':'Viêt Nam','Yemen':'Yémen','Zambia':'Zambie','Zimbabwe':'Zimbabwe'}
import json
def tr(x): return FR.get(x,x)
def fr_data(n, raw):
    d=json.loads(raw)
    if n==1:
        for x in d['ten']: x['name']=tr(x['name'])
        for x in d['all']: x['n']=tr(x['n'])
    elif n==2:
        for x in d['pew']: x['c']=tr(x['c'])
    elif n==3:
        for x in d['countries']: x['n']=tr(x['n']); x['top']=[[tr(a),b] for a,b in x['top']]
        for p in d['products']: p['top']=[[tr(a),b] for a,b in p['top']]
    elif n==4:
        for x in d['c']: x['n']=tr(x['n'])
    elif n==6:
        for x in d['fuel']: x['n']=tr(x['n'])
    return json.dumps(d, ensure_ascii=False)
