##  Kurulum & Çalıştırma

### Gereksinimler
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Depoyu Klonla

```bash
git clone https://github.com/Rogedeen/kutuphane-projesi.git
cd kutuphane-projesi
```

### 2. Servisleri Başlat

```bash
docker-compose up -d
```

İlk çalıştırmada veritabanı otomatik oluşturulur ve örnek verilerle doldurulur.

### 3. Uygulamayı Aç

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:8000
- **API Dokümantasyonu:** http://localhost:8000/docs

---

##  Test Kullanıcıları

| Kullanıcı Adı | Şifre | Rol | Yönlendirme |
|---|---|---|---|
| `admin` | `admin123` | ADMIN | `/dashboard` |
| `user` | `user123` | USER | `/store` |
