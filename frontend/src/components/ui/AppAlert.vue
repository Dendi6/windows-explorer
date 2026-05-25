<script setup lang="ts">
defineProps<{
  type?:    "error" | "success" | "info";
  message:  string;
}>();
</script>

<template>
  <div class="alert" :class="`alert--${type ?? 'error'}`" role="alert">
    <span class="alert__dot" />
    {{ message }}
  </div>
</template>

<style scoped>
.alert {
  display:       flex;
  align-items:   center;
  gap:           8px;
  padding:       10px 14px;
  border-radius: 3px;
  font-size:     12px;
  border:        1px solid transparent;
  animation:     fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; } }
.alert__dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.alert--error   { background: var(--danger-bg);  color: var(--danger);  border-color: var(--danger-border); }
.alert--error   .alert__dot   { background: var(--danger); }
.alert--success { background: var(--success-bg); color: var(--success); border-color: var(--success-border); }
.alert--success .alert__dot   { background: var(--success); }
.alert--info    { background: var(--info-bg);    color: var(--accent-light); border-color: var(--border); }
.alert--info    .alert__dot   { background: var(--accent-light); }
</style>