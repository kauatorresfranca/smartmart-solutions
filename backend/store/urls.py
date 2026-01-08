from django.urls import path
from .views import products_list_create, sales_list_create, sales_analysis

urlpatterns = [
    path('products/', products_list_create, name='products'),
    path('sales/', sales_list_create, name='sales'),
    path('analysis/', sales_analysis, name='analysis'),
]