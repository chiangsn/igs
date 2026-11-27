"""List S4 link candidates from timeline linked_ids (undirected, deduped).
Usage: python data/scripts/candidates.py [out.tsv]"""
import csv, sys
sys.stdout.reconfigure(encoding='utf-8')
T = 'C:/research/IGS_course_development/topics/'
FOLD = {'S1': 'S1-global-env-justice', 'S2': 'S2-war', 'S3': 'S3-technology-history', 'S4': 'S4-sustainable-development-governance'}
ev = {}
for k, f in FOLD.items():
    try:
        for r in csv.DictReader(open(T + f + '/data/timeline.csv', encoding='utf-8')):
            ev[r['id']] = r
    except FileNotFoundError:
        pass
cs = lambda e: {c.strip() for c in e['country'].split(';')}
pairs = set()
for r in ev.values():
    if not r['id'].startswith('S4-'):
        continue
    for l in filter(None, r['linked_ids'].split(';')):
        pairs.add(tuple(sorted((r['id'], l.strip()))))
rows, stat = [], {'total': 0, 'missing': 0, 'same_country': 0, 'both_global': 0, 'candidate': 0, 'cross_topic': 0}
for a, b in sorted(pairs):
    stat['total'] += 1
    if a not in ev or b not in ev:
        stat['missing'] += 1; continue
    ea, eb = ev[a], ev[b]
    ga, gb = ea['region'] == 'Global', eb['region'] == 'Global'
    if ga and gb:
        kind = 'both_global'
    elif not ga and not gb and cs(ea) == cs(eb):
        kind = 'same_country'
    else:
        kind = 'candidate'
    stat[kind] += 1
    if kind == 'candidate' and not (a.startswith('S4-') and b.startswith('S4-')):
        stat['cross_topic'] += 1
    rows.append([kind, a, ea['year_start'], ea['region'], ea['country'], ea['name'][:60], b, eb['year_start'], eb['region'], eb['country'], eb['name'][:60]])
print(stat)
if len(sys.argv) > 1:
    with open(sys.argv[1], 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter='\t')
        w.writerow(['kind', 'a', 'a_year', 'a_region', 'a_country', 'a_name', 'b', 'b_year', 'b_region', 'b_country', 'b_name'])
        w.writerows(rows)
