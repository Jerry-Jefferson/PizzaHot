<script setup lang="ts">
type TableAction = "view" | "edit" | "delete";

interface TableActionButtonsProps {
  itemLabel: string;
  actions?: TableAction[];
  disabled?: boolean;
}

interface TableActionButtonsEmits {
  view: [];
  edit: [];
  delete: [];
}

const {
  itemLabel,
  actions = ["edit", "delete"],
  disabled,
} = defineProps<TableActionButtonsProps>();
const emit = defineEmits<TableActionButtonsEmits>();

const ACTION_META: Record<TableAction, { icon: string; verb: string }> = {
  view: { icon: "pi pi-eye", verb: "View" },
  edit: { icon: "pi pi-pencil", verb: "Edit" },
  delete: { icon: "pi pi-trash", verb: "Delete" },
};

function trigger(action: TableAction): void {
  if (action === "view") {
    emit("view");
  } else if (action === "edit") {
    emit("edit");
  } else {
    emit("delete");
  }
}
</script>

<template>
  <div class="flex items-center justify-end gap-1">
    <button
      v-for="action in actions"
      :key="action"
      type="button"
      :aria-label="`${ACTION_META[action].verb} ${itemLabel}`"
      :data-test="`action-${action}`"
      :disabled="disabled"
      class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      @click="trigger(action)"
    >
      <i :class="ACTION_META[action].icon" aria-hidden="true" />
    </button>
  </div>
</template>
