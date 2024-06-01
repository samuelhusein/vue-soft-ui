import { createRouter, createWebHistory } from "vue-router";
// import Tables from "@/views/Tables.vue";
// import Billing from "@/views/Billing.vue";
// import VirtualReality from "@/views/VirtualReality.vue";
// import Profile from "@/views/Profile.vue";
// import Rtl from "@/views/Rtl.vue";
// import SignIn from "@/views/SignIn.vue";
// import SignUp from "@/views/SignUp.vue";
// import Users from "@/views/master/Users.vue";
import { getToken } from "@/service/Api.js"; // Import getToken function to check if user is authenticated


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "/",
      redirect: "/dashboard",
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      meta: { requiresAuth: true, requiredRole: ["admin", "user"] },
      component: () => import("@/views/Dashboard.vue"),
    },
    {
      path: "/master/users",
      name: "Users",
      meta: { requiresAuth: true, requiredRole: ["admin"] },
      component: () => import("@/views/master/Users.vue"),
    },
    {
      path: "/master/partner",
      name: "Partners",
      meta: { requiresAuth: true, requiredRole: ["admin"] },
      component: () => import("@/views/master/Partner.vue"),
    },
    {
      path: "/master/channel",
      name: "Channel",
      meta: { requiresAuth: true, requiredRole: ["admin"] },
      component: () => import("@/views/master/Channel.vue"),
    },
    {
      path: "/master/payment-type",
      name: "PaymentType",
      meta: { requiresAuth: true, requiredRole: ["admin"] },
      component: () => import("@/views/master/PaymentType.vue"),
    },
    {
      path: "/master/product",
      name: "Product",
      meta: { requiresAuth: true, requiredRole: ["admin"] },
      component: () => import("@/views/master/Product.vue"),
    },
    {
      path: "/auth/login",
      name: "Login",
      component: () => import("@/views/auth/Login.vue"),
    },
    {
      path: "/auth/register",
      name: "Register",
      component: () => import("@/views/auth/Register.vue"),
    },
    // {
    //   path: "/pages/notfound",
    //   name: "notfound",
    //   component: () => import("@/views/pages/NotFound.vue"),
    // },
    // {
    //   path: "/auth/access",
    //   name: "accessDenied",
    //   component: () => import("@/views/auth/Access.vue"),
    // },
    // {
    //   path: "/auth/error",
    //   name: "error",
    //   component: () => import("@/views/auth/Error.vue"),
    // },
  ],

  linkActiveClass: "active",
});

router.beforeEach((to, from, next) => {
  // Check if the route requires authentication and if the user is not logged in
  if (to.matched.some((record) => record.meta.requiresAuth) && !getToken()) {
      // Redirect to login page if user is not logged in
      next({ name: "login" });
  } else if (!to.matched.length) {
      // Route not found, redirect to not found page
      next({ name: "notfound" });
  } else if (
      to.matched.some((record) => record.meta.requiresAuth) &&
      getToken() && hasPermission(to)
  ) {
      // Check if the user is already logged in and trying to access the login page
      if (to.name === "login") {
          // Redirect to a different page, such as the dashboard
          next(from.fullPath || { name: "dashboard" });
      } else {
          // Continue navigation
          next();
      }
  } else if (
      to.matched.some((record) => record.meta.requiresAuth) &&
      !hasPermission(to)
  ) {
      // User is not authorized to access the route, redirect to access denied page
      next({ name: "accessDenied" });
  } else if (to.matched.some((record) => record.meta.pageError)) {
      // Handle page error, redirect to error page
      next({ name: "error" });
  } else {
      // Continue navigation
      next();
  }
});


function hasPermission(route) {
  // Example: Check if the user has permission based on their role
  const userRole = getUserRole(); // Implement a function to get the user's role
  const requiredRole = route.meta.requiredRole; // Assuming you have a requiredRole meta field in your route
  console.log(userRole);
  // Compare the user's role with the required role for the route
  return requiredRole.includes(userRole);
}

function getUserRole() {
  // Implement a function to get the user's role from your authentication system or store
  // For demonstration purposes, return a hardcoded role
  return "admin";
}


export default router;
