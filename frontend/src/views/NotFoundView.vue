<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="card form-card">
    <h1>Halaman tidak ditemukan</h1>
    <p class="muted">Alamat yang kamu buka tidak ada.</p>
    <RouterLink to="/" class="btn">Kembali ke beranda</RouterLink>
  </div>
</template>
