<script setup lang="ts">
defineProps<{
  modelValue:   string;
  label?:       string;
  placeholder?: string;
  type?:        string;
  error?:       string;
  hint?:        string;
}>();
defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div class="field">
    <label v-if="label" class="field__label">{{ label }}</label>
    <div class="field__wrap" :class="{ 'field__wrap--error': error }">
      <input
        class="field__input"
        :type="type ?? 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <p v-if="error" class="field__error">{{ error }}</p>
    <p v-else-if="hint" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field              { display: flex; flex-direction: column; gap: 5px; }
.field__label       { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }
.field__wrap        { position: relative; }
.field__input {
  width:          100%;
  background:     var(--input-bg);
  border:         1px solid var(--border);
  border-radius:  3px;
  padding:        9px 12px;
  font-size:      13px;
  color:          var(--text);
  font-family:    inherit;
  outline:        none;
  box-sizing:     border-box;
  transition:     border-color 0.15s, box-shadow 0.15s;
}
.field__input::placeholder    { color: var(--text-dim); }
.field__input:focus           { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
.field__wrap--error .field__input { border-color: var(--danger); }
.field__wrap--error .field__input:focus { box-shadow: 0 0 0 3px var(--danger-glow); }
.field__error       { font-size: 11px; color: var(--danger); }
.field__hint        { font-size: 11px; color: var(--text-dim); }
</style>