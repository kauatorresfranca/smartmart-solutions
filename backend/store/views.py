import csv
import io
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, Count
from .models import Category, Product, Sale
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer

@api_view(['POST'])
def upload_csv(request):
    """
    Endpoint para importar produtos via arquivo CSV.
    """
    file = request.FILES.get('file')
    if not file:
        return Response({"error": "Nenhum arquivo enviado"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_file = file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        products_created = 0
        for row in reader:
            category_name = row.get('category', 'Geral')
            category, _ = Category.objects.get_or_create(name=category_name)

            Product.objects.update_or_create(
                name=row['name'],
                defaults={
                    'price': float(row['price']),
                    'category': category,
                    'description': row.get('description', '')
                }
            )
            products_created += 1
            
        return Response({"message": f"{products_created} produtos processados!"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": f"Erro ao processar CSV: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def products_list_create(request):
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
    # Captura de filtros do Frontend
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    category_id = request.query_params.get('category')

    sales_queryset = Sale.objects.all()

    # Aplicação dos filtros no banco de dados
    if start_date:
        sales_queryset = sales_queryset.filter(date__gte=start_date)
    if end_date:
        sales_queryset = sales_queryset.filter(date__lte=end_date)
    if category_id:
        sales_queryset = sales_queryset.filter(product__category_id=category_id)

    # Cálculo de métricas agregadas
    metrics = sales_queryset.aggregate(
        total_revenue=Sum('total_price'),
        avg_quantity=Avg('quantity'),
        total_transactions=Count('id')
    )
    
    # Performance por produto para os gráficos
    products_performance = sales_queryset.values('product__name').annotate(
        revenue=Sum('total_price')
    ).order_by('-revenue')

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

@api_view(['GET', 'POST'])
def categories_list_create(request):
    if request.method == 'GET':
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def sale_detail(request, pk):
    try:
        sale = Sale.objects.get(pk=pk)
    except Sale.DoesNotExist:
        return Response({'error': 'Venda não encontrada'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SaleSerializer(sale)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = SaleSerializer(sale, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        sale.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)