"""Smoke tests for Flask-rendered static asset paths."""

from __future__ import annotations

import unittest

from app import create_app


class StaticAssetPathTests(unittest.TestCase):
    """Verify templates and Flask static serving agree on asset URLs."""

    def setUp(self) -> None:
        self.app = create_app()
        self.client = self.app.test_client()

    def test_index_uses_flask_static_urls(self) -> None:
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)
        self.assertIn('href="/assets/css/styles.css"', html)
        self.assertIn('src="/assets/js/calculator.js"', html)

    def test_static_assets_are_served_with_expected_content_types(self) -> None:
        css_response = self.client.get("/assets/css/styles.css")
        js_response = self.client.get("/assets/js/calculator.js")

        css_response.get_data()
        js_response.get_data()
        css_response.close()
        js_response.close()

        self.assertEqual(css_response.status_code, 200)
        self.assertEqual(js_response.status_code, 200)
        self.assertTrue(css_response.content_type.startswith("text/css"))
        self.assertIn(
            js_response.mimetype,
            {"text/javascript", "application/javascript"},
        )


if __name__ == "__main__":
    unittest.main()
