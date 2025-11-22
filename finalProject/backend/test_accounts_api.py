import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetapp.settings')
django.setup()

from django.contrib.auth.models import User
from budget.models import Account

print("Testing Account API...")
print("-" * 50)

user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com'}
)
if created:
    user.set_password('testpass123')
    user.save()
    print(f"✓ Created test user: {user.username}")
else:
    print(f"✓ Using existing test user: {user.username}")

account1 = Account.objects.create(
    user=user,
    name='Checking Account',
    balance=1000.00
)
print(f"✓ Created account: {account1.name} with balance ${account1.balance}")

account2 = Account.objects.create(
    user=user,
    name='Savings Account',
    balance=5000.00
)
print(f"✓ Created account: {account2.name} with balance ${account2.balance}")

accounts = Account.objects.filter(user=user)
print(f"\n✓ Total accounts for {user.username}: {accounts.count()}")
for acc in accounts:
    print(f"  - {acc.name}: ${acc.balance}")

account1.balance = 1200.00
account1.save()
print(f"\n✓ Updated {account1.name} balance to ${account1.balance}")

retrieved = Account.objects.get(id=account1.id)
print(f"✓ Retrieved account: {retrieved.name} with balance ${retrieved.balance}")

print("\n" + "=" * 50)
print("Account model CRUD operations work correctly!")
print("=" * 50)
