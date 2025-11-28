from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.db.models import Sum
from django.contrib.auth import authenticate
from .models import Account, Category, BudgetAllocation, Transaction
from .serializers import (
    AccountSerializer, CategorySerializer, BudgetAllocationSerializer,
    TransactionSerializer, RegisterSerializer, UserSerializer
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class CurrentUserView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


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

    @action(detail=False, methods=['post'], url_path='move')
    @transaction.atomic
    def move_money(self, request):
        source_category_id = request.data.get('source_category')
        target_category_id = request.data.get('target_category')
        amount = request.data.get('amount')
        account_id = request.data.get('account')

        if not all([source_category_id, target_category_id, amount, account_id]):
            return Response(
                {'error': 'source_category, target_category, amount, and account are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(amount)
            if amount <= 0:
                return Response(
                    {'error': 'Amount must be greater than zero'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (TypeError, ValueError):
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            source_category = Category.objects.get(id=source_category_id, user=request.user)
            target_category = Category.objects.get(id=target_category_id, user=request.user)
            account = Account.objects.get(id=account_id, user=request.user)
        except (Category.DoesNotExist, Account.DoesNotExist):
            return Response(
                {'error': 'Invalid category or account'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if source_category_id == target_category_id:
            return Response(
                {'error': 'Source and target categories must be different'},
                status=status.HTTP_400_BAD_REQUEST
            )

        source_allocations = BudgetAllocation.objects.filter(
            category=source_category, account=account
        ).aggregate(total=Sum('amount'))['total'] or 0

        if source_allocations < amount:
            return Response(
                {'error': f'Insufficient funds in source category. Available: ${source_allocations}, Requested: ${amount}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        BudgetAllocation.objects.create(
            category=source_category,
            account=account,
            amount=-amount
        )

        target_allocation = BudgetAllocation.objects.create(
            category=target_category,
            account=account,
            amount=amount
        )

        serializer = self.get_serializer(target_allocation)
        return Response({
            'message': f'Moved ${amount} from {source_category.name} to {target_category.name}',
            'allocation': serializer.data
        }, status=status.HTTP_201_CREATED)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    @transaction.atomic
    def perform_create(self, serializer):
        transaction_instance = serializer.save(user=self.request.user)

        account = transaction_instance.account
        amount = transaction_instance.amount
        transaction_type = transaction_instance.transaction_type

        if transaction_type == 'income':
            account.balance += amount
        else:
            account.balance -= amount

        account.save()

    @transaction.atomic
    def perform_destroy(self, instance):
        account = instance.account
        amount = instance.amount
        transaction_type = instance.transaction_type

        if transaction_type == 'income':
            account.balance -= amount
        else:
            account.balance += amount

        account.save()
        instance.delete()
