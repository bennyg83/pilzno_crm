# 🚀 Adding Your Second System to the Nginx Proxy

## 🎯 **Current Setup**
Your Pilzno Synagogue system is now running behind an Nginx reverse proxy on port 80.

## ➕ **Adding a Second System (Example: Blog System)**

### **Step 1: Add to docker-compose.simple.yml**

Add your second system to the same file:

```yaml
# Add this to docker-compose.simple.yml
  blog-system:
    image: your-blog-image
    container_name: blog-system
    environment:
      # Your blog environment variables
      DATABASE_URL: postgresql://blog_user:blog_pass@blog-db:5432/blog_db
    expose:
      - "8080"  # Internal port only
    networks:
      - pilzno-synagogue-network
    restart: unless-stopped

  blog-db:
    image: postgres:15-alpine
    container_name: blog-db
    environment:
      POSTGRES_DB: blog_db
      POSTGRES_USER: blog_user
      POSTGRES_PASSWORD: blog_pass
    expose:
      - "5432"
    networks:
      - pilzno-synagogue-network
```

### **Step 2: Update Nginx Configuration**

Add routing rules in `nginx/simple.conf`:

```nginx
# Add this inside the server block
location /blog/ {
    proxy_pass http://blog-system:8080/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Or for a completely separate subdomain-style access:
location /second-system/ {
    proxy_pass http://your-second-system:3000/;
    # ... same proxy headers
}
```

### **Step 3: Restart Services**

```bash
docker-compose -f docker-compose.simple.yml restart nginx-proxy
```

## 🌐 **Access URLs After Adding Second System**

- **Pilzno Synagogue**: `http://89.138.168.239/`
- **Blog System**: `http://89.138.168.239/blog/`
- **Second System**: `http://89.138.168.239/second-system/`

## 💡 **Benefits of This Approach**

1. **Single Port**: Only port 80 needs to be forwarded in your router
2. **Easy Management**: All systems in one Docker Compose file
3. **Centralized Logging**: All traffic goes through Nginx
4. **Security**: No direct external access to individual services
5. **Scalability**: Easy to add more systems

## 🔧 **Router Configuration**

You only need to forward **port 80** to your computer:

| Setting | Value |
|---------|-------|
| **External Port** | 80 |
| **Internal IP** | 10.100.102.4 |
| **Internal Port** | 80 |
| **Protocol** | TCP |

## 📝 **Example: Complete Second System**

Here's how you'd add a complete second system:

```yaml
# In docker-compose.simple.yml
services:
  # ... existing services ...

  # Second System - Example: E-commerce
  ecommerce-frontend:
    image: your-ecommerce-frontend
    container_name: ecommerce-frontend
    expose:
      - "4000"
    networks:
      - pilzno-synagogue-network

  ecommerce-backend:
    image: your-ecommerce-backend
    container_name: ecommerce-backend
    expose:
      - "4001"
    networks:
      - pilzno-synagogue-network

  ecommerce-db:
    image: postgres:15-alpine
    container_name: ecommerce-db
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: ecommerce_user
      POSTGRES_PASSWORD: ecommerce_pass
    expose:
      - "5432"
    networks:
      - pilzno-synagogue-network
```

```nginx
# In nginx/simple.conf
location /shop/ {
    proxy_pass http://ecommerce-frontend:4000/;
    # ... proxy headers
}

location /shop-api/ {
    proxy_pass http://ecommerce-backend:4001/;
    # ... proxy headers
}
```

## 🎉 **Result**

After setup, you'll have:
- **Main System**: `http://89.138.168.239/`
- **Shop Frontend**: `http://89.138.168.239/shop/`
- **Shop API**: `http://89.138.168.239/shop-api/`

All accessible through a single external port with centralized management!
