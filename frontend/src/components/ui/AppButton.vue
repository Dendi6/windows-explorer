<script setup lang="ts">
defineProps<{
  variant?:  "primary" | "ghost" | "danger";
  loading?:  boolean;
  disabled?: boolean;
  full?:     boolean;
}>();
</script>

<template>
  <button
    :class="[
      'btn',
      `btn--${variant ?? 'primary'}`,
      { 'btn--loading': loading, 'btn--full': full }
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display:       inline-flex;
  align-items:   center;
  justify-content: center;
  gap:           7px;
  padding:       9px 20px;
  font-size:     12px;
  font-weight:   700;
  font-family:   inherit;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border:        1px solid transparent;
  border-radius: 3px;
  cursor:        pointer;
  transition:    background 0.15s, border-color 0.15s, opacity 0.15s, transform 0.1s;
  white-space:   nowrap;
}
.btn:active:not(:disabled)   { transform: translateY(1px); }
.btn:disabled                { opacity: 0.4; cursor: not-allowed; }
.btn--full                   { width: 100%; }
.btn--primary  { background: var(--accent);     color: #fff;           border-color: var(--accent-dark); }
.btn--primary:hover:not(:disabled) { background: var(--accent-hover); }
.btn--ghost    { background: transparent;        color: var(--text-muted); border-color: var(--border); }
.btn--ghost:hover:not(:disabled)   { background: var(--hover-bg); color: var(--text); }
.btn--danger   { background: var(--danger);     color: #fff;           border-color: var(--danger-dark); }
.btn--danger:hover:not(:disabled)  { filter: brightness(1.1); }

.btn__spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.55s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>