<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const details = ref([]);
const loading = ref(false);

async function submit() {
  error.value = '';
  details.value = [];
  loading.value = true;
  try {
    await auth.register(username.value, email.value, password.value);
    router.push('/');
  } catch (e) {
    error.value = e.message;
    details.value = e.details || [];
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="card form-card" @submit.prevent="submit">
    <h1>Daftar</h1>
    <div v-if="error" class="alert alert-error">
      {{ error }}
      <ul v-if="details.length" class="error-list">
        <li v-for="d in details" :key="d.field">{{ d.message }}</li>
      </ul>
    </div>
    <div class="field">
      <label for="username">Username</label>
      <input id="username" v-model="username" required minlength="3" maxlength="30" autocomplete="username" />
    </div>
    <div class="field">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" required autocomplete="email" />
    </div>
    <div class="field">
      <label for="password">Password (minimal 8 karakter)</label>
      <input id="password" v-model="password" type="password" required minlength="8" autocomplete="new-password" />
    </div>
    <!-- PERBAIKAN: Menambahkan type="submit" pada tombol -->
    <button type="submit" class="btn" :disabled="loading">{{ loading ? 'Memproses…' : 'Daftar' }}</button>
    
    <p class="muted">
      Sudah punya akun? 
      <!-- PERBAIKAN: Menambahkan style underline pada link Masuk -->
      <RouterLink to="/login" style="text-decoration: underline; font-weight: bold;">Masuk</RouterLink>
    </p>
  </form>
</template>