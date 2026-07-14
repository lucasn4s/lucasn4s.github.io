<script setup lang="ts">
export interface Props {
  currentLocale: 'en' | 'pt';
}

const props = defineProps<Props>();

const enUrl = '/';
const ptUrl = '/pt/';
</script>

<template>
  <div class="lang">
    <a
      :href="enUrl"
      :class="{ active: props.currentLocale === 'en' }"
      :aria-current="props.currentLocale === 'en' ? 'true' : undefined"
    >EN</a>
    <a
      :href="ptUrl"
      :class="{ active: props.currentLocale === 'pt' }"
      :aria-current="props.currentLocale === 'pt' ? 'true' : undefined"
    >PT</a>
  </div>
</template>
