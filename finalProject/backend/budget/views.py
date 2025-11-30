from decimal import Decimal, InvalidOperation
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

    @action(detail=False, methods=['get'], url_path='balances')
    def balances(self, request):
        """Calculate balance for each category."""
        categories = self.get_queryset()
        balances = []

        for category in categories:
            allocated = BudgetAllocation.objects.filter(
                category=category
            ).aggregate(total=Sum('amount'))['total'] or 0

            spent = Transaction.objects.filter(
                category=category,
                transaction_type='expense'
            ).aggregate(total=Sum('amount'))['total'] or 0

            available = allocated - spent

            balances.append({
                'category_id': category.id,
                'category_name': category.name,
                'allocated': str(allocated),
                'spent': str(spent),
                'available': str(available),
            })

        return Response(balances)


class BudgetAllocationViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BudgetAllocation.objects.filter(
            account__user=self.request.user
        )

    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save()

    @transaction.atomic
    def perform_destroy(self, instance):
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
            amount = Decimal(str(amount))
            if amount <= 0:
                return Response(
                    {'error': 'Amount must be greater than zero'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (TypeError, ValueError, InvalidOperation):
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

        allocated = BudgetAllocation.objects.filter(
            category=source_category,
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        spent = Transaction.objects.filter(
            category=source_category,
            transaction_type='expense'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        available = allocated - spent
        if available < amount:
            available_display = format(available, '.2f')
            amount_display = format(amount, '.2f')
            return Response(
                {'error': f'Insufficient funds in source category. Available: ${available_display}, Requested: ${amount_display}'},
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
