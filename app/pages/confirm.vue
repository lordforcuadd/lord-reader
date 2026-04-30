<template>
  <div
    class="min-h-screen bg-black flex flex-col items-center justify-center p-8"
  >
    <h1
      class="text-2xl font-black text-white tracking-widest uppercase mb-4 animate-pulse"
    >
      Autenticando...
    </h1>
    <p class="text-zinc-500 text-xs font-bold uppercase tracking-widest">
      Preparando tu biblioteca personal
    </p>
  </div>
</template>

<script setup>
import { watch } from "vue";

const user = useSupabaseUser();
const router = useRouter();

watch(
  user,
  () => {
    if (user.value) {
      router.push("/");
    }
  },
  { immediate: true },
);
</script>
