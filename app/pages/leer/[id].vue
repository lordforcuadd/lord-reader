<template>
  <div class="min-h-screen bg-black text-zinc-300 font-sans pb-20">
    <nav
      class="fixed top-0 w-full bg-black/90 border-b border-zinc-900 backdrop-blur-md p-4 z-50 flex justify-between items-center px-8"
    >
      <div class="flex items-center gap-4">
        <NuxtLink
          :to="`/manga/${mangaId}`"
          class="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          ✕ Cerrar
        </NuxtLink>
      </div>

      <div class="text-center">
        <span
          class="text-[10px] font-black text-white uppercase tracking-tighter"
        >
          {{
            chapterInfo?.data?.attributes?.chapter
              ? `Capítulo ${chapterInfo.data.attributes.chapter}`
              : "Leyendo..."
          }}
        </span>
      </div>

      <div class="flex gap-4">
        <button
          v-if="prevId"
          @click="navegarA(prevId)"
          class="text-[10px] font-bold uppercase text-zinc-500 hover:text-white"
        >
          « Ant
        </button>
        <button
          v-if="nextId"
          @click="navegarA(nextId)"
          class="text-[10px] font-bold uppercase text-zinc-500 hover:text-white"
        >
          Sig »
        </button>
      </div>
    </nav>

    <main
      class="pt-20 max-w-3xl mx-auto flex flex-col items-center min-h-screen bg-zinc-950"
    >
      <div
        v-if="pending || feedPending"
        class="mt-40 text-sm font-semibold uppercase tracking-widest text-zinc-500 animate-pulse text-center"
      >
        Cargando páginas y sincronizando orden...
      </div>

      <div v-else class="w-full flex flex-col items-center">
        <img
          v-for="(url, index) in paginas"
          :key="index"
          :src="url"
          loading="lazy"
          class="w-full object-contain mb-1"
        />

        <div class="w-full mt-20 mb-32 px-8 flex flex-col items-center gap-10">
          <div class="h-px w-full bg-zinc-900"></div>

          <div class="flex flex-col md:flex-row gap-4 w-full">
            <button
              v-if="prevId"
              @click="navegarA(prevId)"
              class="flex-1 border border-zinc-800 p-6 hover:bg-zinc-900 transition-all text-center group"
            >
              <span
                class="text-[10px] text-zinc-600 uppercase font-black block mb-2"
                >Capítulo Anterior</span
              >
              <span
                class="text-white font-bold group-hover:tracking-widest transition-all italic"
                >← VOLVER</span
              >
            </button>

            <button
              v-if="nextId"
              @click="navegarA(nextId)"
              class="flex-1 bg-white p-6 hover:bg-zinc-200 transition-all text-center group"
            >
              <span
                class="text-[10px] text-zinc-500 uppercase font-black block mb-2 tracking-tighter"
                >Siguiente Capítulo</span
              >
              <span
                class="text-black font-black group-hover:tracking-widest transition-all italic underline"
                >CONTINUAR LEYENDO →</span
              >
            </button>

            <div
              v-else
              class="flex-1 border border-zinc-800 border-dashed p-6 text-center"
            >
              <span
                class="text-[10px] text-zinc-600 uppercase font-black block mb-2 italic"
                >Has llegado al final</span
              >
              <NuxtLink
                :to="`/manga/${mangaId}`"
                class="text-white font-bold uppercase text-xs"
                >Volver a la lista</NuxtLink
              >
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";

const route = useRoute();
const router = useRouter();
const currentId = computed(() => route.params.id);

const user = useSupabaseUser();
const supabase = useSupabaseClient();

const { data, pending } = await useFetch(
  `https://api.mangadex.org/at-home/server/${currentId.value}`,
);

const { data: chapterInfo } = await useFetch(
  `https://api.mangadex.org/chapter/${currentId.value}`,
);

const mangaId = computed(() => {
  return chapterInfo.value?.data?.relationships?.find((r) => r.type === "manga")
    ?.id;
});

const numeroCapitulo = computed(() => {
  return chapterInfo.value?.data?.attributes?.chapter || "0";
});

const { data: mangaInfo } = await useFetch(
  () =>
    mangaId.value ? `https://api.mangadex.org/manga/${mangaId.value}` : null,
  {
    query: { "includes[]": ["cover_art"] },
  },
);

const { data: feedData, pending: feedPending } = await useFetch(
  () =>
    mangaId.value
      ? `https://api.mangadex.org/manga/${mangaId.value}/feed`
      : null,
  {
    query: {
      limit: 500,
      "translatedLanguage[]": [
        chapterInfo.value?.data?.attributes?.translatedLanguage,
      ],
      "order[chapter]": "asc",
    },
  },
);

const neighborChapters = computed(() => {
  if (!feedData.value?.data) return { prev: null, next: null };

  const chapters = feedData.value.data;
  const index = chapters.findIndex((c) => c.id === currentId.value);

  return {
    prev: chapters[index - 1]?.id || null,
    next: chapters[index + 1]?.id || null,
  };
});

const prevId = computed(() => neighborChapters.value.prev);
const nextId = computed(() => neighborChapters.value.next);

const navegarA = (id) => {
  router.push(`/leer/${id}`);
  window.scrollTo({ top: 0, behavior: "instant" });
};

const paginas = computed(() => {
  if (!data.value || !data.value.chapter) return [];
  const baseUrl = data.value.baseUrl;
  const hash = data.value.chapter.hash;
  return data.value.chapter.data.map(
    (archivo) => `${baseUrl}/data/${hash}/${archivo}`,
  );
});

const guardarEnHistorial = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user || !mangaInfo.value?.data) return;

  const manga = mangaInfo.value.data;
  const titulo =
    manga.attributes?.title?.en ||
    manga.attributes?.title?.["ja-ro"] ||
    "Título desconocido";

  const coverRel = manga.relationships?.find((rel) => rel.type === "cover_art");
  const portadaUrl = coverRel?.attributes?.fileName
    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}`
    : "https://via.placeholder.com/400x600/18181b/ffffff?text=X";

  const { error } = await supabase.from("historial").upsert(
    {
      user_id: session.user.id,
      manga_id: manga.id,
      capitulo_id: currentId.value,
      capitulo_numero: String(numeroCapitulo.value),
      titulo_manga: titulo,
      portada_url: portadaUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,manga_id" },
  );

  if (error) {
    console.error("Error de Supabase al guardar historial:", error);
  } else {
    console.log("¡Historial guardado con éxito!");
  }
};

watch(
  mangaInfo,
  (nuevoValor) => {
    if (nuevoValor?.data) {
      guardarEnHistorial();
    }
  },
  { immediate: true },
);
</script>
