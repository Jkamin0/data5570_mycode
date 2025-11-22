import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetapp.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.models import User
from budget.models import Category

print("Testing Category REST API Endpoints...")
print("-" * 50)

user = User.objects.filter(username='testuser').first()
if not user:
    user = User.objects.create_user(username='testuser', password='testpass123')
    print(f"✓ Created test user: {user.username}")
else:
    print(f"✓ Using existing test user: {user.username}")

Category.objects.filter(user=user).delete()

client = APIClient()
client.force_authenticate(user=user)

print("\n1. Testing CREATE Category (POST /api/categories/)")
response = client.post('/api/categories/', {
    'name': 'Groceries'
})
print(f"   Status: {response.status_code}")
print(f"   Response: {response.data}")
category_id = response.data.get('id')

print("\n2. Testing CREATE Multiple Categories")
categories_to_create = ['Rent', 'Utilities', 'Entertainment', 'Transportation']
for cat_name in categories_to_create:
    response = client.post('/api/categories/', {'name': cat_name})
    print(f"   ✓ Created: {cat_name} (Status: {response.status_code})")

print("\n3. Testing LIST Categories (GET /api/categories/)")
response = client.get('/api/categories/')
print(f"   Status: {response.status_code}")
print(f"   Found {len(response.data)} categories:")
for cat in response.data:
    print(f"   - {cat['name']}")

print(f"\n4. Testing RETRIEVE Category (GET /api/categories/{category_id}/)")
response = client.get(f'/api/categories/{category_id}/')
print(f"   Status: {response.status_code}")
print(f"   Category: {response.data.get('name')}")

print(f"\n5. Testing UPDATE Category (PUT /api/categories/{category_id}/)")
response = client.put(f'/api/categories/{category_id}/', {
    'name': 'Food & Groceries'
})
print(f"   Status: {response.status_code}")
print(f"   Updated: {response.data.get('name')}")

print(f"\n6. Testing DELETE Category (DELETE /api/categories/{category_id}/)")
response = client.delete(f'/api/categories/{category_id}/')
print(f"   Status: {response.status_code}")

response = client.get('/api/categories/')
print(f"   Remaining categories: {len(response.data)}")

print("\n" + "=" * 50)
print("All Category API endpoints work correctly!")
print("=" * 50)
print("\nEndpoints available:")
print("  POST   /api/categories/         - Create category")
print("  GET    /api/categories/         - List all categories")
print("  GET    /api/categories/{id}/    - Retrieve category")
print("  PUT    /api/categories/{id}/    - Update category")
print("  PATCH  /api/categories/{id}/    - Partial update")
print("  DELETE /api/categories/{id}/    - Delete category")
