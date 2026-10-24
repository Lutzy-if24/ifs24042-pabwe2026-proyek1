<script setup>
import { watch, onMounted } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useProgressStore } from './stores/progress';

const auth = useAuthStore();
const progress = useProgressStore();
const router = useRouter();

// Validasi token tersimpan saat aplikasi dibuka
onMounted(() => { if (auth.isLoggedIn) auth.refresh(); });

// Muat progres saat login, kosongkan saat logout
watch(() => auth.isLoggedIn, (loggedIn) => {
  if (loggedIn) progress.load();
  else progress.reset();
}, { immediate: true });

function logout() {
  auth.logout();
  router.push('/');
}
</script>

<template>
  <header class="nav">
    <div class="nav-inner">
      <RouterLink to="/" class="brand">∑ Olimpiade Matematika</RouterLink>
      <nav class="nav-links">
        <RouterLink to="/">Beranda</RouterLink>
        <RouterLink to="/materi">Materi</RouterLink>
        <RouterLink to="/soal">Soal</RouterLink>
        <RouterLink v-if="auth.isLoggedIn" to="/progres">Progres</RouterLink>
      </nav>
      <div class="nav-user">
        <template v-if="auth.isLoggedIn">
          <span class="muted">Halo, {{ auth.user?.username }}</span>
          <button class="btn btn-outline btn-sm" @click="logout">Keluar</button>
        </template>
        <template v-else>
          <!-- PERBAIKAN: Menambahkan warna tegas, font bold, dan underline -->
          <RouterLink to="/login" style="text-decoration: underline; margin-right: 1rem; font-weight: bold; color: #000;">Masuk</RouterLink>
          <RouterLink to="/daftar" class="btn btn-sm" style="text-decoration: underline;">Daftar</RouterLink>
        </template>
      </div>
    </div>
  </header>
  <main class="container">
    <RouterView />
  </main>
</template>