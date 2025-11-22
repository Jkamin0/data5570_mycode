from rest_framework import viewsets, permissions
from django.db import transaction
from .models import Account, Category, BudgetAllocation, Transaction
from .serializers import AccountSerializer, CategorySerializer, BudgetAllocationSerializer


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetAllocationViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BudgetAllocation.objects.filter(
            account__user=self.request.user
        )

    @transaction.atomic
    def perform_create(self, serializer):
        account = serializer.validated_data['account']
        amount = serializer.validated_data['amount']

        account.balance -= amount
        account.save()

        serializer.save()

    @transaction.atomic
    def perform_destroy(self, instance):
        account = instance.account
        amount = instance.amount

        account.balance += amount
        account.save()

        instance.delete()
