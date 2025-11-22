from rest_framework import serializers
from .models import Account, Category, BudgetAllocation, Transaction


class AccountSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Account
        fields = ['id', 'user', 'name', 'balance', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Category
        fields = ['id', 'user', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']


class BudgetAllocationSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    account_name = serializers.ReadOnlyField(source='account.name')

    class Meta:
        model = BudgetAllocation
        fields = ['id', 'category', 'category_name', 'account', 'account_name', 'amount', 'allocated_at']
        read_only_fields = ['id', 'allocated_at']

    def validate(self, data):
        account = data.get('account')
        amount = data.get('amount')

        if amount <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")

        if account.balance < amount:
            raise serializers.ValidationError(
                f"Insufficient funds in account. Available: ${account.balance}, Requested: ${amount}"
            )

        return data
