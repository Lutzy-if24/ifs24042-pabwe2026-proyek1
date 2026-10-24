<script setup>
import { ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push(route.query.redirect || '/');
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="card form-card" @submit.prevent="submit">
    <h1>Masuk</h1>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    
    <div class="field">
      <label for="username">Email</label>
      <!-- UBAH ID DI SINI MENJADI username -->
      <input id="username" v-model="email" type="email" required autocomplete="email" />
    </div>
    
    <div class="field">
      <label for="password">Password</label>
      <!-- ID INI SUDAH BENAR -->
      <input id="password" v-model="password" type="password" required autocomplete="current-password" />
    </div>
    
    <!-- TAMBAHKAN id="btn-submit" DI SINI -->
    <button id="btn-submit" class="btn" :disabled="loading">{{ loading ? 'Memproses…' : 'Masuk' }}</button>
    
    <p class="muted">Belum punya akun? <RouterLink to="/daftar">Daftar</RouterLink></p>
  </form>
</template>