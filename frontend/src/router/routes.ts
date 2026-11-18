import type { RouteRecordRaw } from "vue-router";

import { ROUTES } from "@/utils/constants/routes.constants";

const customerOnly = { layout: "customer", requiresAuth: true } as const;
const admin = { layout: "admin", requiresAuth: true, role: "admin" } as const;

export const routes: RouteRecordRaw[] = [
  {
    path: ROUTES.SIGN_IN.PATH,
    name: ROUTES.SIGN_IN.NAME,
    components: {
      default: () => import("@/views/SignInView.vue"),
      aside: () => import("@/components/auth/SignInHero.vue"),
    },
    meta: { layout: "auth", guestOnly: true, title: "Sign in" },
  },
  {
    path: ROUTES.SIGN_UP.PATH,
    name: ROUTES.SIGN_UP.NAME,
    components: {
      default: () => import("@/views/SignUpView.vue"),
      aside: () => import("@/components/auth/SignUpHero.vue"),
    },
    meta: { layout: "auth", guestOnly: true, title: "Sign up" },
  },
  {
    path: ROUTES.HOME.PATH,
    name: ROUTES.HOME.NAME,
    component: () => import("@/views/MenuView.vue"),
    meta: { layout: "customer", title: "Menu" },
  },
  {
    path: ROUTES.PIZZA_DETAILS.PATH,
    name: ROUTES.PIZZA_DETAILS.NAME,
    component: () => import("@/views/PizzaDetailsView.vue"),
    meta: { layout: "customer", title: "Pizza" },
  },
  {
    path: ROUTES.CART.PATH,
    name: ROUTES.CART.NAME,
    component: () => import("@/views/CartView.vue"),
    meta: { ...customerOnly, title: "Cart" },
  },
  {
    path: ROUTES.CHECKOUT.PATH,
    name: ROUTES.CHECKOUT.NAME,
    component: () => import("@/views/CheckoutView.vue"),
    meta: { ...customerOnly, title: "Checkout" },
  },
  {
    path: ROUTES.MY_ORDERS.PATH,
    name: ROUTES.MY_ORDERS.NAME,
    component: () => import("@/views/MyOrdersView.vue"),
    meta: { ...customerOnly, title: "My orders" },
  },
  {
    path: ROUTES.MY_ORDERS_DETAILS.PATH,
    name: ROUTES.MY_ORDERS_DETAILS.NAME,
    component: () => import("@/views/MyOrderDetailsView.vue"),
    meta: { ...customerOnly, title: "Order details" },
  },
  {
    path: ROUTES.PROFILE.PATH,
    name: ROUTES.PROFILE.NAME,
    component: () => import("@/views/ProfileView.vue"),
    meta: { ...customerOnly, title: "My profile" },
  },
  {
    path: ROUTES.ADMIN.PATH,
    name: ROUTES.ADMIN.NAME,
    component: () => import("@/views/admin/AdminDashboardView.vue"),
    meta: { ...admin, title: "Dashboard" },
  },
  {
    path: ROUTES.ADMIN_PIZZAS.PATH,
    name: ROUTES.ADMIN_PIZZAS.NAME,
    component: () => import("@/views/admin/AdminPizzasView.vue"),
    meta: { ...admin, title: "Pizzas" },
  },
  {
    path: ROUTES.ADMIN_PIZZAS_NEW.PATH,
    name: ROUTES.ADMIN_PIZZAS_NEW.NAME,
    component: () => import("@/views/admin/AdminPizzaFormView.vue"),
    meta: { ...admin, title: "Add New Pizza" },
  },
  {
    path: ROUTES.ADMIN_PIZZAS_EDIT.PATH,
    name: ROUTES.ADMIN_PIZZAS_EDIT.NAME,
    component: () => import("@/views/admin/AdminPizzaFormView.vue"),
    meta: { ...admin, title: "Edit Pizza" },
  },
  {
    path: ROUTES.ADMIN_ORDERS.PATH,
    name: ROUTES.ADMIN_ORDERS.NAME,
    component: () => import("@/views/admin/AdminOrdersView.vue"),
    meta: { ...admin, title: "Orders" },
  },
  {
    path: ROUTES.ADMIN_USERS.PATH,
    name: ROUTES.ADMIN_USERS.NAME,
    component: () => import("@/views/admin/AdminUsersView.vue"),
    meta: { ...admin, title: "Users" },
  },
  {
    path: ROUTES.ADMIN_PROMOCODES.PATH,
    name: ROUTES.ADMIN_PROMOCODES.NAME,
    component: () => import("@/views/admin/AdminPromocodesView.vue"),
    meta: { ...admin, title: "Promo codes" },
  },
  {
    path: ROUTES.ADMIN_ANALYTICS.PATH,
    name: ROUTES.ADMIN_ANALYTICS.NAME,
    component: () => import("@/views/admin/AdminAnalyticsView.vue"),
    meta: { ...admin, title: "Analytics" },
  },
  {
    path: ROUTES.ADMIN_PROFILE.PATH,
    name: ROUTES.ADMIN_PROFILE.NAME,
    component: () => import("@/views/admin/AdminProfileView.vue"),
    meta: { ...admin, title: "Profile" },
  },
  {
    path: ROUTES.NOT_FOUND.PATH,
    name: ROUTES.NOT_FOUND.NAME,
    component: () => import("@/views/NotFoundView.vue"),
    meta: { layout: "customer", title: "Page not found" },
  },
];
