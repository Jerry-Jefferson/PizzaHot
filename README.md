# 🍕 PizzaHot — Enterprise Microservices Monorepo

[![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-4.0-FF6600?style=flat-square&logo=rabbitmq)](https://www.rabbitmq.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**PizzaHot** is an enterprise-grade, high-performance NestJS microservices platform designed for modern pizza ordering and delivery operations. Built with ES Modules (ESM), RabbitMQ messaging, PostgreSQL, MongoDB, and Docker containerization, it demonstrates decoupled microservice architecture, shared monorepo libraries, domain-driven contracts, and comprehensive unit testing.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Running with Docker Compose](#running-with-docker-compose)
  - [Local Development Setup](#local-development-setup)
- [Microservices Breakdown](#-microservices-breakdown)
- [Shared Libraries](#-shared-libraries)
- [Scripts & Commands](#-scripts--commands)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [API Documentation](#-api-documentation)

---

## ✨ Features

- 🔐 **Identity & Access Management**: Secure JWT authentication, user registration with email verification, role-based access control (RBAC), and password reset workflows.
- 🍕 **Dynamic Product Catalog**: Manage pizzas, customizable crusts, sizes, ingredients, categories, and product image uploads.
- 🛒 **Real-Time Shopping Cart**: Customer cart management, ingredient add-ons, dynamic price recalculation, and stock validation.
- 📦 **Order Lifecycle & Dispatch**: Order placement, status tracking (`PENDING`, `IN_PROGRESS`, `DELIVERED`, `CANCELLED`), delivery details, and price verification.
- 🎟️ **Promocode & Discount Engine**: Percentage and flat-rate discount codes, usage limits, date validation, and minimum order requirements.
- 📊 **Analytics & Reporting**: Sales metrics calculation, order volume tracking, popular pizza statistics, and revenue aggregated reports.
- ✉️ **Notification Service**: Asynchronous transactional email dispatch (welcome emails, order confirmations, password reset tokens) powered by Nodemailer.
- 📜 **Centralized Audit Logging**: Asynchronous audit logging and system error tracking stored in MongoDB.
- 🛡️ **API Gateway**: Unified HTTP REST entrypoint featuring Swagger documentation, request rate limiting, authentication guards, and file upload routing.

---

## 🛠️ Tech Stack

- **Core Framework**: [NestJS v11](https://nestjs.com/) (Node.js ESM)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **Messaging Broker**: [RabbitMQ 4.0](https://www.rabbitmq.com/) (AMQP RPC & Event Pub/Sub)
- **Relational Storage**: [PostgreSQL 17](https://www.postgresql.org/) via [TypeORM](https://typeorm.io/)
- **Document Storage**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Mail Server**: [Mailhog](https://github.com/mailhog/MailHog) (Dev SMTP mock & UI)
- **Documentation**: [Swagger / OpenAPI 3.0](https://swagger.io/)
- **Containerization**: Docker & Docker Compose
- **Testing**: [Jest 30](https://jestjs.io/) with Native ESM support (`ts-jest`)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Docker & Docker Compose**: Latest version

---

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Adjust default settings in `.env` if necessary:
   ```env
   PORT=3000
   NODE_ENV=development

   # Postgres Database
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=user_name
   POSTGRES_PASSWORD=password
   POSTGRES_DB=db_name

   # RabbitMQ
   RABBITMQ_USER=guest
   RABBITMQ_PASSWORD=guest
   RABBITMQ_PORT=5672
   RABBITMQ_MANAGEMENT_PORT=15672
   RABBITMQ_URL=amqp://guest:guest@localhost:5672

   # MongoDB
   MONGO_HOST=localhost
   MONGO_PORT=27018
   MONGO_INITDB_ROOT_USERNAME=user_name
   MONGO_INITDB_ROOT_PASSWORD=password
   MONGO_INITDB_DATABASE=db_name

   # JWT Security
   JWT_SECRET=your-secret-key
   JWT_EXPIRATION=1d

   # SMTP / Email Setup
   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_FROM=no-reply@pizzahot.local
   ```

---

### Running with Docker Compose

Spin up the full infrastructure stack (Databases, RabbitMQ, Mailhog, and all Microservices):

```bash
docker-compose up --build -d
```

Check the status of running containers:

```bash
docker-compose ps
```

To stop all services:

```bash
docker-compose down -v
```

---

### Local Development Setup

If you prefer running databases in Docker while developing microservices locally:

1. **Start infrastructure services only**:
   ```bash
   docker-compose up -d pgdb mongodb rabbitmq mailhog
   ```

2. **Install node dependencies**:
   ```bash
   npm install
   ```

3. **Run database migrations** (Identity Service):
   ```bash
   npm run migration:run
   ```

4. **Build the applications**:
   ```bash
   npm run build
   ```

---

## 🧩 Microservices Breakdown

| Service Name | Description | Database / Transport | Key Responsibilities |
|---|---|---|---|
| `api-gateway` | HTTP Gateway | Express / RMQ RPC | REST APIs, Auth Guards, Rate Limiting, File Uploads, Swagger |
| `identity-service` | User & Auth | PostgreSQL (TypeORM) | Authentication, Registrations, Password Resets, User Roles |
| `catalog-service` | Catalog Management | PostgreSQL (TypeORM) | Pizzas, Crusts, Sizes, Ingredients, Stock levels |
| `cart-service` | Cart Management | PostgreSQL (TypeORM) | Active carts, custom pizza toppings, price totals |
| `order-service` | Order Processing | PostgreSQL (TypeORM) | Order creation, status updates, delivery information |
| `promocode-service` | Discounts | PostgreSQL (TypeORM) | Promo code validation, discount application |
| `analytics-service` | Business Intelligence | PostgreSQL (TypeORM) | Order aggregations, revenue metrics, sales reports |
| `notification-service` | Email Dispatcher | Mailhog / Nodemailer | Transactional emails (Welcome, Password Reset, Order Status) |
| `log-service` | Audit Logging | MongoDB (Mongoose) | System audit trails, exception logging |

---

## 📚 Shared Libraries

The platform relies on modular shared libraries located in `src/libs/`:

- **`libs/contracts`**: Single source of truth for microservice communication. Contains message patterns (`RABBITMQ_PATTERNS`), request/response DTOs, and event payloads.
- **`libs/auth`**: Reusable JwtAuthGuard, RolesGuard, `@Roles()` decorator, and `@CurrentUser()` context provider.
- **`libs/database`**: Centralized TypeORM connection options for PostgreSQL and Mongoose connection helpers for MongoDB.
- **`libs/messaging`**: High-level wrapper for NestJS RMQ ClientProxy and Custom RabbitMQ Exception Filters.
- **`libs/price-calculation`**: Domain utility ensuring consistent price calculations across Cart, Catalog, and Order services.
- **`libs/swagger`**: Unified OpenAPI documentation setup helper for NestJS REST controllers.

---

## 📜 Scripts & Commands

All standard commands are defined in `package.json`:

```bash
# Build all applications
npm run build

# Code Quality & Formatting
npm run lint         # Run ESLint with auto-fix
npm run format       # Run Prettier on src/ and test/

# Database Migrations (Identity Service)
npm run migration:run     # Run pending TypeORM migrations
npm run migration:revert  # Revert last migration

# Unit Testing (Native ESM Mode)
npm test                  # Run all unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Generate code coverage report

# End-to-End Testing
npm run test:e2e          # Run E2E test suite
```

---

## 🧪 Testing & Quality Assurance

The project enforces high test coverage standards across all service layers:

- **ESM Test Runner**: Tests run using `--experimental-vm-modules` to support native Node.js ES Modules.
- **Coverage Thresholds**:
  - **Statements**: ≥ 90%
  - **Branches**: ≥ 73%
  - **Functions**: ≥ 85%
  - **Lines**: ≥ 90%

To generate and view the coverage report:
```bash
npm run test:cov
```

---

## 🌐 API Documentation & Port Reference

When the services are up and running, access the web portals below:

- **REST API & Swagger Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **RabbitMQ Management Dashboard**: [http://localhost:15672](http://localhost:15672) *(Credentials: `guest` / `guest`)*
- **Mailhog Web UI (Emails)**: [http://localhost:8025](http://localhost:8025)
- **PostgreSQL Database**: `localhost:5432`
- **MongoDB Database**: `localhost:27018`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
