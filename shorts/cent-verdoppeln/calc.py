"""Rechnungen: 1 Cent, 30 Tage lang täglich verdoppelt (Tag 1 = 1 Cent). Alles exakt in Cent."""
import json, pathlib

DAYS = 30
MILLION_EUR = 1_000_000
cents = [2 ** (n - 1) for n in range(1, DAYS + 1)]       # Tag n → Cent
eur = [c / 100 for c in cents]

day30_cent = cents[-1]
first_euro_day = next(n for n, c in enumerate(cents, 1) if c >= 100)
first_million_day = next(n for n, c in enumerate(cents, 1) if c >= MILLION_EUR * 100)
total_cent = sum(cents)

# Plausibilität (Literatur: 5.368.709,12; Summe 10.737.418,23)
assert day30_cent == 2 ** 29 == 536_870_912
assert eur[-1] == 5_368_709.12
assert total_cent == 2 ** 30 - 1 == 1_073_741_823
assert eur[13] == 81.92 and eur[20] == 10_485.76 and eur[26] == 671_088.64
assert first_euro_day == 8 and first_million_day == 28
assert cents[-2] * 2 == cents[-1]          # Hälfte des Endbetrags kommt am letzten Tag

facts = dict(
    days=DAYS, million=MILLION_EUR,
    eur_by_day=eur,                    # Index 0 = Tag 1
    day30_eur=eur[-1], day30_cent=day30_cent, exponent=DAYS - 1,
    day7_eur=eur[6], day14_eur=eur[13], day21_eur=eur[20], day27_eur=eur[26], day28_eur=eur[27],
    first_euro_day=first_euro_day, first_million_day=first_million_day,
    ratio_to_million=eur[-1] / MILLION_EUR,
    last_day_gain_eur=eur[-1] - eur[-2],
    total_all_days_eur=total_cent / 100,
)
pathlib.Path(__file__).with_name("facts.json").write_text(json.dumps(facts, indent=2))
for k, v in facts.items():
    if k != "eur_by_day": print(f"{k:20} {v}")
