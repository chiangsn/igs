import json, csv, sys
raw, out = sys.argv[1], sys.argv[2]
def n(v):
    try: return int(v)
    except: return 0
L=lambda f: json.load(open(raw+'/'+f,encoding='utf-8'))['items']
pop={r['year']:r for r in L('pop.json')}
unrwa={r['year']:r['total'] for r in L('unrwa.json')}
idmc={r['year']:r['total'] for r in L('idmc.json')}
with open(out+'/unhcr_forcibly_displaced.csv','w',newline='',encoding='utf-8') as f:
    w=csv.writer(f)
    w.writerow(['year','period','refugees_unhcr_mandate','palestine_refugees_unrwa','other_in_need_of_intl_protection','asylum_seekers','idps_conflict_idmc','idps_unhcr_protected_assisted','total_forcibly_displaced'])
    for y in range(2000,2027):
        p=pop[y]; mid = y==2026
        ref,oip,asy,uid=n(p['refugees']),n(p['oip']),n(p['asylum_seekers']),n(p['idps'])
        un=unrwa.get(y,'')
        idm='' if mid else idmc.get(y,'')   # API repeats end-2025 IDMC value for 2026
        tot='' if (idm=='' or un=='') else ref+un+oip+asy+idm
        w.writerow([y,'mid-year' if mid else 'end-year',ref,un,oip,asy,idm,uid,tot])
        if y in (2000,2024,2025,2026): print(y,ref,un,oip,asy,idm,uid,tot)
rows=[]
for r in L('coo2025.json'):
    ref,oip=n(r['refugees']),n(r['oip'])
    rows.append((ref+oip,ref,oip,r['coo_name'],r['coo_iso']))
rows.sort(reverse=True)
world=pop[2025]; wt=n(world['refugees'])+n(world['oip'])
with open(out+'/unhcr_top_origins_latest.csv','w',newline='',encoding='utf-8') as f:
    w=csv.writer(f); w.writerow(['rank','year','country_of_origin','iso3','refugees_unhcr_mandate','other_in_need_of_intl_protection','refugees_plus_oip','share_of_world_refugees_plus_oip_pct'])
    for i,(t,ref,oip,name,iso) in enumerate(rows[:10],1):
        w.writerow([i,2025,name,iso,ref,oip,t,round(100*t/wt,1)]); print(i,name,ref,oip,t)
print('world ref+oip',wt, 'sum coo', sum(x[0] for x in rows))
