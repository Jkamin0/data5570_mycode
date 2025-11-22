from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, CategoryViewSet, BudgetAllocationViewSet

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'allocations', BudgetAllocationViewSet, basename='allocation')

urlpatterns = [
    path('', include(router.urls)),
]
