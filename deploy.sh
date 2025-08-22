#!/bin/bash

# Script de despliegue para Chatico en VPS
# Este script automatiza el proceso de despliegue usando Docker

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado. Por favor instala Docker primero."
        exit 1
    fi
    log_success "Docker está instalado"
}

# Verificar si Docker Compose está instalado
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        exit 1
    fi
    log_success "Docker Compose está instalado"
}

# Crear directorios necesarios
create_directories() {
    log_info "Creando directorios necesarios..."
    
    mkdir -p db
    mkdir -p logs
    mkdir -p ssl
    
    log_success "Directorios creados"
}

# Verificar archivo .env
check_env_file() {
    if [ ! -f .env ]; then
        log_warning "Archivo .env no encontrado. Creando desde .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warning "Por favor edita el archivo .env con tus variables de entorno antes de continuar"
            read -p "Presiona Enter cuando hayas configurado el archivo .env..."
        else
            log_error "No se encontró .env.example. Por favor crea el archivo .env manualmente."
            exit 1
        fi
    fi
    log_success "Archivo .env verificado"
}

# Construir y levantar contenedores
deploy() {
    log_info "Iniciando despliegue..."
    
    # Detener contenedores existentes
    log_info "Deteniendo contenedores existentes..."
    docker-compose down
    
    # Construir imágenes
    log_info "Construyendo imágenes Docker..."
    docker-compose build --no-cache
    
    # Levantar contenedores
    log_info "Levantando contenedores..."
    docker-compose up -d
    
    # Esperar a que la aplicación esté lista
    log_info "Esperando a que la aplicación esté lista..."
    sleep 30
    
    # Verificar salud de la aplicación
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Aplicación desplegada exitosamente"
        log_info "La aplicación está disponible en: http://localhost:3000"
    else
        log_error "La aplicación no está respondiendo correctamente"
        log_info "Revisando logs..."
        docker-compose logs chatico
        exit 1
    fi
}

# Despliegue con Nginx
deploy_with_nginx() {
    log_info "Desplegando con Nginx reverse proxy..."
    
    # Verificar si existen certificados SSL
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        log_warning "Certificados SSL no encontrados. Puedes generar certificados auto-firmados para desarrollo:"
        log_info "openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes"
        read -p "¿Deseas generar certificados auto-firmados? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            mkdir -p ssl
            openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            log_success "Certificados auto-firmados generados"
        fi
    fi
    
    # Editar nginx.conf con el dominio correcto
    read -p "Ingresa tu dominio (ej: example.com): " DOMAIN
    if [ ! -z "$DOMAIN" ]; then
        sed -i "s/your-domain.com/$DOMAIN/g" nginx.conf
        log_success "Configuración de Nginx actualizada con el dominio: $DOMAIN"
    fi
    
    # Desplegar con perfil nginx
    docker-compose --profile with-nginx up -d
    
    log_success "Despliegue con Nginx completado"
    log_info "La aplicación está disponible en: http://$DOMAIN"
}

# Despliegue con Redis
deploy_with_redis() {
    log_info "Desplegando con Redis para cache..."
    
    # Desplegar con perfil redis
    docker-compose --profile with-redis up -d
    
    log_success "Despliegue con Redis completado"
}

# Monitoreo
monitor() {
    log_info "Monitoreando contenedores..."
    docker-compose ps
    docker-compose logs --tail=50 -f chatico
}

# Actualizar despliegue
update() {
    log_info "Actualizando despliegue..."
    
    # Pull de cambios (si es un repo git)
    if [ -d .git ]; then
        git pull origin main
    fi
    
    # Reconstruir y levantar
    docker-compose build
    docker-compose up -d
    
    log_success "Actualización completada"
}

# Limpiar
cleanup() {
    log_info "Limpiando contenedores e imágenes no utilizadas..."
    
    docker-compose down
    docker system prune -f
    docker volume prune -f
    
    log_success "Limpieza completada"
}

# Backup
backup() {
    log_info "Creando backup..."
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup de la base de datos
    cp db/custom.db "$BACKUP_DIR/"
    
    # Backup de configuraciones
    cp .env "$BACKUP_DIR/"
    cp docker-compose.yml "$BACKUP_DIR/"
    
    # Backup de logs
    cp -r logs "$BACKUP_DIR/" 2>/dev/null || true
    
    log_success "Backup creado en: $BACKUP_DIR"
}

# Menú principal
show_menu() {
    echo "=========================================="
    echo "  Script de Despliegue - Chatico"
    echo "=========================================="
    echo ""
    echo "1. Despliegue básico (solo aplicación)"
    echo "2. Despliegue con Nginx reverse proxy"
    echo "3. Despliegue con Redis cache"
    echo "4. Despliegue completo (Nginx + Redis)"
    echo "5. Monitorear contenedores"
    echo "6. Actualizar despliegue"
    echo "7. Limpiar sistema"
    echo "8. Crear backup"
    echo "9. Salir"
    echo ""
    read -p "Selecciona una opción [1-9]: " choice
}

# Función principal
main() {
    log_info "Iniciando script de despliegue de Chatico..."
    
    # Verificaciones iniciales
    check_docker
    check_docker_compose
    create_directories
    check_env_file
    
    while true; do
        show_menu
        
        case $choice in
            1)
                deploy
                ;;
            2)
                deploy_with_nginx
                ;;
            3)
                deploy_with_redis
                ;;
            4)
                deploy_with_nginx
                deploy_with_redis
                ;;
            5)
                monitor
                ;;
            6)
                update
                ;;
            7)
                cleanup
                ;;
            8)
                backup
                ;;
            9)
                log_info "Saliendo..."
                exit 0
                ;;
            *)
                log_error "Opción no válida"
                ;;
        esac
        
        echo ""
        read -p "Presiona Enter para continuar..."
    done
}

# Ejecutar función principal
main "$@"