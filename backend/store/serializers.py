from rest_framework import serializers
from .models import Category, Product, Sale

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'category', 'category_name']

class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    month = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        # Certifique-se de que 'date' é o nome real no seu models.py
        fields = ['id', 'product', 'product_name', 'month', 'quantity', 'total_price', 'date']

    def get_month(self, obj):
        # Usando obj.date em vez de sale_date
        return obj.date.strftime('%B')