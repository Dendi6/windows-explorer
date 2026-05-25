<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter }     from "vue-router";
import { useAuthStore }  from "../stores/auth.store";
import AppInput          from "../components/ui/AppInput.vue";
import AppButton         from "../components/ui/AppButton.vue";
import AppAlert          from "../components/ui/AppAlert.vue";

const router  = useRouter();
const store   = useAuthStore();

const form = reactive({ email: "", password: "" });
const error   = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    await store.login(form.email, form.password);
    router.push("/");
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <!-- Background grid -->
    <div class="page__grid" aria-hidden="true" />

    <div class="card" role="main">

      <!-- Brand -->
      <div class="card__brand">
        <svg class="card__brand-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
        </svg>
        <span>FILE EXPLORER</span>
      </div>

      <!-- Heading -->
      <div class="card__head">
        <h1 class="card__title">Sign in</h1>
        <p class="card__sub">Access your workspace</p>
      </div>

      <!-- Form -->
      <form class="card__form" @submit.prevent="submit" novalidate>
        <AppAlert v-if="error" :message="error" type="error" />

        <AppInput
          v-model="form.email"
          label="Email address"
          type="email"
          placeholder="you@company.com"
          autocomplete="email"
        />
        <AppInput
          v-model="form.password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
        />

        <AppButton type="submit" :loading="loading" :full="true">
          Sign in
        </AppButton>
      </form>

      <!-- Footer -->
      <p class="card__footer">
        No account?
        <router-link to="/register" class="card__link">Create one</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height:      100vh;
  display:         flex;
  align-items:     center;
  justify-content: center;
  background:      var(--main);
  position:        relative;
  overflow:        hidden;
}

/* Subtle dot-grid background */
.page__grid {
  position:   absolute;
  inset:      0;
  background-image: radial-gradient(circle, var(--grid-dot) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity:    0.45;
  pointer-events: none;
}

.card {
  position:      relative;
  z-index:       1;
  background:    var(--panel);
  border:        1px solid var(--border-strong);
  border-radius: 6px;
  padding:       36px 32px 28px;
  width:         100%;
  max-width:     380px;
  box-shadow:    0 0 0 1px var(--panel), 0 32px 80px rgba(0,0,0,0.5);
  animation:     cardIn 0.3s ease;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card__brand {
  display:        flex;
  align-items:    center;
  gap:            8px;
  font-size:      10px;
  font-weight:    700;
  letter-spacing: 0.15em;
  color:          var(--folder-color);
  margin-bottom:  28px;
}
.card__brand-icon { flex-shrink: 0; }

.card__head       { margin-bottom: 24px; }
.card__title      { font-size: 22px; font-weight: 700; color: var(--text); margin: 0 0 4px; line-height: 1.2; }
.card__sub        { font-size: 12px; color: var(--text-muted); margin: 0; }

.card__form       { display: flex; flex-direction: column; gap: 14px; }

.card__footer     { margin-top: 20px; text-align: center; font-size: 12px; color: var(--text-dim); }
.card__link       { color: var(--accent-light); text-decoration: none; font-weight: 600; }
.card__link:hover { text-decoration: underline; }
</style>