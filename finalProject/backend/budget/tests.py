from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from .models import Account, Category, BudgetAllocation, Transaction
from django.db.models import Sum


API_PREFIX = "/api"


def api_url(path: str) -> str:
    return f"{API_PREFIX}{path}"


class AuthTests(APITestCase):
    def test_register_login_and_me(self):
        register_payload = {
            "username": "testuser",
            "email": "user@test.com",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }
        register_resp = self.client.post(api_url("/auth/register/"), register_payload, format="json")
        self.assertEqual(register_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", register_resp.data)

        login_payload = {"username": "testuser", "password": "StrongPass123!"}
        login_resp = self.client.post(api_url("/auth/login/"), login_payload, format="json")
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        access = login_resp.data["tokens"]["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        me_resp = self.client.get(api_url("/auth/me/"))
        self.assertEqual(me_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(me_resp.data["username"], "testuser")


class BaseBudgetTestCase(APITestCase):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            username="alice",
            email="alice@test.com",
            password="pass1234!",
        )
        self.client.force_authenticate(user=self.user)

    def create_account(self, name="Checking", balance=Decimal("1000.00")) -> Account:
        return Account.objects.create(user=self.user, name=name, balance=balance)

    def create_category(self, name="Groceries") -> Category:
        return Category.objects.create(user=self.user, name=name)


class AccountCategoryTests(BaseBudgetTestCase):
    def test_account_crud_and_isolation(self):
        account = self.create_account()
        list_resp = self.client.get(api_url("/accounts/"))
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(list_resp.data[0]["name"], account.name)

        detail_resp = self.client.get(api_url(f"/accounts/{account.id}/"))
        self.assertEqual(detail_resp.status_code, status.HTTP_200_OK)

        update_resp = self.client.put(
            api_url(f"/accounts/{account.id}/"),
            {"name": "Updated", "balance": "900.00"},
            format="json",
        )
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(update_resp.data["name"], "Updated")

        delete_resp = self.client.delete(api_url(f"/accounts/{account.id}/"))
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Account.objects.filter(id=account.id).exists())

        other_user = User.objects.create_user("bob", password="pass1234!")
        other_account = Account.objects.create(user=other_user, name="Bob", balance=100)
        isolation_resp = self.client.get(api_url(f"/accounts/{other_account.id}/"))
        self.assertEqual(isolation_resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_category_crud_and_isolation(self):
        category = self.create_category()
        list_resp = self.client.get(api_url("/categories/"))
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(list_resp.data[0]["name"], category.name)

        update_resp = self.client.put(
            api_url(f"/categories/{category.id}/"), {"name": "Dining"}, format="json"
        )
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(update_resp.data["name"], "Dining")

        delete_resp = self.client.delete(api_url(f"/categories/{category.id}/"))
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(id=category.id).exists())

        other_user = User.objects.create_user("bob", password="pass1234!")
        other_category = Category.objects.create(user=other_user, name="BobCat")
        isolation_resp = self.client.get(api_url(f"/categories/{other_category.id}/"))
        self.assertEqual(isolation_resp.status_code, status.HTTP_404_NOT_FOUND)


class AllocationTests(BaseBudgetTestCase):
    def test_allocation_create_and_validation(self):
        account = self.create_account(balance=Decimal("500"))
        category = self.create_category()

        create_resp = self.client.post(
            api_url("/allocations/"),
            {"category": category.id, "account": account.id, "amount": "200.00"},
            format="json",
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_resp.data["amount"], "200.00")

        over_resp = self.client.post(
            api_url("/allocations/"),
            {"category": category.id, "account": account.id, "amount": "800.00"},
            format="json",
        )
        self.assertEqual(over_resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_move_money_and_validation(self):
        account = self.create_account(balance=Decimal("1000"))
        groceries = self.create_category("Groceries")
        rent = self.create_category("Rent")

        BudgetAllocation.objects.create(category=groceries, account=account, amount=Decimal("400"))
        BudgetAllocation.objects.create(category=rent, account=account, amount=Decimal("200"))

        move_resp = self.client.post(
            api_url("/allocations/move/"),
            {
                "source_category": groceries.id,
                "target_category": rent.id,
                "amount": "100.00",
                "account": account.id,
            },
            format="json",
        )
        self.assertEqual(move_resp.status_code, status.HTTP_201_CREATED)

        balances = BudgetAllocation.objects.values("category").order_by().annotate(total=Sum("amount"))
        totals = {b["category"]: b["total"] for b in balances}
        self.assertEqual(totals[groceries.id], Decimal("300"))
        self.assertEqual(totals[rent.id], Decimal("300"))

        insufficient = self.client.post(
            api_url("/allocations/move/"),
            {
                "source_category": groceries.id,
                "target_category": rent.id,
                "amount": "400.00",
                "account": account.id,
            },
            format="json",
        )
        self.assertEqual(insufficient.status_code, status.HTTP_400_BAD_REQUEST)


class TransactionTests(BaseBudgetTestCase):
    def setUp(self):
        super().setUp()
        self.account = self.create_account(balance=Decimal("1000"))
        self.groceries = self.create_category("Groceries")
        BudgetAllocation.objects.create(
            category=self.groceries, account=self.account, amount=Decimal("300")
        )

    def test_expense_decreases_balance_and_available(self):
        create_resp = self.client.post(
            api_url("/transactions/"),
            {
                "category": self.groceries.id,
                "account": self.account.id,
                "transaction_type": "expense",
                "amount": "50.00",
                "description": "Food",
            },
            format="json",
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal("950.00"))

        balances = self.client.get(api_url("/categories/balances/")).data
        groc_balance = next(b for b in balances if b["category_id"] == self.groceries.id)
        self.assertEqual(groc_balance["spent"], "50")
        self.assertEqual(groc_balance["available"], "250")

    def test_income_increases_balance(self):
        create_resp = self.client.post(
            api_url("/transactions/"),
            {
                "category": self.groceries.id,
                "account": self.account.id,
                "transaction_type": "income",
                "amount": "75.00",
            },
            format="json",
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal("1075.00"))

    def test_delete_transaction_restores_balance(self):
        txn_resp = self.client.post(
            api_url("/transactions/"),
            {
                "category": self.groceries.id,
                "account": self.account.id,
                "transaction_type": "expense",
                "amount": "20.00",
            },
            format="json",
        )
        txn_id = txn_resp.data["id"]
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal("980.00"))

        delete_resp = self.client.delete(api_url(f"/transactions/{txn_id}/"))
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal("1000.00"))

    def test_validation_prevents_negative_and_missing_category(self):
        neg_resp = self.client.post(
            api_url("/transactions/"),
            {
                "category": self.groceries.id,
                "account": self.account.id,
                "transaction_type": "expense",
                "amount": "-5.00",
            },
            format="json",
        )
        self.assertEqual(neg_resp.status_code, status.HTTP_400_BAD_REQUEST)

        no_cat_resp = self.client.post(
            api_url("/transactions/"),
            {
                "category": None,
                "account": self.account.id,
                "transaction_type": "expense",
                "amount": "10.00",
            },
            format="json",
        )
        self.assertEqual(no_cat_resp.status_code, status.HTTP_400_BAD_REQUEST)


class CategoryBalanceTests(BaseBudgetTestCase):
    def test_balances_endpoint(self):
        account = self.create_account(balance=Decimal("1000"))
        dining = self.create_category("Dining")
        travel = self.create_category("Travel")
        BudgetAllocation.objects.create(category=dining, account=account, amount=Decimal("200"))
        BudgetAllocation.objects.create(category=travel, account=account, amount=Decimal("300"))

        self.client.post(
            api_url("/transactions/"),
            {
                "category": dining.id,
                "account": account.id,
                "transaction_type": "expense",
                "amount": "50.00",
            },
            format="json",
        )

        resp = self.client.get(api_url("/categories/balances/"))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        dining_balance = next(b for b in resp.data if b["category_id"] == dining.id)
        travel_balance = next(b for b in resp.data if b["category_id"] == travel.id)
        self.assertEqual(dining_balance["allocated"], "200")
        self.assertEqual(dining_balance["spent"], "50")
        self.assertEqual(dining_balance["available"], "150")
        self.assertEqual(travel_balance["available"], "300")


class UserIsolationTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user("alice", password="pass1234!")
        self.bob = User.objects.create_user("bob", password="pass1234!")

        self.alice_account = Account.objects.create(user=self.alice, name="Alice A", balance=100)
        self.bob_account = Account.objects.create(user=self.bob, name="Bob A", balance=200)

        self.alice_category = Category.objects.create(user=self.alice, name="Alice C")
        self.bob_category = Category.objects.create(user=self.bob, name="Bob C")

        self.alice_txn = Transaction.objects.create(
            user=self.alice,
            account=self.alice_account,
            category=self.alice_category,
            transaction_type="expense",
            amount=Decimal("10.00"),
        )
        self.bob_txn = Transaction.objects.create(
            user=self.bob,
            account=self.bob_account,
            category=self.bob_category,
            transaction_type="income",
            amount=Decimal("20.00"),
        )

    def test_users_see_only_their_data(self):
        alice_client = APIClient()
        bob_client = APIClient()
        alice_client.force_authenticate(self.alice)
        bob_client.force_authenticate(self.bob)

        alice_accounts = alice_client.get(api_url("/accounts/"))
        bob_accounts = bob_client.get(api_url("/accounts/"))
        self.assertEqual(len(alice_accounts.data), 1)
        self.assertEqual(alice_accounts.data[0]["name"], "Alice A")
        self.assertEqual(len(bob_accounts.data), 1)
        self.assertEqual(bob_accounts.data[0]["name"], "Bob A")

        alice_categories = alice_client.get(api_url("/categories/"))
        bob_categories = bob_client.get(api_url("/categories/"))
        self.assertEqual(len(alice_categories.data), 1)
        self.assertEqual(alice_categories.data[0]["name"], "Alice C")
        self.assertEqual(len(bob_categories.data), 1)
        self.assertEqual(bob_categories.data[0]["name"], "Bob C")

        alice_txns = alice_client.get(api_url("/transactions/"))
        bob_txns = bob_client.get(api_url("/transactions/"))
        self.assertEqual(len(alice_txns.data), 1)
        self.assertEqual(alice_txns.data[0]["amount"], "10.00")
        self.assertEqual(len(bob_txns.data), 1)
        self.assertEqual(bob_txns.data[0]["amount"], "20.00")
