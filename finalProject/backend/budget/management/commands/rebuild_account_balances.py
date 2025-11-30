from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db.models import Sum
from budget.models import Account, BudgetAllocation


class Command(BaseCommand):
    help = (
        "Rebuild account balances by adding back all budget allocation amounts. "
        "Use this once after switching to the new allocation logic where allocations "
        "no longer change cash balances."
    )

    def handle(self, *args, **options):
        accounts = Account.objects.all()
        if not accounts.exists():
            self.stdout.write(self.style.WARNING("No accounts found. Nothing to rebuild."))
            return

        for account in accounts:
            allocation_sum = (
                BudgetAllocation.objects.filter(account=account).aggregate(total=Sum("amount"))[
                    "total"
                ]
                or Decimal("0")
            )
            original_balance = account.balance
            account.balance = original_balance + allocation_sum
            account.save(update_fields=["balance"])

            self.stdout.write(
                f"{account.name}: +{allocation_sum} -> {account.balance}"
            )

        self.stdout.write(self.style.SUCCESS("Account balances rebuilt."))
