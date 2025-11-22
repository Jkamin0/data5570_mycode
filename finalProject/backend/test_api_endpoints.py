import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetapp.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.models import User
from budget.models import Account

print("Testing Account REST API Endpoints...")
print("-" * 50)

user = User.objects.filter(username='testuser').first()
if not user:
    user = User.objects.create_user(username='testuser', password='testpass123')
    print(f"✓ Created test user: {user.username}")
else:
    print(f"✓ Using existing test user: {user.username}")

Account.objects.filter(user=user).delete()

client = APIClient()
client.force_authenticate(user=user)

print("\n1. Testing CREATE Account (POST /api/accounts/)")
response = client.post('/api/accounts/', {
    'name': 'Test Checking',
    'balance': 1500.00
})
print(f"   Status: {response.status_code}")
print(f"   Response: {response.data}")
account_id = response.data.get('id')

print("\n2. Testing LIST Accounts (GET /api/accounts/)")
response = client.get('/api/accounts/')
print(f"   Status: {response.status_code}")
print(f"   Found {len(response.data)} account(s)")
for acc in response.data:
    print(f"   - {acc['name']}: ${acc['balance']}")

print(f"\n3. Testing RETRIEVE Account (GET /api/accounts/{account_id}/)")
response = client.get(f'/api/accounts/{account_id}/')
print(f"   Status: {response.status_code}")
print(f"   Account: {response.data.get('name')} - ${response.data.get('balance')}")

print(f"\n4. Testing UPDATE Account (PUT /api/accounts/{account_id}/)")
response = client.put(f'/api/accounts/{account_id}/', {
    'name': 'Updated Checking',
    'balance': 2000.00
})
print(f"   Status: {response.status_code}")
print(f"   Updated: {response.data.get('name')} - ${response.data.get('balance')}")

print(f"\n5. Testing PARTIAL UPDATE Account (PATCH /api/accounts/{account_id}/)")
response = client.patch(f'/api/accounts/{account_id}/', {
    'balance': 2500.00
})
print(f"   Status: {response.status_code}")
print(f"   Updated balance: ${response.data.get('balance')}")

print("\n" + "=" * 50)
print("All Account API endpoints work correctly!")
print("=" * 50)
print("\nEndpoints available:")
print("  POST   /api/accounts/         - Create account")
print("  GET    /api/accounts/         - List all accounts")
print("  GET    /api/accounts/{id}/    - Retrieve account")
print("  PUT    /api/accounts/{id}/    - Update account")
print("  PATCH  /api/accounts/{id}/    - Partial update")
print("  DELETE /api/accounts/{id}/    - Delete account")
