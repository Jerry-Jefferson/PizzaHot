<script setup lang="ts"></script>

<template>
  <section
    class="flex flex-col gap-4 rounded-card border border-border bg-card p-6 text-card-foreground shadow-card"
  >
    <header v-if="$slots.header">
      <slot name="header" />
    </header>
    <slot />
    <footer v-if="$slots.footer">
      <slot name="footer" />
    </footer>
  </section>
</template>
