<script setup>
import { RouterLink } from 'vue-router';
import { useProgressStore } from '../stores/progress';

defineProps({ problem: { type: Object, required: true } });
const progress = useProgressStore();
</script>

<template>
  <div class="card">
    <!-- PERBAIKAN: Mengubah h3 menjadi h2 dan menambahkan style underline -->
    <h2>
      <RouterLink :to="`/soal/${problem.id}`" style="text-decoration: underline;">{{ problem.title }}</RouterLink>
    </h2>
    <div class="badges">
      <span class="badge">{{ problem.topic }}</span>
      <span class="badge" :class="`badge-${problem.level.toLowerCase()}`">{{ problem.level }}</span>
      <span v-if="problem.competition" class="badge badge-comp">{{ problem.competition }}</span>
    </div>
    <div class="tag">{{ problem.tags.map((t) => '#' + t).join(' ') }}</div>
    <div v-if="progress.isDone(problem.id)" class="done-mark">✓ Sudah selesai</div>
  </div>
</template>