<script setup>
import { RouterLink } from 'vue-router';
import { useProgressStore } from '../stores/progress';

defineProps({ problem: { type: Object, required: true } });
const progress = useProgressStore();
</script>

<template>
  <div class="card">
    <h3>
      <RouterLink :to="`/soal/${problem.id}`">{{ problem.title }}</RouterLink>
    </h3>
    <div class="badges">
      <span class="badge">{{ problem.topic }}</span>
      <span class="badge" :class="`badge-${problem.level.toLowerCase()}`">{{ problem.level }}</span>
      <span v-if="problem.competition" class="badge badge-comp">{{ problem.competition }}</span>
    </div>
    <div class="tag">{{ problem.tags.map((t) => '#' + t).join(' ') }}</div>
    <div v-if="progress.isDone(problem.id)" class="done-mark">✓ Sudah selesai</div>
  </div>
</template>
