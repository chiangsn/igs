"""Validate S3 data/links.csv against link-typology.md (2nd edition, 2026-11-27).

Run from anywhere:  python data/scripts/validate_links.py
Checks: header; ids exist in S1-S4 timelines; at least one S3 end; flow / mechanism / mechanism_2 / direction
vocabulary; mechanism_2 != mechanism; no same-country link (identical country sets, neither end Global);
no both-Global link; no duplicate id or pair; every row has note_zh and sources.
Also prints the summary tables used in data/README.md.
"""
import csv, sys, collections, os
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
TOPICS = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FOLD = {'S1': 'S1-global-env-justice', 'S2': 'S2-war', 'S3': 'S3-technology-history',
        'S4': 'S4-sustainable-development-governance'}
COLS = ['id', 'from_id', 'to_id', 'flow', 'mechanism', 'mechanism_2', 'direction', 'note_zh', 'sources']
FLOWS = ['people', 'capital', 'technology', 'material', 'media', 'ideas']
MECH = ['diffusion', 'burden_shifting', 'imposition', 'template', 'translation', 'contestation', 'evasion',
        'commodity_chain', 'boomerang', 'scale_up', 'colonial', 'geopolitical', 'litigation', 'memory']

ev = {}
for k, f in FOLD.items():
    p = os.path.join(TOPICS, f, 'data', 'timeline.csv')
    if os.path.exists(p):
        for r in csv.DictReader(open(p, encoding='utf-8')):
            ev[r['id']] = r

rows = list(csv.DictReader(open(os.path.join(TOPICS, FOLD['S3'], 'data', 'links.csv'), encoding='utf-8')))
err = []
if not rows or list(rows[0].keys()) != COLS:
    err.append('header must be: ' + ','.join(COLS))
ids = [r['id'] for r in rows]
for i, c in collections.Counter(ids).items():
    if c > 1: err.append(f'duplicate id {i}')
pairs = {}
for r in rows:
    i, a, b = r['id'], r['from_id'], r['to_id']
    if not i.startswith('S3-L'): err.append(f'{i} id must start with S3-L')
    for x in (a, b):
        if x not in ev: err.append(f'{i} unknown event id {x}')
    if not (a.startswith('S3-') or b.startswith('S3-')): err.append(f'{i} has no S3 end')
    if a == b: err.append(f'{i} self link')
    if a in ev and b in ev:
        A, B = ev[a], ev[b]
        ca = {c.strip() for c in A['country'].split(';') if c.strip()}
        cb = {c.strip() for c in B['country'].split(';') if c.strip()}
        ga, gb = A['region'] == 'Global', B['region'] == 'Global'
        if ga and gb: err.append(f'{i} both ends Global ({a}, {b})')
        elif ca == cb and not (ga or gb): err.append(f'{i} same country {sorted(ca)} ({a}, {b})')
    key = tuple(sorted((a, b)))
    if key in pairs: err.append(f'{i} duplicate pair with {pairs[key]}')
    pairs[key] = i
    fl = [f.strip() for f in r['flow'].split(';') if f.strip()]
    if not fl: err.append(f'{i} empty flow')
    for f in fl:
        if f not in FLOWS: err.append(f'{i} bad flow {f}')
    if len(set(fl)) != len(fl): err.append(f'{i} repeated flow')
    if r['mechanism'] not in MECH: err.append(f"{i} bad mechanism {r['mechanism']}")
    m2 = r['mechanism_2'].strip()
    if m2:
        if m2 not in MECH: err.append(f'{i} bad mechanism_2 {m2}')
        if m2 == r['mechanism']: err.append(f'{i} mechanism_2 equals mechanism')
    if r['direction'] not in ('forward', 'mutual'): err.append(f"{i} bad direction {r['direction']}")
    if not r['note_zh'].strip(): err.append(f'{i} no note_zh')
    src = [s.strip() for s in r['sources'].split(' ; ') if s.strip()]
    if not src: err.append(f'{i} no sources')
    elif all('wikipedia.org' in s for s in src if s.startswith('http')) and any(s.startswith('http') for s in src):
        err.append(f'{i} only Wikipedia sources')

print('rows', len(rows), '| errors', len(err))
for e in err: print('  ERROR', e)

mc = collections.Counter(r['mechanism'] for r in rows)
m2c = collections.Counter(r['mechanism_2'] for r in rows if r['mechanism_2'].strip())
fa = collections.Counter(f for r in rows for f in r['flow'].split(';') if f)
fp = collections.Counter(r['flow'].split(';')[0] for r in rows)
print('mechanism', dict(mc.most_common()))
print('mechanism_2', dict(m2c.most_common()))
print('flow (any)', dict(fa.most_common()))
print('flow (primary)', dict(fp.most_common()))
print('direction', dict(collections.Counter(r['direction'] for r in rows)))
print('cross-topic', sum(1 for r in rows if not (r['from_id'].startswith('S3-') and r['to_id'].startswith('S3-'))))
print('待查證', [r['id'] for r in rows if '待查證' in r['sources'] + r['note_zh']])

def table(counter_fn, title):
    print(f'\n{title}')
    print('| mechanism | ' + ' | '.join(FLOWS) + ' | 合計 |')
    print('|---' * (len(FLOWS) + 2) + '|')
    tot = collections.Counter()
    for m in MECH:
        sub = [r for r in rows if counter_fn(r) == m]
        if not sub: continue
        c = collections.Counter(f for r in sub for f in r['flow'].split(';') if f)
        tot += c
        print(f'| {m} | ' + ' | '.join(str(c[f] or '') for f in FLOWS) + f' | {len(sub)} |')
    print('| 合計（flow 可多值） | ' + ' | '.join(str(tot[f]) for f in FLOWS) + f' | {sum(1 for r in rows if counter_fn(r))} |')

table(lambda r: r['mechanism'], 'flow x mechanism (primary mechanism; flow counts any position)')
table(lambda r: r['mechanism_2'].strip(), 'flow x mechanism_2 (secondary mechanism)')
sys.exit(1 if err else 0)
