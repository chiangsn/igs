"""Validate S4 data/links.csv against link-typology.md (v2) and CLAUDE.md.

Usage (from the S4 folder):  python data/scripts/validate_links.py [--table]
Checks: every id exists (S1–S4 timelines); vocab (flow, mechanism, mechanism_2, direction);
mechanism_2 != mechanism; no same-country link; no Global–Global link; no duplicate pair;
id format and uniqueness; every row has note_zh and a non-Wikipedia http source.
--table prints the flow x mechanism tables (primary mechanism and mechanism_2 separately).
"""
import csv, sys, collections, re
sys.stdout.reconfigure(encoding='utf-8')
T = 'C:/research/IGS_course_development/topics/'
FOLD = {'S1': 'S1-global-env-justice', 'S2': 'S2-war', 'S3': 'S3-technology-history',
        'S4': 'S4-sustainable-development-governance'}
HEADER = ['id', 'from_id', 'to_id', 'flow', 'mechanism', 'mechanism_2', 'direction', 'note_zh', 'sources']
FLOWS = ['people', 'capital', 'technology', 'material', 'media', 'ideas']
MECH = ['diffusion', 'burden_shifting', 'imposition', 'template', 'translation', 'contestation', 'evasion',
        'commodity_chain', 'boomerang', 'scale_up', 'colonial', 'geopolitical', 'litigation', 'memory']

ev = {}
for k, f in FOLD.items():
    try:
        for r in csv.DictReader(open(T + f + '/data/timeline.csv', encoding='utf-8')):
            ev[r['id']] = r
    except FileNotFoundError:
        pass

rd = csv.DictReader(open(T + FOLD['S4'] + '/data/links.csv', encoding='utf-8'))
rows = list(rd)
err = []
if rd.fieldnames != HEADER:
    err.append(f'header {rd.fieldnames} != {HEADER}')
ids = [r['id'] for r in rows]
for i in ids:
    if not re.fullmatch(r'S4-L\d{3}', i):
        err.append(f'bad id format {i}')
for i, c in collections.Counter(ids).items():
    if c > 1:
        err.append(f'duplicate id {i}')

# Same event recorded in two topics (cross-reference in linked_ids, not a link).
SAME_EVENT = {('S1-T242', 'S4-T067'), ('S1-T243', 'S4-T062'), ('S1-T244', 'S4-T105'),
              ('S1-T249', 'S4-T115'), ('S1-T249', 'S4-T119'), ('S1-T267', 'S4-T172'), ('S1-T021', 'S4-T158')}
countries = lambda e: {c.strip() for c in e['country'].split(';') if c.strip()}
pairs = {}
for r in rows:
    a, b, rid = r['from_id'], r['to_id'], r['id']
    for x in (a, b):
        if x not in ev:
            err.append(f'{rid} unknown event id {x}')
    if a == b:
        err.append(f'{rid} self link')
    if a in ev and b in ev:
        ga, gb = ev[a]['region'] == 'Global', ev[b]['region'] == 'Global'
        if ga and gb:
            err.append(f'{rid} both ends Global ({a}, {b})')
        if not ga and not gb and countries(ev[a]) == countries(ev[b]):
            err.append(f'{rid} same country ({a}, {b}: {ev[a]["country"]})')
    if not (a.startswith('S4-') or b.startswith('S4-')):
        err.append(f'{rid} no S4 end')
    key = tuple(sorted((a, b)))
    if key in SAME_EVENT:
        err.append(f'{rid} same event in two topics ({a}, {b})')
    if key in pairs:
        err.append(f'{rid} duplicate pair with {pairs[key]}')
    pairs[key] = rid
    fl = [f.strip() for f in r['flow'].split(';')]
    if not fl or any(f not in FLOWS for f in fl) or len(set(fl)) != len(fl):
        err.append(f'{rid} bad flow "{r["flow"]}"')
    if r['mechanism'] not in MECH:
        err.append(f'{rid} bad mechanism "{r["mechanism"]}"')
    if r['mechanism_2']:
        if r['mechanism_2'] not in MECH:
            err.append(f'{rid} bad mechanism_2 "{r["mechanism_2"]}"')
        if r['mechanism_2'] == r['mechanism']:
            err.append(f'{rid} mechanism_2 equals mechanism')
    if r['direction'] not in ('forward', 'mutual'):
        err.append(f'{rid} bad direction "{r["direction"]}"')
    if not r['note_zh'].strip():
        err.append(f'{rid} no note_zh')
    srcs = [s.strip() for s in r['sources'].split(' ; ') if s.strip()]
    if not any(s.startswith('http') and 'wikipedia.org' not in s for s in srcs):
        err.append(f'{rid} no non-Wikipedia http source')

print(f'rows {len(rows)}  errors {len(err)}')
for e in err:
    print('  ERROR', e)

if '--table' in sys.argv:
    mc = collections.Counter(r['mechanism'] for r in rows)
    m2 = collections.Counter(r['mechanism_2'] for r in rows if r['mechanism_2'])
    print('\nmechanism', dict(mc.most_common()))
    print('mechanism_2', dict(m2.most_common()))
    print('flow (primary)', dict(collections.Counter(r['flow'].split(';')[0] for r in rows).most_common()))
    print('flow (any)', dict(collections.Counter(f for r in rows for f in r['flow'].split(';')).most_common()))
    print('direction', dict(collections.Counter(r['direction'] for r in rows)))
    def kind(r):
        g = [ev[x]['region'] == 'Global' for x in (r['from_id'], r['to_id'])]
        if g[0]: return 'Global → 地方'
        if g[1]: return '地方 → Global'
        return '國家／區域之間'
    print('ends', dict(collections.Counter(kind(r) for r in rows)))
    print('cross-topic', sum(1 for r in rows if not (r['from_id'].startswith('S4-') and r['to_id'].startswith('S4-'))))
    print('待查證', [r['id'] for r in rows if '待查證' in r['sources'] or '待查證' in r['note_zh']])
    for title, key in (('主要機制（mechanism）', 'mechanism'), ('次要機制（mechanism_2）', 'mechanism_2')):
        mx = collections.Counter((r[key], f) for r in rows if r[key] for f in r['flow'].split(';'))
        tot = collections.Counter(r[key] for r in rows if r[key])
        print(f'\n{title} × flow（flow 可多值，依任一 flow 計）')
        print('| 機制 | ' + ' | '.join(FLOWS) + ' | 條數 |')
        print('|---' * (len(FLOWS) + 2) + '|')
        for m in sorted(tot, key=lambda m: -tot[m]):
            print(f'| {m} | ' + ' | '.join(str(mx[(m, f)] or '') for f in FLOWS) + f' | {tot[m]} |')
