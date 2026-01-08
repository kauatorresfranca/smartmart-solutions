from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, Count
from .models import Category, Product, Sale
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer

@api_view(['GET', 'POST'])
def products_list_create(request):
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def sales_list_create(request):
    if request.method == 'GET':
        sales = Sale.objects.all()
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SaleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def sales_analysis(request):
    """
    Endpoint dedicado para a parte de ANÁLISE do desafio.
    Retorna métricas que o Frontend poderá usar em gráficos.
    """
    total_sales = Sale.objects.aggregate(
        total_revenue=Sum('total_price'),
        avg_quantity=Avg('quantity'),
        total_transactions=Count('id')
    )
    
    # Exemplo: Vendas por produto para um gráfico de pizza/barras
    sales_by_product = Sale.objects.values('product__name').annotate(
        total=Sum('total_price')
    ).order_by('-total')

    return Response({
        "metrics": total_sales,
        "by_product": sales_by_product
    })