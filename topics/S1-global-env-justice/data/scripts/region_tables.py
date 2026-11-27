"""Regenerate the event table at the end of each regions/*.md from data/timeline.csv (everything after the '## 事件清單' heading line)."""
import csv, glob, os
B = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
rows = list(csv.DictReader(open(os.path.join(B, 'data', 'timeline.csv'), encoding='utf-8')))
F = {
 'latin-america-caribbean': lambda r: r['region'] == 'Latin America & Caribbean',
 'sub-saharan-africa': lambda r: r['region'] == 'Sub-Saharan Africa',
 'middle-east-north-africa': lambda r: r['region'] == 'Middle East & North Africa',
 'south-asia': lambda r: r['region'] == 'South Asia',
 'southeast-asia': lambda r: r['region'] == 'Southeast Asia',
 'east-asia': lambda r: r['region'] == 'East Asia' and r['country'] != 'Taiwan',
 'taiwan': lambda r: 'Taiwan' in r['country'],
 'europe': lambda r: r['region'] == 'Europe',
 'oceania-pacific': lambda r: r['region'] == 'Oceania & Pacific',
 'arctic-indigenous': lambda r: r['region'] == 'Arctic',
 'north-america': lambda r: r['region'] == 'North America',
 'global-transnational': lambda r: r['region'] == 'Global',
}
for name, f in F.items():
    p = os.path.join(B, 'regions', name + '.md')
    t = open(p, encoding='utf-8').read()
    i = t.index('## 事件清單'); j = t.index('\n', i)
    sel = sorted([r for r in rows if f(r)], key=lambda r: (int(r['year_start']), r['id']))
    L = ['| id | 年代 | 國家 | 事件 | 類型 | 議題 |', '|---|---|---|---|---|---|']
    for r in sel:
        yr = r['year_start'] if r['year_start'] == r['year_end'] else f"{r['year_start']}–{r['year_end']}"
        L.append(f"| {r['id']} | {yr} | {r['country']} | {r['name']} | {r['type']} | {r['issue'].replace(';', '; ')} |")
    L.append(f"\n共 {len(sel)} 筆。行動者、結果與來源詳見 `data/timeline.csv`。\n")
    open(p, 'w', encoding='utf-8').write(t[:j + 1] + '\n'.join(L))
    print(name, len(sel))
