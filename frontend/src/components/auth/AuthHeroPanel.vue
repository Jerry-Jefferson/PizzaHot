<script setup lang="ts">
interface AuthHeroPanelProps {
  headline: string;
  subtitle: string;
  chips?: string[];
}

const { headline, subtitle, chips = [] } = defineProps<AuthHeroPanelProps>();

defineSlots<{ default?: () => unknown; footnote?: () => unknown }>();
</script>

<template>
  <div class="flex max-w-md flex-col gap-6">
    <h2 class="font-display text-4xl leading-tight font-bold text-sidebar-foreground xl:text-5xl">
      {{ headline }}
    </h2>
    <p class="text-base leading-relaxed text-sidebar-muted">{{ subtitle }}</p>
    <ul v-if="chips.length > 0" class="flex flex-wrap gap-2" aria-label="Highlights">
      <li
        v-for="chip in chips"
        :key="chip"
        class="rounded-full bg-sidebar-foreground/10 px-3 py-1 text-sm text-sidebar-foreground"
      >
        {{ chip }}
      </li>
    </ul>
    <slot />
    <p v-if="$slots.footnote" class="text-sm text-sidebar-muted">
      <slot name="footnote" />
    </p>
  </div>
</template>
