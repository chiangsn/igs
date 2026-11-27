"""Validate S1 links.csv against CLAUDE.md / link-typology.md rules."""
import csv, sys, collections
sys.stdout.reconfigure(encoding='utf-8')
T = r'C:/research/IGS_course_development/topics/'
FOLD = {'S1': 'S1-global-env-justice', 'S2': 'S2-war', 'S3': 'S3-technology-history', 'S4': 'S4-sustainable-development-governance'}
ev = {}
for k, f in FOLD.items():
    for r in csv.DictReader(open(T + f + '/data/timeline.csv', encoding='utf-8')):
        ev[r['id']] = r
FLOWS = {'people', 'capital', 'technology', 'material', 'media', 'ideas'}
MECH = {'diffusion', 'burden_shifting', 'imposition', 'template', 'translation', 'commodity_chain', 'boomerang',
        'scale_up', 'colonial', 'geopolitical', 'litigation', 'memory'}
rows = list(csv.DictReader(open(T + FOLD['S1'] + '/data/links.csv', encoding='utf-8')))
assert list(rows[0].keys()) == ['id', 'from_id', 'to_id', 'flow', 'mechanism', 'direction', 'note_zh', 'sources']
err = []
ids = [r['id'] for r in rows]
if len(set(ids)) != len(ids): err.append('duplicate id')
pairs = set()
for r in rows:
    a, b = r['from_id'], r['to_id']
    for x in (a, b):
        if x not in ev: err.append(f"{r['id']} unknown id {x}")
    if a in ev and b in ev:
        ca = {c.strip() for c in ev[a]['country'].split(';')}
        cb = {c.strip() for c in ev[b]['country'].split(';')}
        if ca == cb and 'Global' not in (ev[a]['region'], ev[b]['region']):
            err.append(f"{r['id']} same-country {a} {b}")
    if not (a.startswith('S1-') or b.startswith('S1-')): err.append(f"{r['id']} no S1 end")
    key = tuple(sorted((a, b)))
    if key in pairs: err.append(f"{r['id']} duplicate pair")
    pairs.add(key)
    fl = r['flow'].split(';')
    if not fl or any(f not in FLOWS for f in fl): err.append(f"{r['id']} bad flow {r['flow']}")
    if r['mechanism'] not in MECH: err.append(f"{r['id']} bad mechanism {r['mechanism']}")
    if r['direction'] not in ('forward', 'mutual'): err.append(f"{r['id']} bad direction")
    if not r['sources'].strip(): err.append(f"{r['id']} no source")
    if not r['note_zh'].strip(): err.append(f"{r['id']} no note")
print('rows', len(rows), 'errors', err or 'none')
mc = collections.Counter(r['mechanism'] for r in rows)
fc = collections.Counter(f for r in rows for f in r['flow'].split(';'))
pf = collections.Counter(r['flow'].split(';')[0] for r in rows)
print('mechanism', dict(mc)); print('flow (any)', dict(fc)); print('flow (primary)', dict(pf))
print('direction', dict(collections.Counter(r['direction'] for r in rows)))
print('cross-topic', sum(1 for r in rows if not (r['from_id'].startswith('S1-') and r['to_id'].startswith('S1-'))))
print('with 待查證', [r['id'] for r in rows if '待查證' in r['sources'] or '待查證' in r['note_zh']])
print('wikipedia-only sources', [r['id'] for r in rows if all('wikipedia' in s or not s.strip().startswith('http') for s in r['sources'].split(' ; ')) and 'wikipedia' in r['sources']])
# flow x mechanism matrix (any flow)
mx = collections.Counter((m, f) for r in rows for f in r['flow'].split(';') for m in [r['mechanism']])
F = ['people', 'capital', 'technology', 'material', 'media', 'ideas']
print('| mechanism | ' + ' | '.join(F) + ' | 合計 |'); print('|---' * (len(F) + 2) + '|')
for m in sorted(MECH, key=lambda m: -mc[m]):
    print(f'| {m} | ' + ' | '.join(str(mx[(m, f)] or '') for f in F) + f' | {mc[m]} |')
