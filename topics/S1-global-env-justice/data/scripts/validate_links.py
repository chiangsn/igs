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
        'scale_up', 'colonial', 'geopolitical', 'litigation', 'memory', 'contestation', 'evasion'}  # 14 (typology v2)
rows = list(csv.DictReader(open(T + FOLD['S1'] + '/data/links.csv', encoding='utf-8')))
assert list(rows[0].keys()) == ['id', 'from_id', 'to_id', 'flow', 'mechanism', 'mechanism_2', 'direction', 'note_zh', 'sources']
REMOVED = {'S1-L015', 'S1-L016', 'S1-L017', 'S1-L019', 'S1-L020', 'S1-L022', 'S1-L023', 'S1-L028', 'S1-L033',
           'S1-L054', 'S1-L058', 'S1-L073', 'S1-L076', 'S1-L079', 'S1-L081'}  # retired in round 5, never reuse
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
    m2 = r['mechanism_2'].strip()
    if m2 and m2 not in MECH: err.append(f"{r['id']} bad mechanism_2 {m2}")
    if m2 and m2 == r['mechanism']: err.append(f"{r['id']} mechanism_2 equals mechanism")
    if r['id'] in REMOVED: err.append(f"{r['id']} reuses a retired id")
    if len(set(fl)) != len(fl): err.append(f"{r['id']} repeated flow")
    if r['direction'] not in ('forward', 'mutual'): err.append(f"{r['id']} bad direction")
    if not r['sources'].strip(): err.append(f"{r['id']} no source")
    if not r['note_zh'].strip(): err.append(f"{r['id']} no note")
print('rows', len(rows), 'errors', err or 'none')
mc = collections.Counter(r['mechanism'] for r in rows)
fc = collections.Counter(f for r in rows for f in r['flow'].split(';'))
pf = collections.Counter(r['flow'].split(';')[0] for r in rows)
print('mechanism', dict(mc)); print('flow (any)', dict(fc)); print('flow (primary)', dict(pf))
m2c = collections.Counter(r['mechanism_2'] for r in rows if r['mechanism_2'])
print('mechanism_2', dict(m2c), 'filled', sum(m2c.values()))
print('direction', dict(collections.Counter(r['direction'] for r in rows)))
print('cross-topic', sum(1 for r in rows if not (r['from_id'].startswith('S1-') and r['to_id'].startswith('S1-'))))
print('with 待查證', [r['id'] for r in rows if '待查證' in r['sources'] or '待查證' in r['note_zh']])
print('wikipedia-only sources', [r['id'] for r in rows if all('wikipedia' in s or not s.strip().startswith('http') for s in r['sources'].split(' ; ')) and 'wikipedia' in r['sources']])
# flow x mechanism matrix (any flow)
mx = collections.Counter((m, f) for r in rows for f in r['flow'].split(';') for m in [r['mechanism']])
F = ['people', 'capital', 'technology', 'material', 'media', 'ideas']
print('| mechanism | ' + ' | '.join(F) + ' | 主要機制 | 次要機制 |'); print('|---' * (len(F) + 3) + '|')
for m in sorted(MECH, key=lambda m: -mc[m]):
    print(f'| {m} | ' + ' | '.join(str(mx[(m, f)] or '') for f in F) + f' | {mc[m]} | {m2c[m] or ""} |')
print('| **合計** | ' + ' | '.join(str(fc[f]) for f in F) + f' | {len(rows)} | {sum(m2c.values())} |')
pm = collections.Counter((r['mechanism'], r['flow'].split(';')[0]) for r in rows)
print('primary flow x mechanism'); print('| mechanism | ' + ' | '.join(F) + ' |'); print('|---' * (len(F) + 1) + '|')
for m in sorted(MECH, key=lambda m: -mc[m]):
    print(f'| {m} | ' + ' | '.join(str(pm[(m, f)] or '') for f in F) + ' |')
