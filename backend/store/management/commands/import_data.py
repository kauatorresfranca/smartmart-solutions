import csv
from django.core.management.base import BaseCommand
from store.models import Category, Product, Sale

class Command(BaseCommand):
    help = 'Importa dados dos arquivos CSV'

    def handle(self, *args, **kwargs):
        # 1. Importar Categorias
        with open('../data/categories.csv', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Category.objects.get_or_create(id=row['id'], defaults={'name': row['name']})
        self.stdout.write(self.style.SUCCESS('Categorias importadas!'))

        # 2. Importar Produtos
        with open('../data/products.csv', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                category = Category.objects.get(id=row['category_id'])
                Product.objects.get_or_create(
                    id=row['id'], 
                    defaults={'name': row['name'], 'price': row['price'], 'category': category}
                )
        self.stdout.write(self.style.SUCCESS('Produtos importados!'))

        # 3. Importar Vendas
        with open('../data/sales.csv', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=',')
            for row in reader:
                row = {k.strip(): v for k, v in row.items()}
                
                product = Product.objects.get(id=row['product_id'])
                Sale.objects.create(
                    product=product,
                    date=row['date'], # Alterado para bater com o CSV
                    quantity=row['quantity'],
                    total_price=row['total_price']
                )