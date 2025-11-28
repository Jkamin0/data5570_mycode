from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
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
        amount = data.get('amount')

        if amount <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")

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
