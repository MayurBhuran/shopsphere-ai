# ShopSphere AI 🛍️

### Personalized Shopping, Powered by Intelligence

ShopSphere AI is a modern, responsive e-commerce web application built with Next.js and React. It provides personalized product recommendations, intelligent product discovery, a conversational shopping assistant, and an admin dashboard.

The project focuses on creating a smarter shopping experience using customer activity signals and a rule-based recommendation engine.

**Live Demo:** https://shopsphere-ai-phi.vercel.app

**GitHub Repository:** https://github.com/MayurBhuran/shopsphere-ai

---

## 🚀 Key Features

### 1. Product Discovery
- Browse products from multiple categories.
- Search products by name, brand, description and tags.
- Filter and sort products.
- View detailed product information.
- Compare products.
- Explore related and similar products.

### 2. Shopping Cart
- Add and remove products.
- Increase or decrease product quantities.
- Stock availability validation.
- Save products for later.
- Apply discount coupons.
- Calculate subtotal, shipping and tax.

### 3. Wishlist
- Add and remove favourite products.
- Move wishlist products to cart.
- View wishlist-based recommendations.

### 4. AI Recommendation Engine
A rule-based recommendation engine that uses shopping activity signals to personalize product suggestions.

**Recommendation strategies:**
- Recently Viewed
- Similar Products
- Category-Based
- Price-Based
- Wishlist-Based
- Cart-Based
- Frequently Bought Together
- Trending Products
- Personalized For You

The engine uses weighted scoring and explainable recommendation labels.

### 5. AI Shopping Assistant
- Conversational shopping interface.
- Understands product search requests.
- Supports category and price-based queries.
- Supports rating and brand preferences.
- Suggests relevant products.
- Maintains chat history.

The assistant uses rule-based intent processing without requiring a paid LLM API.

### 6. User Account
- User registration and login.
- Profile management.
- Delivery address management.
- Order history.
- Recently viewed products.
- Wishlist management.
- Recommendation preference management.

### 7. Order Management
- Simulated checkout process.
- Multiple demo payment options.
- Order placement and confirmation.
- Order tracking.
- Order status history.

### 8. Admin Dashboard
- Dashboard overview and simulated revenue metrics.
- Product management (add, edit and delete).
- Inventory and stock management.
- Category management.
- Customer management.
- Order management.
- Review management.
- Recommendation analytics.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework and routing |
| React.js | User interface |
| JavaScript | Application logic |
| Tailwind CSS | Styling and responsive design |
| Zustand | Global state management |
| TanStack Query | Server-state and data fetching support |
| Lucide React | Icons |
| DummyJSON API | Demo product data |
| LocalStorage | Demo persistence |
| Vercel | Deployment |
| Git & GitHub | Version control |

---

## 🧠 Recommendation Engine Architecture

The recommendation engine follows a modular architecture:

**User Activity → Recommendation Hook → Recommendation Service → Recommendation Provider → Mock Recommendation Engine → Recommended Products**

Shopping signals include:
- Recently viewed products.
- Search history.
- Wishlist activity.
- Cart activity.
- Category preferences.
- Price preferences.

A weighted scoring approach ranks relevant products and supports explainable recommendations.

---

## 📁 Project Structure

```text
shopsphere-ai/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── compare/
│   │   ├── login/
│   │   ├── orders/
│   │   ├── product/
│   │   ├── register/
│   │   ├── search/
│   │   ├── wishlist/
│   │   ├── layout.js
│   │   └── page.js
│   │
│   ├── component/
│   │   ├── layout/
│   │   └── products/
│   │
│   ├── features/
│   │   ├── account/
│   │   ├── assistant/
│   │   └── recommendations/
│   │
│   ├── services/
│   └── store/
│
├── package.json
└── README.md
```

---

## ⚙️ Installation and Setup

### Prerequisites
- Node.js
- npm
- Git
- Visual Studio Code (recommended)

### 1. Clone the repository

```bash
git clone https://github.com/MayurBhuran/shopsphere-ai.git
```

### 2. Navigate to the project folder

```bash
cd shopsphere-ai
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the application

Visit:

```text
http://localhost:3000
```

### 6. Create a production build

```bash
npm run build
```

---

## 🌐 Deployment

The application is deployed using Vercel.

**Live Application:** https://shopsphere-ai-phi.vercel.app

---

## 🔐 Demo and Data Notes

- This is a frontend-focused demonstration project.
- Authentication and application data use browser LocalStorage.
- Admin access is intended for demonstration purposes.
- Product catalogue data is retrieved from DummyJSON.
- Checkout and payments are simulated.
- No real payment gateway or production backend is connected.
- Data stored in one browser does not automatically synchronize with another browser or device.

Do not use real passwords or payment details in this demo.

---

## 🎯 Project Objective

The objective of ShopSphere AI is to demonstrate how modern frontend technologies can be used to build an intelligent e-commerce experience with personalized recommendations, product discovery, shopping assistance and administrative controls.

---

## 👨‍💻 Author

**Mayur Santosh Burhan**

B.Tech – Computer Engineering

GitHub: https://github.com/MayurBhuran

---

## 📄 License

This project is developed as an internship project and demonstration application.