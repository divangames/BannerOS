import unittest

from apps.api.main import CropRequest, ExportPlanRequest, create_export_plan, preview_crop


class BannerOSApiTests(unittest.TestCase):
    def test_hasl_export_plan_contains_all_formats(self):
        result = create_export_plan(ExportPlanRequest(profile="HASL", concept="Summer", assets=["shoe.png"]))
        self.assertEqual(result["status"], "planned")
        self.assertEqual(len(result["outputs"]), 3)
        self.assertEqual(result["outputs"][0]["fileName"], "hasl-square.png")

    def test_crop_keeps_square_target(self):
        result = preview_crop(CropRequest(sourceWidth=1200, sourceHeight=900, targetWidth=1080, targetHeight=1080))
        self.assertEqual((result["width"], result["height"]), (900, 900))
        self.assertEqual(result["x"], 150)

    def test_profiles_are_available(self):
        result = create_export_plan(ExportPlanRequest(profile="OUTMAX", concept="Outdoor", assets=["hero.webp"]))
        self.assertEqual([item["format"] for item in result["outputs"]], ["wide", "standard", "vertical"])


if __name__ == "__main__":
    unittest.main()
