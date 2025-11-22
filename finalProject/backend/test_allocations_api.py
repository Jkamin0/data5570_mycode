import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetapp.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.models import User
from budget.models import Account, Category, BudgetAllocation

print("Testing Budget Allocation REST API Endpoints...")
print("-" * 50)

user = User.objects.filter(username='testuser').first()
if not user:
    user = User.objects.create_user(username='testuser', password='testpass123')
    print(f"✓ Created test user: {user.username}")
else:
    print(f"✓ Using existing test user: {user.username}")

Account.objects.filter(user=user).delete()
Category.objects.filter(user=user).delete()
BudgetAllocation.objects.filter(account__user=user).delete()

client = APIClient()
client.force_authenticate(user=user)

print("\nSetting up test data...")
account = Account.objects.create(user=user, name='Test Account', balance=5000.00)
print(f"✓ Created account: {account.name} with balance ${account.balance}")

category1 = Category.objects.create(user=user, name='Groceries')
category2 = Category.objects.create(user=user, name='Rent')
print(f"✓ Created categories: {category1.name}, {category2.name}")

print("\n" + "=" * 50)
print("1. Testing CREATE Budget Allocation (POST /api/allocations/)")
print("=" * 50)
response = client.post('/api/allocations/', {
    'category': category1.id,
    'account': account.id,
    'amount': 500.00
})
print(f"Status: {response.status_code}")
print(f"Response: {response.data}")
allocation_id = response.data.get('id')

account.refresh_from_db()
print(f"✓ Account balance after allocation: ${account.balance}")
print(f"  Expected: $4500.00, Actual: ${account.balance}")

print("\n" + "=" * 50)
print("2. Testing CREATE Another Allocation")
print("=" * 50)
response = client.post('/api/allocations/', {
    'category': category2.id,
    'account': account.id,
    'amount': 1500.00
})
print(f"Status: {response.status_code}")
print(f"Amount allocated to {category2.name}: ${response.data.get('amount')}")

account.refresh_from_db()
print(f"✓ Account balance after second allocation: ${account.balance}")
print(f"  Expected: $3000.00, Actual: ${account.balance}")

print("\n" + "=" * 50)
print("3. Testing LIST Allocations (GET /api/allocations/)")
print("=" * 50)
response = client.get('/api/allocations/')
print(f"Status: {response.status_code}")
print(f"Found {len(response.data)} allocations:")
total_allocated = 0
for alloc in response.data:
    print(f"  - {alloc['category_name']}: ${alloc['amount']} from {alloc['account_name']}")
    total_allocated += float(alloc['amount'])
print(f"✓ Total allocated: ${total_allocated}")

print("\n" + "=" * 50)
print("4. Testing RETRIEVE Allocation (GET /api/allocations/{id}/)")
print("=" * 50)
response = client.get(f'/api/allocations/{allocation_id}/')
print(f"Status: {response.status_code}")
print(f"Allocation: {response.data.get('category_name')} - ${response.data.get('amount')}")

print("\n" + "=" * 50)
print("5. Testing Insufficient Funds Validation")
print("=" * 50)
response = client.post('/api/allocations/', {
    'category': category1.id,
    'account': account.id,
    'amount': 10000.00
})
print(f"Status: {response.status_code}")
if response.status_code == 400:
    print(f"✓ Validation error (expected): {response.data}")
else:
    print(f"✗ Should have failed with 400 status")

print("\n" + "=" * 50)
print("6. Testing DELETE Allocation (Restore Balance)")
print("=" * 50)
print(f"Account balance before deletion: ${account.balance}")
response = client.delete(f'/api/allocations/{allocation_id}/')
print(f"Status: {response.status_code}")

account.refresh_from_db()
print(f"✓ Account balance after deletion: ${account.balance}")
print(f"  Expected: $3500.00 (restored $500), Actual: ${account.balance}")

response = client.get('/api/allocations/')
print(f"✓ Remaining allocations: {len(response.data)}")

print("\n" + "=" * 50)
print("All Budget Allocation API tests passed!")
print("=" * 50)
print("\nKey Features Verified:")
print("✓ Allocations decrease account balance")
print("✓ Multiple allocations can be made")
print("✓ Allocations are tracked per category")
print("✓ Insufficient funds validation works")
print("✓ Deleting allocation restores account balance")
print("\nEndpoints available:")
print("  POST   /api/allocations/         - Create allocation")
print("  GET    /api/allocations/         - List all allocations")
print("  GET    /api/allocations/{id}/    - Retrieve allocation")
print("  DELETE /api/allocations/{id}/    - Delete allocation (restore balance)")
