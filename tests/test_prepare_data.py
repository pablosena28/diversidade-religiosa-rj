import csv
import tempfile
import unittest
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from prepare_data import build_dataset, normalized_shannon, slugify

class PrepareDataTests(unittest.TestCase):
    def test_shannon_zero_for_concentration(self):
        self.assertAlmostEqual(normalized_shannon([100, 0, 0]), 0.0)

    def test_shannon_one_for_equal_distribution(self):
        self.assertAlmostEqual(normalized_shannon([10, 10, 10]), 1.0)

    def test_slugify_removes_accents(self):
        self.assertEqual(slugify("Umbanda e Candomblé"), "umbanda-e-candomble")

    def test_dataset_computes_dominant_margin_and_total(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "sample.csv"
            with path.open("w", encoding="utf-8", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["codigo_ibge", "municipio", "categoria", "estimativa"])
                writer.writerow(["001", "Teste", "Grupo A", 60])
                writer.writerow(["001", "Teste", "Grupo B", 30])
                writer.writerow(["001", "Teste", "Grupo C", 10])
            record = build_dataset(path, demo=True)["municipios"][0]
            self.assertEqual(record["dominant"], "grupo-a")
            self.assertAlmostEqual(record["margin"], 0.30)
            self.assertEqual(record["total_classificado"], 100.0)
            self.assertTrue(0 < record["diversity_index"] < 1)

if __name__ == "__main__":
    unittest.main()
