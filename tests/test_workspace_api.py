import unittest

from fastapi import HTTPException

from apps.api.main import list_workspace_assets


class WorkspaceApiTests(unittest.TestCase):
    def test_missing_workspace_returns_not_found(self):
        with self.assertRaises(HTTPException) as context:
            list_workspace_assets("missing-workspace")
        self.assertEqual(context.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
