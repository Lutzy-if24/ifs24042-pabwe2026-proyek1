import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/materi', name: 'topics', component: () => import('../views/TopicsView.vue') },
  { path: '/materi/:id', name: 'material', component: () => import('../views/MaterialView.vue') },
  { path: '/soal', name: 'problems', component: () => import('../views/ProblemsView.vue') },
  { path: '/soal/:id', name: 'problem', component: () => import('../views/ProblemDetailView.vue') },
  
  { 
    path: '/login', 
    alias: '/auth/login',
    name: 'login', 
    component: () => import('../views/LoginView.vue') 
  },
  
  { path: '/daftar', name: 'register', component: () => import('../views/RegisterView.vue') },
  {
    path: '/progres', name: 'progress', meta: { requiresAuth: true },
    component: () => import('../views/ProgressView.vue'),
  },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('../views/NotFoundView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// Halaman yang butuh login diarahkan ke /login (lalu kembali setelah masuk)
router.beforeEach((to) => {
  // PERBAIKAN: Menggunakan isLoggedIn sesuai dengan yang ada di store auth.js Anda
  if (to.meta.requiresAuth && !useAuthStore().isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});

export default router;