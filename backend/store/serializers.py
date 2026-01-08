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
        fields = ['id', 'product', 'product_name', 'month', 'quantity', 'total_price']

    def get_month(self, obj):
        # Retorna o nome do mês baseado na sale_date
        return obj.sale_date.strftime('%B')