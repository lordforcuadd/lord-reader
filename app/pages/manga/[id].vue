<template>
  <div class="min-h-screen p-8 bg-black text-zinc-300 font-sans relative">
    <div
      v-if="notificacion.visible"
      class="fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-sm border flex items-center gap-3 transition-all duration-300"
      :class="
        notificacion.tipo === 'error'
          ? 'bg-red-950/90 border-red-900 text-red-200'
          : 'bg-zinc-900/90 border-zinc-700 text-white'
      "
    >
      <span class="text-xs font-bold uppercase tracking-widest">{{
        notificacion.mensaje
      }}</span>
    </div>

    <nav class="mb-8">
      <NuxtLink
        to="/"
        class="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
      >
        <span>← Volver al catálogo</span>
      </NuxtLink>
    </nav>

    <main v-if="mangaData" class="max-w-5xl mx-auto">
      <div class="flex flex-col md:flex-row gap-8 mb-16">
        <div class="w-full md:w-1/3 flex-shrink-0">
          <img
            :src="getCoverUrl(mangaData.data)"
            :alt="tituloManga"
            class="w-full rounded-sm border border-zinc-800 shadow-2xl"
          />
        </div>

        <div class="w-full md:w-2/3 flex flex-col justify-center">
          <h1
            class="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter italic"
          >
            {{ tituloManga }}
          </h1>

          <div class="mb-6">
            <button
              @click="toggleFavorito"
              :disabled="cargandoFavorito"
              class="flex items-center gap-2 px-4 py-2 border transition-all duration-300 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              :class="
                esFavorito
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-500 hover:text-white'
              "
            >
              <span>{{
                esFavorito ? "❤️ En tu biblioteca" : "🤍 Añadir a favoritos"
              }}</span>
            </button>
          </div>

          <div
            class="flex flex-wrap gap-6 mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-sm"
          >
            <div class="flex flex-col">
              <span
                class="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1"
                >Estado</span
              >
              <span
                class="text-sm font-black tracking-wide"
                :class="colorEstado"
                >{{ estadoManga }}</span
              >
            </div>
            <div class="flex flex-col border-l border-zinc-800 pl-6">
              <span
                class="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1"
                >Último Cap.</span
              >
              <span class="text-sm font-bold text-white">{{
                ultimoCapitulo
              }}</span>
            </div>
          </div>

          <div class="mb-6">
            <span
              class="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-2"
              >Sinopsis</span
            >
            <p
              class="text-zinc-400 text-sm leading-relaxed whitespace-pre-line border-l-2 border-zinc-700 pl-4"
            >
              {{ sinopsis }}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div
          class="flex justify-between items-center mb-6 border-b border-zinc-800 pb-2"
        >
          <h2 class="text-xl font-bold text-white uppercase tracking-widest">
            Capítulos
          </h2>

          <div class="flex gap-4">
            <button
              @click="ordenAscendente = !ordenAscendente"
              class="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              {{
                ordenAscendente
                  ? "Ver últimos primero ↓"
                  : "Ver desde el inicio ↑"
              }}
            </button>

            <button
              @click="irAlPrimerCapitulo"
              class="bg-zinc-500 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-600 transition-colors"
            >
              Empezar a leer
            </button>
          </div>
        </div>

        <div
          v-if="capitulosPending"
          class="text-sm font-semibold uppercase text-zinc-500 animate-pulse"
        >
          Sincronizando feed...
        </div>
        <div
          v-else-if="!capitulosFiltrados.length"
          class="text-zinc-500 text-sm italic"
        >
          Aún no hay capítulos listados para este manga.
        </div>

        <div v-else class="flex flex-col gap-2">
          <NuxtLink
            v-for="cap in capitulosFiltrados"
            :key="cap.id"
            :to="cap.attributes.externalUrl || `/leer/${cap.id}`"
            :target="cap.attributes.externalUrl ? '_blank' : '_self'"
            class="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 hover:border-white transition-colors group rounded-sm"
          >
            <div class="flex items-center gap-4">
              <span
                class="text-white font-black text-lg w-12 text-center border-r border-zinc-800 pr-4"
                >{{ cap.attributes.chapter || "0" }}</span
              >
              <div class="flex flex-col">
                <span
                  class="text-zinc-400 text-sm group-hover:text-white transition-colors line-clamp-1"
                  >{{ cap.attributes.title || "Capítulo sin título" }}</span
                >
                <span
                  class="text-[10px] font-bold uppercase tracking-widest"
                  :class="
                    cap.attributes.translatedLanguage === 'es' ||
                    cap.attributes.translatedLanguage === 'es-la'
                      ? 'text-blue-500'
                      : 'text-zinc-600'
                  "
                >
                  Idioma: {{ cap.attributes.translatedLanguage }}
                </span>
              </div>
            </div>
            <div
              class="text-xs font-bold uppercase transition-colors"
              :class="
                cap.attributes.externalUrl
                  ? 'text-blue-500 group-hover:text-blue-400'
                  : 'text-zinc-700 group-hover:text-white'
              "
            >
              {{ cap.attributes.externalUrl ? "Oficial ↗" : "Leer →" }}
            </div>
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const route = useRoute();
const mangaId = route.params.id;
const router = useRouter();
const supabase = useSupabaseClient();
const esFavorito = ref(false);
const cargandoFavorito = ref(false);

const notificacion = ref({ visible: false, mensaje: "", tipo: "success" });
let timeoutNotificacion = null;

const mostrarNotificacion = (mensaje, tipo = "success") => {
  if (timeoutNotificacion) clearTimeout(timeoutNotificacion);
  notificacion.value = { visible: true, mensaje, tipo };
  timeoutNotificacion = setTimeout(() => {
    notificacion.value.visible = false;
  }, 3000);
};

// CORRECCIÓN: Usamos el proxy /api/mangadex para evitar el error de CORS
const { data: mangaData } = await useFetch(`/api/mangadex/manga/${mangaId}`, {
  query: { "includes[]": ["cover_art"] },
});

// CORRECCIÓN: Usamos el proxy /api/mangadex para el feed de capítulos
const { data: capitulosData, pending: capitulosPending } = await useFetch(
  `/api/mangadex/manga/${mangaId}/feed`,
  {
    query: {
      limit: 500,
      "translatedLanguage[]": ["es-la", "es", "en"],
      "order[chapter]": "desc",
    },
  },
);

const comprobarSiEsFavorito = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return;

  const { data } = await supabase
    .from("favoritos")
    .select("id")
    .eq("manga_id", mangaId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (data) esFavorito.value = true;
};

const toggleFavorito = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    mostrarNotificacion("Inicia sesión en el catálogo para guardar", "error");
    return;
  }

  cargandoFavorito.value = true;
  const userId = session.user.id;

  if (esFavorito.value) {
    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("manga_id", mangaId)
      .eq("user_id", userId);
    if (!error) {
      esFavorito.value = false;
      mostrarNotificacion("Manga eliminado de favoritos");
    }
  } else {
    const { error } = await supabase.from("favoritos").insert({
      user_id: userId,
      manga_id: mangaId,
      titulo: tituloManga.value,
      portada_url: getCoverUrl(mangaData.value?.data),
    });

    if (error) {
      mostrarNotificacion("Error al guardar: " + error.message, "error");
    } else {
      esFavorito.value = true;
      mostrarNotificacion("¡Añadido a tu biblioteca!");
    }
  }

  cargandoFavorito.value = false;
};

onMounted(() => {
  comprobarSiEsFavorito();
});

const ordenAscendente = ref(true);

const capitulosFiltrados = computed(() => {
  if (!capitulosData.value?.data) return [];

  const validChapters = capitulosData.value.data.filter(
    (cap) => cap.attributes.externalUrl || cap.attributes.pages > 0,
  );
  const capitulosUnicos = new Map();

  validChapters.forEach((cap) => {
    const numCapitulo = cap.attributes.chapter || "oneshot";
    const idioma = cap.attributes.translatedLanguage;
    if (!capitulosUnicos.has(numCapitulo)) {
      capitulosUnicos.set(numCapitulo, cap);
    } else {
      const capGuardado = capitulosUnicos.get(numCapitulo);
      if (
        capGuardado.attributes.translatedLanguage === "en" &&
        (idioma === "es" || idioma === "es-la")
      ) {
        capitulosUnicos.set(numCapitulo, cap);
      }
    }
  });

  const lista = Array.from(capitulosUnicos.values());

  return lista.sort((a, b) => {
    const numA = parseFloat(a.attributes.chapter) || 0;
    const numB = parseFloat(b.attributes.chapter) || 0;
    return ordenAscendente.value ? numA - numB : numB - numA;
  });
});

const irAlPrimerCapitulo = () => {
  if (capitulosFiltrados.value.length > 0) {
    const primerCap = ordenAscendente.value
      ? capitulosFiltrados.value[0]
      : capitulosFiltrados.value[capitulosFiltrados.value.length - 1];

    router.push(`/leer/${primerCap.id}`);
  }
};

const sinopsis = computed(
  () =>
    mangaData.value?.data?.attributes?.description?.es ||
    mangaData.value?.data?.attributes?.description?.["es-la"] ||
    mangaData.value?.data?.attributes?.description?.en ||
    "Sinopsis no disponible.",
);
const tituloManga = computed(
  () =>
    mangaData.value?.data?.attributes?.title?.en ||
    mangaData.value?.data?.attributes?.title?.["ja-ro"] ||
    "Título desconocido",
);
const estadoManga = computed(
  () =>
    ({
      ongoing: "En Emisión",
      completed: "Finalizado",
      hiatus: "En Pausa",
      cancelled: "Cancelado",
    })[mangaData.value?.data?.attributes?.status] || "Desconocido",
);
const colorEstado = computed(() => {
  const status = mangaData.value?.data?.attributes?.status;
  return status === "ongoing"
    ? "text-zinc-300"
    : status === "completed"
      ? "text-zinc-500"
      : "text-red-900";
});
const ultimoCapitulo = computed(() =>
  mangaData.value?.data?.attributes?.lastChapter
    ? `Ch. ${mangaData.value.data.attributes.lastChapter}`
    : "En curso",
);

const getCoverUrl = (manga) => {
  const cover = manga?.relationships?.find((rel) => rel.type === "cover_art");
  return cover?.attributes?.fileName
    ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}`
    : "https://via.placeholder.com/400x600/18181b/ffffff?text=X";
};
</script>
