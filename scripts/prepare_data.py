#!/usr/bin/env python3
"""Converte CSV longo de religião por município em JSON para o front-end."""
from __future__ import annotations
import argparse, csv, json, math, re, unicodedata
from collections import defaultdict
from pathlib import Path

REQUIRED = {"codigo_ibge", "municipio", "categoria", "estimativa"}

def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = "".join(c for c in normalized if not unicodedata.combining(c))
    return re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text.lower()).strip("-") or "categoria"

def normalized_shannon(values: list[float]) -> float:
    total, k = sum(values), len(values)
    if total <= 0 or k <= 1:
        return 0.0
    entropy = -sum((v / total) * math.log(v / total) for v in values if v > 0)
    return entropy / math.log(k)

def parse_number(raw: str, line: int) -> float:
    text = raw.strip().replace(".", "").replace(",", ".")
    try:
        value = float(text)
    except ValueError as exc:
        raise ValueError(f"Linha {line}: estimativa inválida: {raw!r}") from exc
    if value < 0:
        raise ValueError(f"Linha {line}: estimativa negativa.")
    return value

def build_dataset(source: Path, *, demo=False, source_label="IBGE — Censo Demográfico 2022", source_url="") -> dict:
    municipalities, categories = {}, []
    seen = set()
    with source.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError("CSV sem cabeçalho.")
        missing = REQUIRED - set(reader.fieldnames)
        if missing:
            raise ValueError("Colunas ausentes: " + ", ".join(sorted(missing)))
        for line, row in enumerate(reader, start=2):
            code, name, category = (row[k].strip() for k in ("codigo_ibge", "municipio", "categoria"))
            value = parse_number(row["estimativa"], line)
            if not code or not name or not category:
                raise ValueError(f"Linha {line}: campos obrigatórios vazios.")
            if category not in seen:
                seen.add(category); categories.append(category)
            item = municipalities.setdefault(code, {"codigo_ibge": code, "municipio": name, "values": defaultdict(float)})
            if item["municipio"] != name:
                raise ValueError(f"Código {code} associado a nomes diferentes.")
            item["values"][category] += value
    if not municipalities:
        raise ValueError("CSV sem registros.")

    ids, used = {}, set()
    for label in categories:
        base, candidate, n = slugify(label), slugify(label), 2
        while candidate in used:
            candidate = f"{base}-{n}"; n += 1
        used.add(candidate); ids[label] = candidate
    groups = [{"id": ids[label], "label": label} for label in categories]

    records = []
    for item in municipalities.values():
        counts = {ids[label]: round(item["values"].get(label, 0.0), 4) for label in categories}
        values = [counts[g["id"]] for g in groups]
        total = sum(values)
        shares = {g["id"]: (counts[g["id"]] / total if total else 0.0) for g in groups}
        ordered = sorted(shares.items(), key=lambda x: x[1], reverse=True)
        first = ordered[0][1] if ordered else 0.0
        second = ordered[1][1] if len(ordered) > 1 else 0.0
        records.append({
            "codigo_ibge": item["codigo_ibge"], "municipio": item["municipio"],
            "total_classificado": round(total, 4), "counts": counts,
            "shares": {k: round(v, 8) for k, v in shares.items()},
            "dominant": ordered[0][0] if ordered else None,
            "margin": round(first - second, 8),
            "diversity_index": round(normalized_shannon(values), 8),
        })
    records.sort(key=lambda x: x["municipio"])
    return {
        "metadata": {"title": "Diversidade Religiosa do Rio de Janeiro", "year": 2022,
                     "geography": "Rio de Janeiro", "demo": demo, "source_label": source_label,
                     "source_url": source_url, "method": "Shannon normalizado por ln(k)"},
        "groups": groups, "municipios": records,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_csv", type=Path); parser.add_argument("output_json", type=Path)
    parser.add_argument("--demo", action="store_true")
    parser.add_argument("--source-label", default="IBGE — Censo Demográfico 2022")
    parser.add_argument("--source-url", default="")
    args = parser.parse_args()
    dataset = build_dataset(args.input_csv, demo=args.demo, source_label=args.source_label, source_url=args.source_url)
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(dataset, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Gerado: {args.output_json} ({len(dataset['municipios'])} municípios)")

if __name__ == "__main__":
    main()
