import os
from pathlib import Path
import dj_database_url

# Caminho base do projeto
BASE_DIR = Path(__file__).resolve().parent.parent

# SEGURANÇA: Configurações via variáveis de ambiente
SECRET_KEY = os.getenv('SECRET_KEY', '7h9#kL2$p98xZqW3@vB5mN8*jR1tY6uI0oP')

# DEBUG deve ser False em produção
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# ALLOWED_HOSTS configurado para aceitar local e a URL da Render
ALLOWED_HOSTS = [
    'smartmart-solutions.onrender.com', 
    'localhost', 
    '127.0.0.1',
    '*' # Mantido '*' para evitar erros de bloqueio durante o deploy final
]

# Definição dos Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Bibliotecas de Terceiros
    'rest_framework',
    'corsheaders',
    # App do Projeto
    'store',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Arquivos estáticos
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',        # Antes do CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Banco de Dados (PostgreSQL na nuvem, SQLite local)
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600
    )
}

# Internacionalização
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# Arquivos Estáticos (Configuração WhiteNoise para Render)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Configuração de CORS (Permite que o Frontend na Vercel acesse a API)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://smartmart-solutions.vercel.app",
]

# Configuração de CSRF (Importante para chamadas POST)
CSRF_TRUSTED_ORIGINS = [
    "https://smartmart-solutions.vercel.app",
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'