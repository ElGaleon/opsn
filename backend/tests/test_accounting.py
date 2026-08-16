from datetime import date
from decimal import Decimal
from unittest import TestCase

from app.services.accounting import add_months, intervals_overlap, money, month_end


class AccountingTest(TestCase):
    def test_money_rounds_half_up(self):
        self.assertEqual(money(Decimal("10.005")), Decimal("10.01"))

    def test_month_helpers(self):
        self.assertEqual(add_months(date(2026, 12, 15), 2), date(2027, 2, 1))
        self.assertEqual(month_end(date(2026, 2, 10)), date(2026, 2, 28))

    def test_intervals_overlap_open_ended(self):
        self.assertTrue(
            intervals_overlap(date(2026, 1, 1), None, date(2027, 1, 1), None)
        )
        self.assertFalse(
            intervals_overlap(
                date(2026, 1, 1),
                date(2026, 1, 31),
                date(2026, 2, 1),
                None,
            )
        )
