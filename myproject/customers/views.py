from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Customer
from .serializers import CustomerSerializer


class CustomerListCreateView(generics.ListCreateAPIView):
    """
    List all customers or create a new customer.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a customer instance.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
