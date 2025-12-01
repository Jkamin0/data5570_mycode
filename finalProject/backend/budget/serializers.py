from decimal import Decimal
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db.models import Sum
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
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        category = data.get('category')
        account = data.get('account')
        amount = data.get('amount')

        if user:
            if account and account.user != user:
                raise serializers.ValidationError("Account does not belong to the authenticated user.")
            if category and category.user != user:
                raise serializers.ValidationError("Category does not belong to the authenticated user.")

        if amount <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")

        # Calculate Available to Budget (total account balance - total allocated + total spent)
        if user:
            total_account_balance = Account.objects.filter(user=user).aggregate(
                total=Sum('balance')
            )['total'] or Decimal('0')

            total_allocated = BudgetAllocation.objects.filter(
                account__user=user
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

            total_spent = Transaction.objects.filter(
                user=user,
                transaction_type='expense'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

            available_to_budget = total_account_balance - total_allocated + total_spent

            if amount > available_to_budget:
                available_display = format(available_to_budget, '.2f')
                amount_display = format(amount, '.2f')
                raise serializers.ValidationError(
                    f"Insufficient available budget. Available: ${available_display}, Requested: ${amount_display}"
                )

        return data


class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    account_name = serializers.ReadOnlyField(source='account.name')

    class Meta:
        model = Transaction
        fields = ['id', 'user', 'category', 'category_name', 'account', 'account_name',
                  'transaction_type', 'amount', 'description', 'date']
        read_only_fields = ['id', 'date']

    def validate(self, data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        account = data.get('account')
        category = data.get('category')
        transaction_type = data.get('transaction_type')
        amount = data.get('amount')

        if account is None:
            raise serializers.ValidationError("Account is required.")

        if user and account.user != user:
            raise serializers.ValidationError("Account does not belong to the authenticated user.")

        if amount <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")

        if transaction_type == 'expense':
            if category is None:
                raise serializers.ValidationError("Category is required for expenses.")

            if user and category.user != user:
                raise serializers.ValidationError("Category does not belong to the authenticated user.")
        elif transaction_type == 'income' and category is not None and user and category.user != user:
            raise serializers.ValidationError("Category does not belong to the authenticated user.")

        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
