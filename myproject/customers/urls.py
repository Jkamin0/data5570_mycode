from django.urls import path
from .views import CustomerListCreateView, CustomerDetailView

urlpatterns = [
    path('api/customers/', CustomerListCreateView.as_view(), name='customer-list-create'),
    path('api/customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
]
