import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path:      "/login",
      name:      "login",
      component: () => import("../views/LoginView.vue"),
      meta:      { public: true },
    },
    {
      path:      "/register",
      name:      "register",
      component: () => import("../views/RegisterView.vue"),
      meta:      { public: true },
    }
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) return { name: "login" };
  if (to.meta.public  &&  auth.isAuthenticated) return { name: "explorer" };
});

export default router;