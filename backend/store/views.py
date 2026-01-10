from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, Count
from .models import Category, Product, Sale
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer

@api_view(['GET', 'POST'])
def products_list_create(request):
    """
    Lista todos os produtos ou cria um novo.
    """
    if request.method == 'GET':
        products = Product.objects.all().order_by('name')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def product_detail(request, pk):
    """
    Recupera, atualiza ou deleta um produto específico.
    """
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Produto não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def sales_list_create(request):
    """
    Lista todas as vendas ou registra uma nova transação.
    """
    if request.method == 'GET':
        sales = Sale.objects.all().order_by('-date')
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
    Análise de vendas com filtros de data opcionais (start_date e end_date).
    """
    # 1. Capturar parâmetros de data da URL (?start_date=YYYY-MM-DD&end_date=...)
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    # 2. Criar QuerySet base
    sales_queryset = Sale.objects.all()

    # 3. Aplicar filtros se fornecidos
    if start_date:
        sales_queryset = sales_queryset.filter(date__gte=start_date)
    if end_date:
        sales_queryset = sales_queryset.filter(date__lte=end_date)

    # 4. Calcular métricas gerais baseadas no filtro
    metrics = sales_queryset.aggregate(
        total_revenue=Sum('total_price'),
        avg_quantity=Avg('quantity'),
        total_transactions=Count('id')
    )
    
    # 5. Calcular performance por produto para o gráfico
    products_performance = sales_queryset.values('product__name').annotate(
        revenue=Sum('total_price')
    ).order_by('-revenue')

    # 6. Formatar dados para o Recharts (Frontend)
    chart_data = [
        {
            "name": item['product__name'], 
            "revenue": float(item['revenue'] or 0)
        } 
        for item in products_performance
    ]

    return Response({
        "metrics": {
            "total_revenue": metrics['total_revenue'] or 0,
            "avg_quantity": metrics['avg_quantity'] or 0,
            "total_transactions": metrics['total_transactions'] or 0
        },
        "products_performance": chart_data
    })