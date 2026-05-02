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
          @click="cambiarServidor()"
          class="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 active:scale-95 text-zinc-200 rounded-lg transition-all text-xs sm:text-sm shadow-md border border-zinc-700"
          title="Cambiar servidor si las imágenes fallan"
        >
          <span class="hidden sm:inline font-medium">Cambiar Servidor</span>
          <span class="inline sm:hidden font-medium">Servidor</span>
        </button>
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
          v-for="(pagina, index) in paginas"
          :key="index"
          :src="pagina"
          @error="manejarErrorImagen"
          class="w-full max-w-3xl mx-auto mb-2"
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

const manejarErrorImagen = (evento) => {
  const img = evento.target;

  if (img.src.includes("/data/")) {
    img.src = img.src.replace("/data/", "/data-saver/");
  } else if (img.src.includes("/data-saver/")) {
    img.src =
      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'%3E%3Crect width='600' height='800' fill='%2318181b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23ef4444'%3EError en el nodo de MangaDex.%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23ef4444'%3EPor favor, usa el boton 'Cambiar Servidor'.%3C/text%3E%3C/svg%3E";
  }
};

const {
  data,
  pending,
  refresh: cambiarServidor,
} = await useFetch(`/api/mangadex/at-home/server/${currentId.value}`, {
  query: {
    t: Date.now(),
    forcePort443: true,
  },
  server: false,
});

const { data: chapterInfo } = await useFetch(
  `/api/mangadex/chapter/${currentId.value}`,
);

const mangaId = computed(() => {
  return chapterInfo.value?.data?.relationships?.find((r) => r.type === "manga")
    ?.id;
});

const numeroCapitulo = computed(() => {
  return chapterInfo.value?.data?.attributes?.chapter || "0";
});

const { data: mangaInfo } = await useFetch(
  () => (mangaId.value ? `/api/mangadex/manga/${mangaId.value}` : null),
  {
    query: { "includes[]": ["cover_art"] },
  },
);

const { data: feedData, pending: feedPending } = await useFetch(
  () => (mangaId.value ? `/api/mangadex/manga/${mangaId.value}/feed` : null),
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
