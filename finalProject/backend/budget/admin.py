from django.contrib import admin
from .models import Account, Category, BudgetAllocation, Transaction


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'balance', 'created_at']
    list_filter = ['user', 'created_at']
    search_fields = ['name', 'user__username']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at']
    list_filter = ['user', 'created_at']
    search_fields = ['name', 'user__username']


@admin.register(BudgetAllocation)
class BudgetAllocationAdmin(admin.ModelAdmin):
    list_display = ['category', 'account', 'amount', 'allocated_at']
    list_filter = ['category', 'account', 'allocated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'amount', 'category', 'account', 'date']
    list_filter = ['transaction_type', 'user', 'category', 'date']
    search_fields = ['description', 'user__username']
