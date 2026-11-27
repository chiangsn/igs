"""List link candidates from S3 timeline linked_ids (undirected pairs), with same-country / Global flags."""
import csv, sys
sys.stdout.reconfigure(encoding='utf-8')
T = 'C:/research/IGS_course_development/topics/'
FOLD = {'S1': 'S1-global-env-justice', 'S2': 'S2-war', 'S3': 'S3-technology-history', 'S4': 'S4-sustainable-development-governance'}
ev = {}
for k, f in FOLD.items():
    for r in csv.DictReader(open(T + f + '/data/timeline.csv', encoding='utf-8')):
        ev[r['id']] = r
pairs = {}
for r in csv.DictReader(open(T + FOLD['S3'] + '/data/timeline.csv', encoding='utf-8')):
    for x in [x.strip() for x in r['linked_ids'].split(';') if x.strip()]:
        pairs.setdefault(tuple(sorted((r['id'], x))), None)
out = []
for a, b in sorted(pairs):
    A, B = ev.get(a), ev.get(b)
    if not A or not B: out.append((a, b, 'missing')); continue
    ca = {c.strip() for c in A['country'].split(';')}; cb = {c.strip() for c in B['country'].split(';')}
    glob = 'Global' in (A['region'], B['region'])
    kind = 'both_global' if A['region'] == B['region'] == 'Global' else 'same_country' if ca == cb and not glob else 'cross'
    out.append((a, b, kind))
w = csv.writer(open(sys.argv[1], 'w', encoding='utf-8', newline='')) if len(sys.argv) > 1 else None
import collections
print(len(out), collections.Counter(k for *_, k in out))
if w:
    w.writerow(['a', 'b', 'kind', 'a_year', 'a_country', 'a_name', 'b_year', 'b_country', 'b_name'])
    for a, b, k in out:
        A, B = ev.get(a, {}), ev.get(b, {})
        w.writerow([a, b, k, A.get('year_start'), A.get('country'), A.get('name'), B.get('year_start'), B.get('country'), B.get('name')])
