export const ROUTES = {
  HOME: {
    PATH: "/",
    NAME: "menu",
  },
  SIGN_IN: {
    PATH: "/sign-in",
    NAME: "sign-in",
  },
  SIGN_UP: {
    PATH: "/sign-up",
    NAME: "sign-up",
  },
  PIZZA_DETAILS: {
    PATH: "/pizzas/:id",
    NAME: "pizza-details",
  },
  CART: {
    PATH: "/cart",
    NAME: "cart",
  },
  CHECKOUT: {
    PATH: "/checkout",
    NAME: "checkout",
  },
  MY_ORDERS: {
    PATH: "/my-orders",
    NAME: "my-orders",
  },
  MY_ORDERS_DETAILS: {
    PATH: "/my-orders/:id",
    NAME: "my-order-details",
  },
  PROFILE: {
    PATH: "/profile",
    NAME: "profile",
  },
  ADMIN: {
    PATH: "/admin",
    NAME: "admin-dashboard",
  },
  ADMIN_PIZZAS: {
    PATH: "/admin/pizzas",
    NAME: "admin-pizzas",
  },
  ADMIN_PIZZAS_NEW: {
    PATH: "/admin/pizzas/new",
    NAME: "admin-pizza-new",
  },
  ADMIN_PIZZAS_EDIT: {
    PATH: "/admin/pizzas/:id/edit",
    NAME: "admin-pizza-edit",
  },
  ADMIN_ORDERS: {
    PATH: "/admin/orders",
    NAME: "admin-orders",
  },
  ADMIN_USERS: {
    PATH: "/admin/users",
    NAME: "admin-users",
  },
  ADMIN_PROMOCODES: {
    PATH: "/admin/promocodes",
    NAME: "admin-promocodes",
  },
  ADMIN_ANALYTICS: {
    PATH: "/admin/analytics",
    NAME: "admin-analytics",
  },
  ADMIN_PROFILE: {
    PATH: "/admin/profile",
    NAME: "admin-profile",
  },
  NOT_FOUND: {
    PATH: "/:pathMatch(.*)*",
    NAME: "not-found",
  },
} as const;
