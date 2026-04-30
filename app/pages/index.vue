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

    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-zinc-950 border border-zinc-800 p-8 rounded-sm w-full max-w-sm shadow-2xl"
      >
        <h3
          class="text-white font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4"
        >
          Acceso a Biblioteca
        </h3>

        <input
          v-model="loginEmail"
          type="email"
          placeholder="Tu correo electrónico"
          class="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm mb-4 text-sm focus:border-zinc-500 outline-none transition-colors"
        />
        <input
          v-model="loginPassword"
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          class="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm mb-8 text-sm focus:border-zinc-500 outline-none transition-colors"
        />

        <div class="flex flex-col gap-3">
          <button
            @click="procesarAcceso(false)"
            class="w-full bg-white text-black px-4 py-3 text-xs font-black uppercase tracking-widest rounded-sm hover:bg-zinc-300 transition-colors"
          >
            Iniciar Sesión
          </button>
          <button
            @click="procesarAcceso(true)"
            class="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm hover:border-zinc-500 transition-colors"
          >
            Crear Cuenta Nueva
          </button>
          <button
            @click="cerrarModal"
            class="mt-4 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- CABECERA PRINCIPAL -->
    <header class="mb-8 border-b border-zinc-800 pb-6 flex flex-col gap-6">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div
          @click="limpiarTodo"
          class="text-left group cursor-pointer flex-shrink-0"
          role="button"
        >
          <h1
            class="text-4xl font-black text-white tracking-tight group-hover:text-zinc-400 transition-colors"
          >
            LORD READER
          </h1>
          <p
            class="text-zinc-500 mt-2 text-xs uppercase tracking-widest font-semibold group-hover:text-zinc-400 transition-colors"
          >
            Sin publicidad. Sin límites. Disfrutalo:3
          </p>
        </div>

        <div class="w-full md:w-1/2 lg:w-1/3 relative">
          <input
            v-model="textoBusqueda"
            @keyup.enter="buscar"
            @focus="mostrarHistorial = true"
            @blur="ocultarHistorial"
            type="text"
            placeholder="Buscar un manga (Presiona Enter)..."
            class="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-zinc-400 transition-colors text-sm placeholder-zinc-600"
          />
          <div
            v-if="mostrarHistorial && historialBusquedas.length > 0"
            class="absolute top-full left-0 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-sm shadow-2xl z-40 overflow-hidden"
          >
            <div
              class="px-4 py-2 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center"
            >
              <span
                class="text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                >Búsquedas Recientes</span
              >
              <button
                @click="limpiarHistorial"
                class="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400"
              >
                Limpiar
              </button>
            </div>
            <ul>
              <li
                v-for="(item, index) in historialBusquedas"
                :key="index"
                @mousedown.prevent="aplicarBusquedaHistorial(item)"
                class="px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors flex items-center gap-2"
              >
                <span class="text-zinc-600">◷</span> {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <div class="flex items-center gap-4 flex-shrink-0">
          <ClientOnly>
            <div class="flex items-center">
              <div
                v-if="user"
                class="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-sm"
              >
                <span
                  class="text-xs font-bold text-white uppercase tracking-wider"
                  >{{ nombreUsuarioCorto }}</span
                >
                <button
                  @click="logout"
                  class="text-[10px] font-bold uppercase text-zinc-500 hover:text-red-500 transition-colors ml-2 border-l border-zinc-700 pl-3"
                >
                  Salir
                </button>
              </div>

              <button
                v-else
                @click="mostrarModal = true"
                class="bg-white text-black px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-300 transition-colors shadow-lg"
              >
                Iniciar Sesión
              </button>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- Filtros -->
      <div
        class="flex flex-wrap gap-4 items-center bg-zinc-900/50 p-4 border border-zinc-800/50 rounded-sm"
      >
        <span
          class="text-xs font-bold uppercase tracking-widest text-zinc-500 mr-2"
          >Filtros:</span
        >
        <select
          v-model="filtroGenero"
          @change="aplicarFiltros"
          class="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase px-3 py-2 rounded-sm focus:outline-none focus:border-white cursor-pointer"
        >
          <option value="">Géneros</option>
          <option value="391b0423-d847-456f-aff0-8b0cfc03066b">Acción</option>
          <option value="423e2eae-a7a2-4a8b-ac03-a8351462d71d">Romance</option>
          <option value="4d32cc48-9f00-4cca-9b5a-a839f0764984">Comedia</option>
          <option value="cdc58593-87dd-415e-bbc0-2ec27bf404cc">Fantasía</option>
          <option value="ace04997-f6aa-4b62-9722-f28ffcc10a18">Isekai</option>
          <option value="256c8bd9-4904-4360-bf4f-508a76d67183">
            Ciencia Ficción
          </option>
        </select>
        <select
          v-model="filtroContenido"
          @change="aplicarFiltros"
          class="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase px-3 py-2 rounded-sm focus:outline-none focus:border-white cursor-pointer"
        >
          <option value="safe">Contenido: Safe</option>
          <option value="suggestive">Contenido: +15</option>
          <option value="safe,suggestive,erotica">Contenido: +18</option>
          <option value="safe,suggestive,erotica,pornographic">
            Sin Filtros
          </option>
        </select>
        <select
          v-model="filtroEstado"
          @change="aplicarFiltros"
          class="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase px-3 py-2 rounded-sm focus:outline-none focus:border-white cursor-pointer"
        >
          <option value="">Estado: Todos</option>
          <option value="ongoing">Emisión</option>
          <option value="completed">Finalizado</option>
        </select>
        <button
          @click="limpiarTodo"
          class="ml-auto text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-2 border border-zinc-800 hover:border-zinc-500 px-3 py-2 transition-all rounded-sm"
        >
          <span>✕</span> Limpiar Todo
        </button>
      </div>
    </header>

    <main>
      <ClientOnly>
        <!--HISTORIAL-->
        <section
          v-if="
            user &&
            busquedaActiva === '' &&
            (cargandoHistorial || miHistorial.length > 0)
          "
          class="mb-16"
        >
          <h2
            class="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-4"
          >
            Continuar Lectura <span class="h-px bg-zinc-900 flex-grow"></span>
          </h2>

          <div
            v-if="cargandoHistorial"
            class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          >
            <div
              v-for="n in 4"
              :key="n"
              class="min-w-[280px] bg-zinc-900 border border-zinc-800 p-3 rounded-sm flex gap-4 animate-pulse"
            >
              <div class="w-16 h-20 bg-zinc-800 rounded-sm"></div>
              <div class="flex flex-col justify-center gap-3 flex-grow">
                <div class="h-3 bg-zinc-800 rounded-sm w-3/4"></div>
                <div class="h-2 bg-zinc-800 rounded-sm w-1/2"></div>
                <div class="h-2 bg-zinc-800 rounded-sm w-1/3 mt-1"></div>
              </div>
            </div>
          </div>

          <div v-else class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <div
              v-for="item in miHistorial"
              :key="item.id"
              class="min-w-[280px] bg-zinc-900 border border-zinc-800 p-3 rounded-sm flex gap-4 hover:border-zinc-500 transition-colors group relative overflow-hidden"
            >
              <img
                :src="item.portada_url"
                class="w-16 h-20 object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all"
              />
              <div class="flex flex-col justify-center">
                <h3
                  class="text-[10px] font-black text-white uppercase truncate w-40"
                >
                  {{ item.titulo_manga }}
                </h3>
                <p
                  class="text-[9px] text-zinc-400 mt-1 uppercase tracking-widest"
                >
                  Retomar Cap. {{ item.capitulo_numero }}
                </p>
                <NuxtLink
                  :to="`/leer/${item.capitulo_id}`"
                  class="text-[9px] font-black text-zinc-500 mt-2 uppercase hover:text-zinc-300 transition-colors"
                >
                  Continuar Lectura →
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>

        <!-- FAVORITOS -->
        <section
          v-if="
            user &&
            busquedaActiva === '' &&
            (cargandoFavoritos || misFavoritos.length > 0)
          "
          class="mb-16"
        >
          <div class="flex justify-between items-center mb-6">
            <h2
              class="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-4"
            >
              Mis Favoritos
              <span class="h-px bg-zinc-900 w-12 hidden md:block"></span>
            </h2>
            <span
              v-if="!cargandoFavoritos"
              class="text-[9px] font-bold uppercase tracking-widest text-zinc-600"
              >{{ misFavoritos.length }} guardados</span
            >
          </div>

          <div
            v-if="cargandoFavoritos"
            class="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory"
          >
            <div
              v-for="n in 6"
              :key="n"
              class="min-w-[140px] md:min-w-[180px] h-48 md:h-64 bg-zinc-900 border border-zinc-800 rounded-sm animate-pulse snap-start"
            ></div>
          </div>

          <div
            v-else
            class="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory"
          >
            <div
              v-for="fav in misFavoritos"
              :key="fav.id"
              class="min-w-[140px] md:min-w-[180px] snap-start group relative bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden flex flex-col hover:border-zinc-700 transition-all duration-300"
            >
              <div class="relative w-full h-48 md:h-64 overflow-hidden">
                <img
                  :src="fav.portada_url"
                  class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"
                ></div>
              </div>
              <div
                class="absolute bottom-0 w-full p-3 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              >
                <h3
                  class="text-[10px] md:text-xs font-bold text-white line-clamp-2 mb-2"
                >
                  {{ fav.titulo }}
                </h3>
                <NuxtLink
                  :to="`/manga/${fav.manga_id}`"
                  class="opacity-0 group-hover:opacity-100 text-[9px] font-black uppercase tracking-widest text-white transition-opacity bg-white/10 backdrop-blur-md py-2 px-3 text-center rounded-sm border border-white/20 hover:bg-white hover:text-black"
                >
                  Ver Ficha
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>
      </ClientOnly>
      <!-- Errores API -->
      <div
        v-if="fetchError"
        class="bg-zinc-900 border border-red-900 text-red-500 p-4 rounded-sm text-sm mb-6"
      >
        Error al cargar MangaDex: {{ fetchError?.message }}
      </div>

      <div
        v-if="pending"
        class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        <div
          v-for="n in 12"
          :key="n"
          class="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden animate-pulse"
        >
          <div class="w-full h-64 bg-zinc-800"></div>
          <div class="p-4 flex flex-col gap-3">
            <div class="h-3 bg-zinc-800 rounded-full w-3/4"></div>
            <div class="h-8 bg-zinc-800 rounded-sm w-full mt-2"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!response?.data?.length"
        class="text-center py-20 border border-zinc-800 border-dashed rounded-sm"
      >
        <p class="text-zinc-500 font-bold uppercase tracking-widest">
          No hay resultados con estos filtros.
        </p>
        <button
          @click="limpiarTodo"
          class="mt-4 px-4 py-2 bg-white text-black text-xs font-bold uppercase rounded-sm hover:bg-zinc-300 transition-colors"
        >
          Resetear Buscador
        </button>
      </div>

      <!-- GENERAL -->
      <section v-else>
        <h2
          v-if="user"
          class="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-4"
        >
          Explorar Catálogo <span class="h-px bg-zinc-900 flex-grow"></span>
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div
            v-for="manga in response.data"
            :key="manga.id"
            class="bg-zinc-900 border border-zinc-800 hover:border-zinc-500 transition-colors flex flex-col overflow-hidden rounded-sm relative"
          >
            <span
              v-if="manga.attributes.contentRating !== 'safe'"
              class="absolute top-2 right-2 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm bg-red-900/90 text-white backdrop-blur-sm z-10"
            >
              {{ manga.attributes.contentRating }}
            </span>
            <img
              :src="getCoverUrl(manga)"
              :alt="manga?.attributes?.title?.en || 'Portada'"
              class="w-full h-64 object-cover"
            />
            <div class="p-4 flex flex-col flex-grow justify-between">
              <h2 class="text-sm font-bold mb-1 text-white line-clamp-2">
                {{
                  manga?.attributes?.title?.en ||
                  manga?.attributes?.title?.["ja-ro"] ||
                  "Título desconocido"
                }}
              </h2>
              <NuxtLink
                :to="`/manga/${manga.id}`"
                class="w-full mt-4 bg-white hover:bg-zinc-300 text-black py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm text-center block"
              >
                Ver Detalles
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- PAGINACIÓN -->
      <div
        class="mt-10 flex justify-center items-center gap-4 border-t border-zinc-800 pt-6"
      >
        <button
          @click="paginaAnterior"
          :disabled="pagina === 1 || pending"
          class="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase disabled:opacity-30 rounded-sm hover:border-zinc-500 transition-colors"
        >
          Anterior
        </button>
        <span class="text-zinc-500 text-xs font-bold uppercase tracking-widest"
          >Página {{ pagina }}</span
        >
        <button
          @click="paginaSiguiente"
          :disabled="pending || response?.data?.length < limite"
          class="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase disabled:opacity-30 rounded-sm hover:border-zinc-500 transition-colors"
        >
          Siguiente
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const notificacion = ref({ visible: false, mensaje: "", tipo: "success" });
let timeoutNotificacion = null;

const mostrarNotificacion = (mensaje, tipo = "success") => {
  if (timeoutNotificacion) clearTimeout(timeoutNotificacion);
  notificacion.value = { visible: true, mensaje, tipo };
  timeoutNotificacion = setTimeout(() => {
    notificacion.value.visible = false;
  }, 3000);
};

const nombreUsuarioCorto = computed(() => {
  if (!user.value || !user.value.email) return "Usuario";
  return user.value.email.split("@")[0];
});

const mostrarModal = ref(false);
const loginEmail = ref("");
const loginPassword = ref("");

const cerrarModal = () => {
  mostrarModal.value = false;
  loginEmail.value = "";
  loginPassword.value = "";
};

const procesarAcceso = async (esRegistro) => {
  if (!loginEmail.value || !loginPassword.value) {
    mostrarNotificacion("Por favor completa todos los campos", "error");
    return;
  }

  if (esRegistro) {
    const { error } = await supabase.auth.signUp({
      email: loginEmail.value,
      password: loginPassword.value,
    });
    if (error) mostrarNotificacion(error.message, "error");
    else {
      mostrarNotificacion("Cuenta creada con éxito");
      cerrarModal();
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.value,
      password: loginPassword.value,
    });
    if (error) mostrarNotificacion("Credenciales incorrectas", "error");
    else {
      mostrarNotificacion("¡Bienvenido de vuelta!");
      cerrarModal();
    }
  }
};

const logout = async () => {
  await supabase.auth.signOut();
  misFavoritos.value = [];
  miHistorial.value = [];
  mostrarNotificacion("Has cerrado sesión");
};

const misFavoritos = useState("memoria_favoritos", () => []);
const miHistorial = useState("memoria_historial", () => []);

const cargandoFavoritos = ref(misFavoritos.value.length === 0);
const cargandoHistorial = ref(miHistorial.value.length === 0);

const cargarMisFavoritos = async () => {
  if (!user.value) return;

  if (misFavoritos.value.length === 0) cargandoFavoritos.value = true;

  const { data, error } = await supabase
    .from("favoritos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) mostrarNotificacion("Error cargando favoritos", "error");
  else if (data) misFavoritos.value = data;

  cargandoFavoritos.value = false;
};

const cargarHistorial = async () => {
  if (!user.value) return;

  if (miHistorial.value.length === 0) cargandoHistorial.value = true;

  const { data } = await supabase
    .from("historial")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(15);

  if (data) {
    const historialActivo = [];
    await Promise.all(
      data.map(async (item) => {
        try {
          const feedRes = await $fetch(
            `https://api.mangadex.org/manga/${item.manga_id}/feed`,
            {
              query: {
                limit: 1,
                "translatedLanguage[]": ["es-la", "es", "en"],
                "order[chapter]": "desc",
              },
            },
          );
          const ultimoPublicado = feedRes.data?.[0];
          if (ultimoPublicado) {
            const numUltimo =
              parseFloat(ultimoPublicado.attributes.chapter) || 0;
            const numLeido = parseFloat(item.capitulo_numero) || 0;
            if (numLeido < numUltimo) historialActivo.push(item);
          } else {
            historialActivo.push(item);
          }
        } catch (e) {
          historialActivo.push(item);
        }
      }),
    );

    historialActivo.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
    );
    miHistorial.value = historialActivo.slice(0, 4);
  }

  cargandoHistorial.value = false;
};

watch(
  user,
  () => {
    if (user.value) {
      cargarMisFavoritos();
      cargarHistorial();
    }
  },
  { immediate: true },
);

const pagina = ref(1);
const limite = 12;
const textoBusqueda = ref("");
const busquedaActiva = ref("");
const filtroContenido = ref("safe");
const filtroEstado = ref("");
const filtroGenero = ref("");
const historialBusquedas = ref([]);
const mostrarHistorial = ref(false);

onMounted(() => {
  const savedContenido = localStorage.getItem("miLector_filtroContenido");
  if (savedContenido) filtroContenido.value = savedContenido;
  const savedEstado = localStorage.getItem("miLector_filtroEstado");
  if (savedEstado) filtroEstado.value = savedEstado;
  const savedGenero = localStorage.getItem("miLector_filtroGenero");
  if (savedGenero) filtroGenero.value = savedGenero;
  const savedHistorial = localStorage.getItem("miLector_historial");
  if (savedHistorial) historialBusquedas.value = JSON.parse(savedHistorial);
});

watch(filtroContenido, (newVal) =>
  localStorage.setItem("miLector_filtroContenido", newVal),
);
watch(filtroEstado, (newVal) =>
  localStorage.setItem("miLector_filtroEstado", newVal),
);
watch(filtroGenero, (newVal) =>
  localStorage.setItem("miLector_filtroGenero", newVal),
);

const parametrosConsulta = computed(() => {
  const params = {
    limit: limite,
    offset: (pagina.value - 1) * limite,
    "includes[]": ["cover_art"],
    "contentRating[]": filtroContenido.value.split(","),
  };
  if (busquedaActiva.value.trim() !== "") params.title = busquedaActiva.value;
  if (filtroEstado.value !== "") params["status[]"] = [filtroEstado.value];
  if (filtroGenero.value !== "")
    params["includedTags[]"] = [filtroGenero.value];
  return params;
});

const {
  data: response,
  pending,
  error: fetchError,
} = await useFetch("https://api.mangadex.org/manga", {
  query: parametrosConsulta,
  watch: [pagina, busquedaActiva, filtroContenido, filtroEstado, filtroGenero],
});

const limpiarTodo = () => {
  textoBusqueda.value = "";
  busquedaActiva.value = "";
  filtroContenido.value = "safe";
  filtroEstado.value = "";
  filtroGenero.value = "";
  pagina.value = 1;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const buscar = () => {
  pagina.value = 1;
  busquedaActiva.value = textoBusqueda.value;
  if (textoBusqueda.value.trim()) {
    let historial = historialBusquedas.value.filter(
      (item) => item.toLowerCase() !== textoBusqueda.value.toLowerCase(),
    );
    historial.unshift(textoBusqueda.value);
    historialBusquedas.value = historial.slice(0, 5);
    localStorage.setItem(
      "miLector_historial",
      JSON.stringify(historialBusquedas.value),
    );
  }
  mostrarHistorial.value = false;
};

const aplicarBusquedaHistorial = (termino) => {
  textoBusqueda.value = termino;
  buscar();
};
const ocultarHistorial = () =>
  setTimeout(() => (mostrarHistorial.value = false), 150);
const limpiarHistorial = () => {
  historialBusquedas.value = [];
  localStorage.removeItem("miLector_historial");
};
const aplicarFiltros = () => (pagina.value = 1);
const paginaSiguiente = () => {
  pagina.value++;
  window.scrollTo({ top: 0, behavior: "smooth" });
};
const paginaAnterior = () => {
  if (pagina.value > 1) {
    pagina.value--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const getCoverUrl = (manga) => {
  const cover = manga.relationships?.find((rel) => rel.type === "cover_art");
  return cover?.attributes?.fileName
    ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}`
    : "https://via.placeholder.com/400x600/18181b/ffffff?text=X";
};
</script>
<style>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #18181b;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}
</style>
