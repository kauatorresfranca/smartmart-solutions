from django.urls import path
from .views import (
    products_list_create, 
    product_detail,  
    sales_list_create, 
    sales_analysis
)

urlpatterns = [
    path('products/', products_list_create, name='products'),
    path('products/<int:pk>/', product_detail, name='product_detail'), # Rota para PUT e DELETE
    path('sales/', sales_list_create, name='sales'),
    path('analysis/', sales_analysis, name='analysis'),
]