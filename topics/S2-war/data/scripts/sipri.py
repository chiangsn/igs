import openpyxl,sys,csv
src,out=sys.argv[1],sys.argv[2]
wb=openpyxl.load_workbook(src,read_only=True,data_only=True)
def table(name,hdrcol0='Region'):
    rows=list(wb[name].iter_rows(values_only=True))
    h=[i for i,r in enumerate(rows) if r[0] in ('Region','Country')][0]
    return rows[h],rows[h+1:]
num=lambda v: v if isinstance(v,(int,float)) else None
hdr,rows=table('Regional totals')
world=[r for r in rows if r[0]=='World'][0]
cur_idx=hdr.index('2025 (current prices)'); world_cur=world[cur_idx]
with open(out+'/sipri_milex_world.csv','w',newline='',encoding='utf-8') as f:
    w=csv.writer(f); w.writerow(['year','world_milex_usd_bn_constant_2024','world_milex_usd_bn_current','note'])
    for i,y in enumerate(hdr):
        if isinstance(y,int):
            v=num(world[i]); w.writerow([y, round(v,1) if v is not None else '', round(world_cur,1) if y==2025 else '', '' if v is not None else 'world total not available in source (no estimate for USSR/Europe)'])
print('world 2024c,2025c, 2025 cur', world[hdr.index(2024)], world[hdr.index(2025)], world_cur)
def countries(name):
    hdr,rows=table(name); yi=hdr.index(2025); d={}
    for r in rows:
        if r[0] and num(r[yi]) is not None: d[r[0]]=r[yi]
    return d
cur=countries('Current US$'); con=countries('Constant (2024) US$'); gdp=countries('Share of GDP')
# exclude region labels (those have no numeric data anyway)
top=sorted(cur.items(),key=lambda x:-x[1])[:10]
with open(out+'/sipri_top10_spenders_latest.csv','w',newline='',encoding='utf-8') as f:
    w=csv.writer(f); w.writerow(['rank','year','country','milex_usd_bn_current','share_of_world_pct','milex_usd_bn_constant_2024','milex_share_of_gdp_pct'])
    for i,(c,v) in enumerate(top,1):
        g=gdp.get(c)
        w.writerow([i,2025,c,round(v/1000,1),round(100*v/1000/world_cur,1),round(con[c]/1000,1) if c in con else '',round(100*g,1) if g is not None else ''])
        print(i,c,round(v/1000,1),round(100*v/1000/world_cur,1),g)
