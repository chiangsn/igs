"""List cross-border link candidates from S1 linked_ids.
Cross-border = the two events' country sets differ, or either event is region Global."""
import csv, sys
sys.stdout.reconfigure(encoding='utf-8')
base = r'C:/research/IGS_course_development/topics'
rows = {r['id']: r for r in csv.DictReader(open(base + '/S1-global-env-justice/data/timeline.csv', encoding='utf-8'))}
def cset(r): return frozenset(c.strip() for c in r['country'].split(';'))
pairs, same = {}, 0
for r in rows.values():
    for t in filter(None, r['linked_ids'].split(';')):
        a, b = sorted([r['id'], t])
        if (a, b) in pairs: continue
        x, y = rows[a], rows[b]
        glob = 'Global' in (x['region'], y['region'])
        if cset(x) == cset(y) and not glob:
            same += 1; continue
        pairs[(a, b)] = 'global' if glob else ('overlap' if cset(x) & cset(y) else 'distinct')
print('cross-border pairs', len(pairs), 'same-country', same)
from collections import Counter
print(Counter(pairs.values()))
w = csv.writer(open(sys.argv[1], 'w', encoding='utf-8', newline=''))
w.writerow(['a', 'b', 'kind', 'a_year', 'a_country', 'a_name', 'b_year', 'b_country', 'b_name'])
for (a, b), k in sorted(pairs.items()):
    x, y = rows[a], rows[b]
    w.writerow([a, b, k, x['year_start'], x['country'], x['name'][:40], y['year_start'], y['country'], y['name'][:40]])
