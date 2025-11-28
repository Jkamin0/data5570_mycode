import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetapp.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from budget.models import Account, Category, Transaction

print("Testing User Data Isolation...")
print("=" * 60)

# Create two users
user1 = User.objects.filter(username='alice').first()
if not user1:
    user1 = User.objects.create_user(username='alice', email='alice@test.com', password='testpass123')
else:
    user1.set_password('testpass123')
    user1.save()

user2 = User.objects.filter(username='bob').first()
if not user2:
    user2 = User.objects.create_user(username='bob', email='bob@test.com', password='testpass123')
else:
    user2.set_password('testpass123')
    user2.save()

print(f"✓ Created/Updated User 1: {user1.username}")
print(f"✓ Created/Updated User 2: {user2.username}")

# Clean up existing data
Account.objects.filter(user__in=[user1, user2]).delete()
Category.objects.filter(user__in=[user1, user2]).delete()
Transaction.objects.filter(user__in=[user1, user2]).delete()

# User 1 creates some data
alice_account = Account.objects.create(user=user1, name="Alice's Checking", balance=1000.00)
alice_category = Category.objects.create(user=user1, name="Alice's Groceries")
alice_transaction = Transaction.objects.create(
    user=user1,
    account=alice_account,
    category=alice_category,
    transaction_type='expense',
    amount=50.00,
    description="Alice's purchase"
)

# User 2 creates some data
bob_account = Account.objects.create(user=user2, name="Bob's Savings", balance=2000.00)
bob_category = Category.objects.create(user=user2, name="Bob's Entertainment")
bob_transaction = Transaction.objects.create(
    user=user2,
    account=bob_account,
    category=bob_category,
    transaction_type='expense',
    amount=75.00,
    description="Bob's purchase"
)

print(f"\n✓ Created data for Alice: 1 account, 1 category, 1 transaction")
print(f"✓ Created data for Bob: 1 account, 1 category, 1 transaction")

# Create API clients with JWT tokens
client_alice = APIClient()
refresh_alice = RefreshToken.for_user(user1)
client_alice.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh_alice.access_token)}')

client_bob = APIClient()
refresh_bob = RefreshToken.for_user(user2)
client_bob.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh_bob.access_token)}')

print("\n" + "=" * 60)
print("TEST 1: Users can only see their own accounts")
print("=" * 60)

alice_accounts = client_alice.get('/api/accounts/')
bob_accounts = client_bob.get('/api/accounts/')

print(f"\nAlice queries accounts:")
print(f"  Status: {alice_accounts.status_code}")
print(f"  Count: {len(alice_accounts.data)}")
print(f"  Accounts: {[acc['name'] for acc in alice_accounts.data]}")
assert len(alice_accounts.data) == 1, "Alice should only see 1 account"
assert alice_accounts.data[0]['name'] == "Alice's Checking", "Alice should see her own account"

print(f"\nBob queries accounts:")
print(f"  Status: {bob_accounts.status_code}")
print(f"  Count: {len(bob_accounts.data)}")
print(f"  Accounts: {[acc['name'] for acc in bob_accounts.data]}")
assert len(bob_accounts.data) == 1, "Bob should only see 1 account"
assert bob_accounts.data[0]['name'] == "Bob's Savings", "Bob should see his own account"

print("\n✅ PASS: Users can only see their own accounts")

print("\n" + "=" * 60)
print("TEST 2: Users can only see their own categories")
print("=" * 60)

alice_categories = client_alice.get('/api/categories/')
bob_categories = client_bob.get('/api/categories/')

print(f"\nAlice queries categories:")
print(f"  Status: {alice_categories.status_code}")
print(f"  Count: {len(alice_categories.data)}")
print(f"  Categories: {[cat['name'] for cat in alice_categories.data]}")
assert len(alice_categories.data) == 1, "Alice should only see 1 category"
assert alice_categories.data[0]['name'] == "Alice's Groceries", "Alice should see her own category"

print(f"\nBob queries categories:")
print(f"  Status: {bob_categories.status_code}")
print(f"  Count: {len(bob_categories.data)}")
print(f"  Categories: {[cat['name'] for cat in bob_categories.data]}")
assert len(bob_categories.data) == 1, "Bob should only see 1 category"
assert bob_categories.data[0]['name'] == "Bob's Entertainment", "Bob should see his own category"

print("\n✅ PASS: Users can only see their own categories")

print("\n" + "=" * 60)
print("TEST 3: Users can only see their own transactions")
print("=" * 60)

alice_transactions = client_alice.get('/api/transactions/')
bob_transactions = client_bob.get('/api/transactions/')

print(f"\nAlice queries transactions:")
print(f"  Status: {alice_transactions.status_code}")
print(f"  Count: {len(alice_transactions.data)}")
print(f"  Transactions: {[tx['description'] for tx in alice_transactions.data]}")
assert len(alice_transactions.data) == 1, "Alice should only see 1 transaction"
assert alice_transactions.data[0]['description'] == "Alice's purchase", "Alice should see her own transaction"

print(f"\nBob queries transactions:")
print(f"  Status: {bob_transactions.status_code}")
print(f"  Count: {len(bob_transactions.data)}")
print(f"  Transactions: {[tx['description'] for tx in bob_transactions.data]}")
assert len(bob_transactions.data) == 1, "Bob should only see 1 transaction"
assert bob_transactions.data[0]['description'] == "Bob's purchase", "Bob should see his own transaction"

print("\n✅ PASS: Users can only see their own transactions")

print("\n" + "=" * 60)
print("TEST 4: Users cannot access other users' resources by ID")
print("=" * 60)

# Try to have Alice access Bob's account by ID
alice_tries_bob_account = client_alice.get(f'/api/accounts/{bob_account.id}/')
print(f"\nAlice tries to access Bob's account (ID {bob_account.id}):")
print(f"  Status: {alice_tries_bob_account.status_code}")
assert alice_tries_bob_account.status_code == 404, "Alice should get 404 for Bob's account"

# Try to have Bob access Alice's category by ID
bob_tries_alice_category = client_bob.get(f'/api/categories/{alice_category.id}/')
print(f"\nBob tries to access Alice's category (ID {alice_category.id}):")
print(f"  Status: {bob_tries_alice_category.status_code}")
assert bob_tries_alice_category.status_code == 404, "Bob should get 404 for Alice's category"

print("\n✅ PASS: Users cannot access other users' resources by ID")

print("\n" + "=" * 60)
print("ALL TESTS PASSED!")
print("=" * 60)
print("\n✅ User data isolation is working correctly!")
print("✅ Users can ONLY see and access their own data")
print("✅ Cross-user access is properly blocked")
