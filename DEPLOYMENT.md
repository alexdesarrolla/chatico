# Chatico - Guía de Despliegue en VPS

Chatico es una aplicación de chat con IA construida con Next.js 15, TypeScript y Tailwind CSS. Esta guía te ayudará a desplegar la aplicación en tu VPS usando Docker.

## Requisitos Previos

### Sistema Operativo
- Ubuntu 20.04 o superior (recomendado)
- CentOS 7+ o Debian 10+ también son compatibles

### Software Necesario
- Docker (versión 20.10 o superior)
- Docker Compose (versión 1.29 o superior)
- Git (para clonar el repositorio)

### Recursos Mínimos Recomendados
- CPU: 2 núcleos
- RAM: 4 GB
- Almacenamiento: 20 GB
- Ancho de banda: Ilimitado o alto límite

## Instalación de Requisitos

### Instalar Docker y Docker Compose

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Agregar la clave GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar el repositorio de Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

### Configurar Usuario para Docker
```bash
# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Necesitarás cerrar y volver a abrir la sesión
newgrp docker
```

## Pasos de Despliegue

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd chatico
```

### 2. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus configuraciones
nano .env
```

Variables importantes a configurar:

```bash
# Configuración de la API de Z.ai
Z_AI_API_KEY="tu-api-key-aqui"
Z_AI_API_URL="https://api.z.ai/api/paas/v4/chat/completions"

# Configuración del servidor
NODE_ENV="production"
PORT="3000"
HOSTNAME="0.0.0.0"

# URL de la aplicación (cambia por tu dominio)
NEXT_PUBLIC_APP_URL="http://tu-dominio.com:3000"
NEXT_PUBLIC_WS_URL="ws://tu-dominio.com:3000/api/socketio"

# Base de datos
DATABASE_URL="file:./db/custom.db"

# Seguridad
NEXTAUTH_SECRET="genera-una-clave-segura-aqui"
NEXTAUTH_URL="http://tu-dominio.com:3000"
```

### 3. Generar Clave Secreta
```bash
# Generar una clave segura para NextAuth
openssl rand -base64 32
```

### 4. Ejecutar el Script de Despliegue
```bash
# Dar permisos de ejecución al script
chmod +x deploy.sh

# Ejecutar el script
./deploy.sh
```

El script te mostrará un menú con las siguientes opciones:

1. **Despliegue básico** - Solo la aplicación en el puerto 3000
2. **Despliegue con Nginx** - Incluye reverse proxy para mejor rendimiento
3. **Despliegue con Redis** - Incluye Redis para cache
4. **Despliegue completo** - Nginx + Redis (recomendado para producción)
5. **Monitorear contenedores** - Ver estado y logs
6. **Actualizar despliegue** - Actualizar la aplicación
7. **Limpiar sistema** - Limpiar contenedores e imágenes no usadas
8. **Crear backup** - Realizar backup de la aplicación

### 5. Verificar el Despliegue
```bash
# Verificar que los contenedores estén corriendo
docker-compose ps

# Verificar que la aplicación responda
curl http://localhost:3000/api/health
```

## Opciones de Despliegue

### Opción 1: Despliegue Básico
Ideal para desarrollo o pruebas rápidas.

```bash
# Manualmente
docker-compose up -d
```

La aplicación estará disponible en: `http://tu-ip:3000`

### Opción 2: Despliegue con Nginx
Recomendado para producción con dominio propio.

```bash
# Configurar dominio en nginx.conf
sed -i 's/your-domain.com/tu-dominio.com/g' nginx.conf

# Desplegar con Nginx
docker-compose --profile with-nginx up -d
```

La aplicación estará disponible en: `http://tu-dominio.com`

### Opción 3: Despliegue con Redis
Para mejor rendimiento con cache.

```bash
# Desplegar con Redis
docker-compose --profile with-redis up -d
```

### Opción 4: Despliegue Completo
La opción recomendada para producción.

```bash
# Configurar dominio
sed -i 's/your-domain.com/tu-dominio.com/g' nginx.conf

# Desplegar todo
docker-compose --profile with-nginx --profile with-redis up -d
```

## Configuración de SSL (HTTPS)

Para producción, es recomendable usar SSL. Puedes usar Let's Encrypt:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
```

Agregar esta línea al crontab:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoreo y Mantenimiento

### Ver Logs
```bash
# Ver logs de la aplicación
docker-compose logs -f chatico

# Ver logs de Nginx
docker-compose logs -f nginx

# Ver logs de Redis
docker-compose logs -f redis
```

### Reiniciar Servicios
```bash
# Reiniciar todos los servicios
docker-compose restart

# Reiniciar servicio específico
docker-compose restart chatico
```

### Actualizar la Aplicación
```bash
# Usar el script de despliegue
./deploy.sh
# Seleccionar opción 6

# O manualmente
git pull origin main
docker-compose build
docker-compose up -d
```

### Realizar Backup
```bash
# Usar el script
./deploy.sh
# Seleccionar opción 8

# O manualmente
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
cp db/custom.db backups/$(date +%Y%m%d_%H%M%S)/
cp .env backups/$(date +%Y%m%d_%H%M%S)/
```

### Restaurar Backup
```bash
# Copiar archivos de backup
cp backups/fecha/custom.db db/
cp backups/fecha/.env ./

# Reiniciar servicios
docker-compose restart
```

## Solución de Problemas

### Problemas Comunes

1. **La aplicación no inicia**
   ```bash
   # Verificar logs
   docker-compose logs chatico
   
   # Verificar variables de entorno
   docker-compose exec chatico env
   ```

2. **Problemas con la base de datos**
   ```bash
   # Verificar que el archivo de BD existe
   ls -la db/
   
   # Verificar permisos
   docker-compose exec chatico ls -la /app/db/
   ```

3. **Problemas con Socket.IO**
   ```bash
   # Verificar que el WebSocket esté funcionando
   curl -I http://localhost:3000/api/socketio/
   
   # Verificar logs de Nginx si se usa
   docker-compose logs nginx
   ```

4. **Problemas de memoria**
   ```bash
   # Verificar uso de memoria
   docker stats
   
   # Aumentar memoria límite en docker-compose.yml
   # Agregar: mem_limit: 4g
   ```

### Comandos Útiles
```bash
# Ver todos los contenedores
docker ps -a

# Ver uso de recursos
docker stats

# Limpiar sistema
docker system prune -a

# Ver redes Docker
docker network ls

# Entrar a un contenedor
docker-compose exec chatico bash
```

## Seguridad Adicional

### Configurar Firewall
```bash
# Instalar UFW
sudo apt install ufw

# Configurar reglas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable
```

### Configurar Fail2Ban
```bash
# Instalar Fail2Ban
sudo apt install fail2ban

# Configurar para Nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Reiniciar servicio
sudo systemctl restart fail2ban
```

## Rendimiento y Optimización

### Optimizar Docker
```bash
# Configurar Docker para usar menos recursos
sudo nano /etc/docker/daemon.json
```

Agregar:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Configurar Swap
```bash
# Crear archivo de swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs de los contenedores
2. Verifica las variables de entorno
3. Asegúrate de que todos los requisitos estén instalados
4. Consulta la documentación oficial de Next.js y Docker

Para soporte adicional, puedes abrir un issue en el repositorio del proyecto.