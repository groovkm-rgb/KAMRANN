"""Rechnungen: Zerfall von Ra-226 in Marie Curies Notizbüchern."""
import json, pathlib

T_HALF = 1600.0      # Jahre, NNDC NuDat 3.0 (1600 ± 7)
BORN, DISCOVERY, NOW = 1867, 1898, 2026

rest = lambda years: 0.5 ** (years / T_HALF)
elapsed = NOW - DISCOVERY
rest_now = rest(elapsed)
decayed_now = 1 - rest_now
half_year = DISCOVERY + T_HALF
ten_half_year = DISCOVERY + 10 * T_HALF

assert elapsed == 128 and NOW - BORN == 159
assert abs(rest_now - 0.9461) < 2e-4, rest_now
assert 0.05 < decayed_now < 0.056
for start in range(1897, 1903):                       # "rund 5 %" robust über alle Heft-Jahre
    assert 0.050 < 1 - rest(NOW - start) < 0.055
assert half_year == 3498 and ten_half_year == 17898
assert abs(rest(10 * T_HALF) - 2 ** -10) < 1e-12        # ≈ 0,098 %

facts = dict(t_half=T_HALF, born=BORN, discovery=DISCOVERY, now=NOW, age=NOW - BORN,
             elapsed=elapsed, hwz_fraction=elapsed / T_HALF, rest_now_pct=rest_now * 100,
             decayed_now_pct=decayed_now * 100, half_year=int(half_year),
             ten_half_year=int(ten_half_year), rest_ten_pct=100 * 2 ** -10)
pathlib.Path(__file__).with_name("facts.json").write_text(json.dumps(facts, indent=2))
for k, v in facts.items(): print(f"{k:16} {v}")
