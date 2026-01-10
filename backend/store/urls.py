from django.urls import path
from .views import (
    products_list_create, 
    product_detail,  
    sales_list_create, 
    sale_detail, # Nova importação
    sales_analysis,
    upload_csv,
    categories_list_create  
)

urlpatterns = [
    path('products/', products_list_create, name='products'),
    path('products/<int:pk>/', product_detail, name='product_detail'),
    path('products/upload-csv/', upload_csv, name='upload-csv'),
    path('categories/', categories_list_create, name='list-categories'),
    path('sales/', sales_list_create, name='sales'),
    path('sales/<int:pk>/', sale_detail, name='sale_detail'), # Novo path
    path('analysis/', sales_analysis, name='analysis'),
]