import unittest

from apps.api.main import ExportPlanRequest, create_export_plan


class ExportHistoryContractTests(unittest.TestCase):
    def test_export_plan_has_stable_output_names(self):
        result = create_export_plan(ExportPlanRequest(profile="OUTMAX", concept="Launch", assets=["shoe.webp"]))
        self.assertEqual([item["fileName"] for item in result["outputs"]], [
            "outmax-wide.png", "outmax-standard.png", "outmax-vertical.png"
        ])


if __name__ == "__main__":
    unittest.main()
