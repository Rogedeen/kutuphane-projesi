# 📚 Kütüphane Yönetim Sistemi

Rol tabanlı erişim kontrolüne sahip modern kütüphane yönetim sistemi. Yöneticiler kitap ve kullanıcı CRUD işlemleri yapabilir; standart kullanıcılar kitapları sepete ekleyip satın alabilir ve satış istatistiklerini görüntüleyebilir.

---

## 🚀 Özellikler

### Yönetici (Admin)
- **Kitap Yönetimi:** Kitap ekleme, düzenleme, silme
- **Kullanıcı Yönetimi:** Kullanıcı oluşturma (ADMIN/USER rolü), silme
- **Satış Grafiği:** Gerçek zamanlı gelir istatistikleri
- **Sistem Sıfırlama:** Veritabanını başlangıç durumuna döndürme (`Ctrl+Shift+R`)
- **Test Verisi:** Toplu veri ekleme (`Ctrl+Shift+J`)

### Standart Kullanıcı (User)
- **Kitap Mağazası:** Tüm kitapları görüntüleme ve sepete ekleme
- **Sepet Yönetimi:** Miktar güncelleme, ürün çıkarma
- **Satın Alma:** Sepeti onaylama ve satış kaydı oluşturma
- **Satış İstatistikleri:** Toplam satış ve gelir grafiği

---

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | Next.js 16 (Turbopack), TypeScript, Tailwind CSS, Recharts |
| Backend | FastAPI, SQLAlchemy, Uvicorn |
| Veritabanı | PostgreSQL |
| Kimlik Doğrulama | JWT (python-jose) |
| Konteyner | Docker, Docker Compose |

---

## ⚡ Kurulum & Çalıştırma

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

## 🔐 Test Kullanıcıları

| Kullanıcı Adı | Şifre | Rol | Yönlendirme |
|---|---|---|---|
| `admin` | `admin123` | ADMIN | `/dashboard` |
| `user` | `user123` | USER | `/store` |

---

## 🗂️ Proje Yapısı

```
kutuphane-projesi/
├── backend/
│   ├── main.py          # FastAPI endpoint'leri (CRUD + auth)
│   ├── auth.py          # JWT kimlik doğrulama
│   ├── models.py        # SQLAlchemy modelleri
│   ├── schemas.py       # Pydantic şemaları
│   ├── database.py      # Veritabanı bağlantısı
│   └── seed.py          # Örnek veri
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── login/       # Giriş sayfası
│       │   ├── dashboard/   # Admin paneli
│       │   └── store/       # Kullanıcı mağazası
│       ├── components/
│       │   ├── modals/      # BookModal, UserModal
│       │   └── dashboard/   # RevenueChart
│       └── lib/
│           ├── api.ts       # API servis katmanı (SRP)
│           └── types.ts     # Ortak tip tanımları (SRP)
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoint'leri

### Kimlik Doğrulama

| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/auth/login` | Giriş (JWT + role döner) |

### Kitaplar

| Method | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| GET | `/api/books` | Herkes | Tüm kitapları listele |
| POST | `/api/books` | ADMIN | Kitap ekle |
| PUT | `/api/books/{id}` | ADMIN | Kitap güncelle |
| DELETE | `/api/books/{id}` | ADMIN | Kitap sil |

### Kullanıcılar

| Method | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| GET | `/api/users` | ADMIN | Kullanıcıları listele |
| POST | `/api/users` | ADMIN | Kullanıcı oluştur |
| DELETE | `/api/users/{id}` | ADMIN | Kullanıcı sil |

### Satışlar

| Method | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| GET | `/api/sales` | Herkes | Tüm satışları listele |
| POST | `/api/sales` | Giriş Yapılmış | Satış oluştur |

### Admin

| Method | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| POST | `/api/admin/reset` | ADMIN | Veritabanını sıfırla |
| POST | `/api/admin/add-junk` | ADMIN | Test verisi ekle |

---

## ⌨️ Klavye Kısayolları (Admin)

| Kısayol | İşlem |
|---|---|
| `Ctrl+Shift+R` | Sistemi sıfırla |
| `Ctrl+Shift+J` | Test verisi ekle |

---

## 📐 Mimari Kararlar

- **Single Responsibility:** `lib/types.ts` tüm interface'leri, `lib/api.ts` tüm HTTP çağrılarını yönetir
- **Rol Tabanlı Yönlendirme:** Login sonrası `role` alanına göre admin `/dashboard`'a, user `/store`'a yönlenir
- **SSR Güvenliği:** Recharts `next/dynamic` ile yüklenir (hydration hatalarını önler)
- **Token Yönetimi:** JWT localStorage'da saklanır; 401 hatalarında otomatik `/login`'e yönlendirilir
