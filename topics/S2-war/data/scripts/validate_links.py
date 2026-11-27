"""Validate S2 data/links.csv against link-typology.md (v2, 2026-11-27).

Run from anywhere:  python topics/S2-war/data/scripts/validate_links.py
Checks: header (v2 columns); every from_id/to_id exists in S1–S4 timelines; flow / mechanism /
mechanism_2 / direction vocabularies; mechanism_2 != mechanism; no same-country link (both ends
non-Global with identical country sets); no both-Global link; no duplicate pair or id; at least one
S2 end; every row has note_zh and a non-Wikipedia http source. Prints distribution tables.
"""
import csv, sys, collections, pathlib
sys.stdout.reconfigure(encoding='utf-8')
HERE = pathlib.Path(__file__).resolve()
TOPICS = HERE.parents[3]
S2 = HERE.parents[1]
FOLD = {'S1': 'S1-global-env-justice', 'S2': 'S2-war', 'S3': 'S3-technology-history',
        'S4': 'S4-sustainable-development-governance'}
COLS = ['id', 'from_id', 'to_id', 'flow', 'mechanism', 'mechanism_2', 'direction', 'note_zh', 'sources']
FLOWS = ['people', 'capital', 'technology', 'material', 'media', 'ideas']
MECH = ['diffusion', 'burden_shifting', 'imposition', 'template', 'translation', 'contestation', 'evasion',
        'commodity_chain', 'boomerang', 'scale_up', 'colonial', 'geopolitical', 'litigation', 'memory']

ev = {}
for f in FOLD.values():
    p = TOPICS / f / 'data' / 'timeline.csv'
    if p.exists():
        for r in csv.DictReader(open(p, encoding='utf-8')):
            ev[r['id']] = r

def countries(e):
    return {c.strip() for c in ev[e]['country'].split(';') if c.strip()}

reader = csv.DictReader(open(S2 / 'links.csv', encoding='utf-8'))
rows = list(reader)
err = []
if reader.fieldnames != COLS:
    err.append(f'header {reader.fieldnames} != {COLS}')
ids = [r['id'] for r in rows]
for i in {x for x in ids if ids.count(x) > 1}:
    err.append(f'duplicate id {i}')
pairs = {}
for r in rows:
    rid, a, b = r['id'], r['from_id'], r['to_id']
    if not rid.startswith('S2-L'):
        err.append(f'{rid} id must start with S2-L')
    for x in (a, b):
        if x not in ev:
            err.append(f'{rid} unknown event id {x}')
    if a == b:
        err.append(f'{rid} self-link')
    if a in ev and b in ev:
        ga, gb = ev[a]['region'] == 'Global', ev[b]['region'] == 'Global'
        if ga and gb:
            err.append(f'{rid} both ends Global ({a}, {b})')
        elif not (ga or gb) and countries(a) == countries(b):
            err.append(f'{rid} same-country {a} {b} {sorted(countries(a))}')
    if not (a.startswith('S2-') or b.startswith('S2-')):
        err.append(f'{rid} has no S2 end')
    key = tuple(sorted((a, b)))
    if key in pairs:
        err.append(f'{rid} duplicate pair with {pairs[key]}')
    pairs[key] = rid
    fl = [f.strip() for f in r['flow'].split(';')]
    if not fl or any(f not in FLOWS for f in fl) or len(set(fl)) != len(fl):
        err.append(f'{rid} bad flow {r["flow"]!r}')
    if r['mechanism'] not in MECH:
        err.append(f'{rid} bad mechanism {r["mechanism"]!r}')
    m2 = r['mechanism_2'].strip()
    if m2 and m2 not in MECH:
        err.append(f'{rid} bad mechanism_2 {m2!r}')
    if m2 and m2 == r['mechanism']:
        err.append(f'{rid} mechanism_2 equals mechanism')
    if r['direction'] not in ('forward', 'mutual'):
        err.append(f'{rid} bad direction {r["direction"]!r}')
    if not r['note_zh'].strip():
        err.append(f'{rid} no note_zh')
    urls = [s.strip() for s in r['sources'].split(' ; ') if s.strip().startswith('http')]
    if not urls:
        err.append(f'{rid} no http source')
    elif all('wikipedia.org' in u for u in urls):
        err.append(f'{rid} Wikipedia-only sources')

print(f'rows {len(rows)}  errors {len(err)}')
for e in err:
    print('  ERROR', e)

mc = collections.Counter(r['mechanism'] for r in rows)
m2c = collections.Counter(r['mechanism_2'] for r in rows if r['mechanism_2'])
fa = collections.Counter(f for r in rows for f in r['flow'].split(';'))
fp = collections.Counter(r['flow'].split(';')[0] for r in rows)
print('direction', dict(collections.Counter(r['direction'] for r in rows)))
print('cross-topic', sum(1 for r in rows if not (r['from_id'].startswith('S2-') and r['to_id'].startswith('S2-'))))
print('partial (待查證)', [r['id'] for r in rows if '待查證' in r['sources'] + r['note_zh']])
print('\n| flow | 含此流動 | 為主要流動 |\n|---|---|---|')
for f in FLOWS:
    print(f'| {f} | {fa[f]} | {fp[f]} |')

def table(title, key):
    mx = collections.Counter()
    for r in rows:
        m = key(r)
        if m:
            mx[(m, r['flow'].split(';')[0])] += 1
    tot = collections.Counter(m for (m, _), n in mx.items() for _ in range(n))
    print(f'\n{title}（列：機制；欄：主要流動）\n')
    print('| 機制 | ' + ' | '.join(FLOWS) + ' | 合計 |')
    print('|---' * (len(FLOWS) + 2) + '|')
    for m in sorted(MECH, key=lambda m: (-tot[m], MECH.index(m))):
        if tot[m]:
            print(f'| {m} | ' + ' | '.join(str(mx[(m, f)] or '') for f in FLOWS) + f' | {tot[m]} |')

table('主要機制 mechanism', lambda r: r['mechanism'])
table('次要機制 mechanism_2', lambda r: r['mechanism_2'])
sys.exit(1 if err else 0)
