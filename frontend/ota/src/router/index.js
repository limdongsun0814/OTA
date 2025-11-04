import { createRouter, createWebHistory } from "vue-router";
import NotFoundView from "../views/NotFoundView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import MainView from "@/views/MainView.vue";
const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/main",
    name: "main",
    component: MainView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/404",
    name: "notFound",
    component: NotFoundView,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
