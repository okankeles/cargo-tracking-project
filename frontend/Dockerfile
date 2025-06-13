# frontend/Dockerfile

# 1. Aşama: Build Aşaması
# React uygulamasını build etmek için Node.js kullanıyoruz
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# React uygulamasını statik dosyalara (HTML, CSS, JS) dönüştürür
RUN npm run build

# 2. Aşama: Sunum Aşaması
# Statik dosyaları sunmak için çok hafif bir web sunucusu olan NGINX kullanıyoruz
FROM nginx:1.21-alpine
# Builder aşamasında oluşturulan build klasörünü NGINX'in sunum klasörüne kopyala
COPY --from=builder /app/build /usr/share/nginx/html
# NGINX'in varsayılan ayarlarını silip kendi ayarımızı kullanacağız (bir sonraki adımda oluşturacağız)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]