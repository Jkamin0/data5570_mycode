from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AccountViewSet, CategoryViewSet, BudgetAllocationViewSet, TransactionViewSet,
    RegisterView, LoginView, CurrentUserView
)

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'allocations', BudgetAllocationViewSet, basename='allocation')
router.register(r'transactions', TransactionViewSet, basename='transaction')

auth_patterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
]

urlpatterns = auth_patterns + [
    path('', include(router.urls)),
]
