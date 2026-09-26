import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent
levels = json.loads((root / '汽車華容道題庫/資料/levels.json').read_text())
out = root / 'data'
out.mkdir(exist_ok=True)
size = 1000
for start in range(0, len(levels), size):
    (out / f'{start // size}.json').write_text(json.dumps([r[:2] for r in levels[start:start+size]], separators=(',', ':')))
groups = [('暖身', 1, 5), ('入門', 6, 10), ('進階', 11, 15), ('挑戰', 16, 20), ('專家', 21, 30), ('大師', 31, 100)]
bands = []
for name, low, high in groups:
    ids = [i+1 for i,r in enumerate(levels) if low <= r[0] <= high]
    if ids: bands.append(dict(name=name, min=low, max=min(high, max(r[0] for r in levels)), start=ids[0], end=ids[-1]))
(out / 'manifest.json').write_text(json.dumps(dict(total=len(levels), chunkSize=size, bands=bands), ensure_ascii=False, separators=(',', ':')))
print(json.dumps(bands, ensure_ascii=False))
