import os
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()

try:
    print("Iniciando migrações e importação automática...")
    call_command('migrate')
    call_command('import_data')
    print("Importação concluída com sucesso!")
except Exception as e:
    print(f"Erro na importação automática: {e}")