"""List cross-border candidate pairs from S2 timeline linked_ids (link-typology.md v2 scope rules)."""
import csv, sys
sys.stdout.reconfigure(encoding='utf-8')
T = r'C:/research/IGS_course_development/topics/'
FOLD = {'S1': 'S1-global-env-justice', 'S2': 'S2-war', 'S3': 'S3-technology-history', 'S4': 'S4-sustainable-development-governance'}
ev = {}
for f in FOLD.values():
    for r in csv.DictReader(open(T + f + '/data/timeline.csv', encoding='utf-8')):
        ev[r['id']] = r
def cs(e): return {c.strip() for c in ev[e]['country'].split(';') if c.strip()}
pairs = set()
for r in csv.DictReader(open(T + FOLD['S2'] + '/data/timeline.csv', encoding='utf-8')):
    for l in r['linked_ids'].split(';'):
        l = l.strip()
        if l and l in ev: pairs.add(tuple(sorted((r['id'], l))))
same = glob = 0; cand = []
for a, b in sorted(pairs):
    ga, gb = ev[a]['region'] == 'Global', ev[b]['region'] == 'Global'
    if ga and gb: glob += 1; continue
    if not (ga or gb) and cs(a) == cs(b): same += 1; continue
    cand.append((a, b))
print(f'pairs {len(pairs)} same-country {same} both-global {glob} candidates {len(cand)}', file=sys.stderr)
for a, b in cand:
    print(f"{a}\t{b}\t{ev[a]['year_start']} {ev[a]['name'][:30]} [{ev[a]['country']}]\t{ev[b]['year_start']} {ev[b]['name'][:30]} [{ev[b]['country']}]")
