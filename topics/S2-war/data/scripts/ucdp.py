import csv, sys, collections
raw, out = sys.argv[1], sys.argv[2]
acd = list(csv.DictReader(open(raw+'/acd/UcdpPrioConflict_v26_1.csv', encoding='utf-8')))
brd = list(csv.DictReader(open(raw+'/brd/BattleDeaths_v26_1_conf.csv', encoding='utf-8')))
T = {'1':'extrasystemic','2':'interstate','3':'intrastate','4':'internationalized_intrastate'}
R = {'1':'Europe','2':'Middle East','3':'Asia','4':'Africa','5':'Americas'}
years = sorted({int(r['year']) for r in acd})
by = collections.defaultdict(lambda: collections.Counter())
for r in acd:
    y=int(r['year']); c=by[y]; c['total']+=1; c[T[r['type_of_conflict']]]+=1
    if r['intensity_level']=='2': c['wars']+=1
bd = collections.defaultdict(lambda: [0,0,0]); bdn=collections.Counter()
for r in brd:
    y=int(r['year'])
    for i,k in enumerate(['bd_best','bd_low','bd_high']): bd[y][i]+=int(r[k])
    bdn[y]+=1
with open(out+'/ucdp_conflicts_by_year.csv','w',newline='',encoding='utf-8') as f:
    w=csv.writer(f); w.writerow(['year','conflicts_total','interstate','intrastate','internationalized_intrastate','extrasystemic','wars_1000plus','battle_deaths_best','battle_deaths_low','battle_deaths_high'])
    for y in years:
        c=by[y]; b=bd.get(y)
        w.writerow([y,c['total'],c['interstate'],c['intrastate'],c['internationalized_intrastate'],c['extrasystemic'],c['wars']]+(b if b else ['','','']))
        if b and bdn[y]!=c['total']: print('mismatch',y,bdn[y],c['total'])
rg = collections.defaultdict(collections.Counter); multi=0
for r in acd:
    codes=[x.strip() for x in r['region'].split(',')]
    if len(codes)>1: multi+=1
    for x in codes: rg[int(r['year'])][R[x]]+=1
with open(out+'/ucdp_conflicts_by_region_year.csv','w',newline='',encoding='utf-8') as f:
    w=csv.writer(f); w.writerow(['year','Europe','Middle East','Asia','Africa','Americas'])
    for y in years: w.writerow([y]+[rg[y][R[k]] for k in '12345'])
print('years',years[0],years[-1],len(years),'multi-region conflict-years',multi, 'brd years',min(bd),max(bd))
for y in [1946,1991,2022,2024,2025]: print(y,dict(by[y]),bd.get(y))
