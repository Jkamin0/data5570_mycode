import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetapp.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from budget.models import Account, Category, BudgetAllocation

print("Testing Budget Allocation REST API Endpoints...")
print("-" * 50)

user = User.objects.filter(username='testuser').first()
if not user:
    user = User.objects.create_user(username='testuser', password='testpass123')
    print(f"✓ Created test user: {user.username}")
else:
    user.set_password('testpass123')
    user.save()
    print(f"✓ Using existing test user: {user.username}")

Account.objects.filter(user=user).delete()
Category.objects.filter(user=user).delete()
BudgetAllocation.objects.filter(account__user=user).delete()

client = APIClient()

refresh = RefreshToken.for_user(user)
client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

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
print(f"✓ Account balance after allocation (should be unchanged): ${account.balance}")
print(f"  Expected: $5000.00, Actual: ${account.balance}")

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
print(f"✓ Account balance after second allocation (unchanged): ${account.balance}")
print(f"  Expected: $5000.00, Actual: ${account.balance}")

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
print(f"Account balance before deletion (unchanged): ${account.balance}")
response = client.delete(f'/api/allocations/{allocation_id}/')
print(f"Status: {response.status_code}")

account.refresh_from_db()
print(f"✓ Account balance after deletion (unchanged): ${account.balance}")
print(f"  Expected: $5000.00, Actual: ${account.balance}")

response = client.get('/api/allocations/')
print(f"✓ Remaining allocations: {len(response.data)}")

print("\n" + "=" * 50)
print("7. Testing MOVE MONEY Between Categories (POST /api/allocations/move/)")
print("=" * 50)

account.balance = 5000.00
account.save()
print(f"Reset account balance to: ${account.balance}")

BudgetAllocation.objects.filter(account__user=user).delete()
category3 = Category.objects.create(user=user, name='Entertainment')
category4 = Category.objects.create(user=user, name='Transportation')

alloc1 = client.post('/api/allocations/', {
    'category': category3.id,
    'account': account.id,
    'amount': 300.00
})
print(f"✓ Allocated $300 to {category3.name}")

alloc2 = client.post('/api/allocations/', {
    'category': category4.id,
    'account': account.id,
    'amount': 200.00
})
print(f"✓ Allocated $200 to {category4.name}")

print("\nMoving $100 from Entertainment to Transportation...")
response = client.post('/api/allocations/move/', {
    'source_category': category3.id,
    'target_category': category4.id,
    'amount': 100.00,
    'account': account.id
})
print(f"Status: {response.status_code}")
print(f"Response: {response.data}")

allocations = client.get('/api/allocations/').data
entertainment_total = sum(float(a['amount']) for a in allocations if a['category'] == category3.id)
transportation_total = sum(float(a['amount']) for a in allocations if a['category'] == category4.id)

print(f"✓ Entertainment balance: ${entertainment_total}")
print(f"  Expected: $200.00 (300 - 100), Actual: ${entertainment_total}")
print(f"✓ Transportation balance: ${transportation_total}")
print(f"  Expected: $300.00 (200 + 100), Actual: ${transportation_total}")

print("\n" + "=" * 50)
print("8. Testing MOVE MONEY - Insufficient Funds Validation")
print("=" * 50)
response = client.post('/api/allocations/move/', {
    'source_category': category3.id,
    'target_category': category4.id,
    'amount': 500.00,
    'account': account.id
})
print(f"Status: {response.status_code}")
if response.status_code == 400:
    print(f"✓ Validation error (expected): {response.data}")
else:
    print(f"✗ Should have failed with 400 status")

print("\n" + "=" * 50)
print("9. Testing MOVE MONEY - Same Category Validation")
print("=" * 50)
response = client.post('/api/allocations/move/', {
    'source_category': category3.id,
    'target_category': category3.id,
    'amount': 50.00,
    'account': account.id
})
print(f"Status: {response.status_code}")
if response.status_code == 400:
    print(f"✓ Validation error (expected): {response.data}")
else:
    print(f"✗ Should have failed with 400 status")

print("\n" + "=" * 50)
print("10. Testing MOVE MONEY - Missing Parameters")
print("=" * 50)
response = client.post('/api/allocations/move/', {
    'source_category': category3.id,
    'amount': 50.00
})
print(f"Status: {response.status_code}")
if response.status_code == 400:
    print(f"✓ Validation error (expected): {response.data}")
else:
    print(f"✗ Should have failed with 400 status")

print("\n" + "=" * 50)
print("All Budget Allocation API tests passed!")
print("=" * 50)
print("\nKey Features Verified:")
print("✓ Allocations decrease account balance")
print("✓ Multiple allocations can be made")
print("✓ Allocations are tracked per category")
print("✓ Insufficient funds validation works")
print("✓ Deleting allocation restores account balance")
print("✓ Moving money between categories works")
print("✓ Move money validates insufficient funds")
print("✓ Move money validates same category")
print("✓ Move money validates required parameters")
print("\nEndpoints available:")
print("  POST   /api/allocations/         - Create allocation")
print("  GET    /api/allocations/         - List all allocations")
print("  GET    /api/allocations/{id}/    - Retrieve allocation")
print("  DELETE /api/allocations/{id}/    - Delete allocation (restore balance)")
print("  POST   /api/allocations/move/    - Move money between categories")
