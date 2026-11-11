import type { RouteRecordRaw } from "vue-router";

const customerOnly = { layout: "customer", requiresAuth: true } as const;
const admin = { layout: "admin", requiresAuth: true, role: "admin" } as const;

export const routes: RouteRecordRaw[] = [
  {
    path: "/sign-in",
    name: "sign-in",
    components: {
      default: () => import("@/views/SignInView.vue"),
      aside: () => import("@/components/auth/SignInHero.vue"),
    },
    meta: { layout: "auth", guestOnly: true },
  },
  {
    path: "/sign-up",
    name: "sign-up",
    components: {
      default: () => import("@/views/SignUpView.vue"),
      aside: () => import("@/components/auth/SignUpHero.vue"),
    },
    meta: { layout: "auth", guestOnly: true },
  },
  {
    path: "/",
    name: "menu",
    component: () => import("@/views/MenuView.vue"),
    meta: { layout: "customer" },
  },
  {
    path: "/pizzas/:id",
    name: "pizza-details",
    component: () => import("@/views/PizzaDetailsView.vue"),
    meta: { layout: "customer" },
  },
  {
    path: "/cart",
    name: "cart",
    component: () => import("@/views/CartView.vue"),
    meta: customerOnly,
  },
  {
    path: "/checkout",
    name: "checkout",
    component: () => import("@/views/CheckoutView.vue"),
    meta: customerOnly,
  },
  {
    path: "/my-orders",
    name: "my-orders",
    component: () => import("@/views/MyOrdersView.vue"),
    meta: customerOnly,
  },
  {
    path: "/my-orders/:id",
    name: "my-order-details",
    component: () => import("@/views/MyOrderDetailsView.vue"),
    meta: customerOnly,
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
    meta: customerOnly,
  },
  {
    path: "/admin",
    name: "admin-dashboard",
    component: () => import("@/views/admin/AdminDashboardView.vue"),
    meta: { ...admin, title: "Dashboard" },
  },
  {
    path: "/admin/pizzas",
    name: "admin-pizzas",
    component: () => import("@/views/admin/AdminPizzasView.vue"),
    meta: { ...admin, title: "Pizzas" },
  },
  {
    path: "/admin/pizzas/new",
    name: "admin-pizza-new",
    component: () => import("@/views/admin/AdminPizzaFormView.vue"),
    meta: { ...admin, title: "Add New Pizza" },
  },
  {
    path: "/admin/pizzas/:id/edit",
    name: "admin-pizza-edit",
    component: () => import("@/views/admin/AdminPizzaFormView.vue"),
    meta: { ...admin, title: "Edit Pizza" },
  },
  {
    path: "/admin/orders",
    name: "admin-orders",
    component: () => import("@/views/admin/AdminOrdersView.vue"),
    meta: { ...admin, title: "Orders" },
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: () => import("@/views/admin/AdminUsersView.vue"),
    meta: { ...admin, title: "Users" },
  },
  {
    path: "/admin/promocodes",
    name: "admin-promocodes",
    component: () => import("@/views/admin/AdminPromocodesView.vue"),
    meta: { ...admin, title: "Promo codes" },
  },
  {
    path: "/admin/analytics",
    name: "admin-analytics",
    component: () => import("@/views/admin/AdminAnalyticsView.vue"),
    meta: { ...admin, title: "Analytics" },
  },
  {
    path: "/admin/profile",
    name: "admin-profile",
    component: () => import("@/views/admin/AdminProfileView.vue"),
    meta: { ...admin, title: "Profile" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { layout: "customer" },
  },
];
