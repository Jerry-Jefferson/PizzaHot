<script setup lang="ts">
import Column from "primevue/column";
import ToggleSwitch from "primevue/toggleswitch";
import { computed, ref, watch } from "vue";

import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";
import AdminTable from "@/components/admin/AdminTable.vue";
import PromocodeFormModal from "@/components/admin/PromocodeFormModal.vue";
import TableActionButtons from "@/components/admin/TableActionButtons.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseStatusBadge from "@/components/base/BaseStatusBadge.vue";
import { useAppToast } from "@/composables/useAppToast";
import { usePromocodeForm } from "@/composables/usePromocodeForm";
import {
  usePromocodes,
  useSavePromocode,
  useSetPromocodeActive,
} from "@/composables/usePromocodes";
import type { Promocode, PromocodeFormMode } from "@/types/promocode.types";
import {
  ADMIN_PROMOCODES_PAGE_SIZE,
  PROMOCODE_STATE_META,
} from "@/utils/constants/promocode.constants";
import { formatDate } from "@/utils/format";
import { formatDiscount, getPromocodeState } from "@/utils/promocode";

const { showSuccess, showError } = useAppToast();

const promocodesQuery = usePromocodes();
const setActive = useSetPromocodeActive();
const savePromocode = useSavePromocode();

const page = ref(1);

const promocodes = computed(() =>
  [...(promocodesQuery.data.value ?? [])].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  )
);
const totalPages = computed(() => Math.ceil(promocodes.value.length / ADMIN_PROMOCODES_PAGE_SIZE));
const visiblePromocodes = computed(() =>
  promocodes.value.slice(
    (page.value - 1) * ADMIN_PROMOCODES_PAGE_SIZE,
    page.value * ADMIN_PROMOCODES_PAGE_SIZE
  )
);
const hasLoadError = computed(() => promocodesQuery.isError.value && !promocodesQuery.data.value);

watch(totalPages, (pages) => {
  if (page.value > Math.max(pages, 1)) {
    page.value = Math.max(pages, 1);
  }
});

const subtitle = computed(() => {
  if (!promocodesQuery.data.value) {
    return undefined;
  }
  const activeCount = promocodes.value.filter(
    (promocode) => getPromocodeState(promocode) === "active"
  ).length;
  return `${String(activeCount)} active ${activeCount === 1 ? "code" : "codes"}`;
});

const formMode = ref<PromocodeFormMode>("create");
const editedPromocode = ref<Promocode | undefined>(undefined);
const formVisible = ref(false);

const { form, isActive, errors, formError, touch, validate, fill, toPayload, applyServerError } =
  usePromocodeForm(formMode);

function openCreate(): void {
  formMode.value = "create";
  editedPromocode.value = undefined;
  fill();
  formVisible.value = true;
}

function openEdit(promocode: Promocode): void {
  formMode.value = "edit";
  editedPromocode.value = promocode;
  fill(promocode);
  formVisible.value = true;
}

async function submit(): Promise<void> {
  if (savePromocode.isPending.value || !(await validate())) {
    return;
  }
  const existing = editedPromocode.value;
  try {
    await savePromocode.mutateAsync({ payload: toPayload(), existing, active: isActive.value });
    formVisible.value = false;
    showSuccess(existing ? "Promo code updated" : "Promo code created");
  } catch (error) {
    applyServerError(error);
  }
}

function isToggling(promocode: Promocode): boolean {
  return setActive.isPending.value && setActive.variables.value?.id === promocode.id;
}

async function toggleActive(promocode: Promocode, active: boolean): Promise<void> {
  try {
    await setActive.mutateAsync({ id: promocode.id, active });
    showSuccess("Promo code updated");
  } catch (error) {
    showError(error, "Couldn't update the promo code");
  }
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <AdminPageHeader title="Promo Codes" :subtitle="subtitle">
      <template #actions>
        <BaseButton icon="pi pi-plus" label="New Promo Code" @click="openCreate" />
      </template>
    </AdminPageHeader>

    <BaseEmptyState
      v-if="hasLoadError"
      icon="pi pi-exclamation-circle"
      title="Couldn't load promo codes"
      description="Please check your connection and try again."
    >
      <template #actions>
        <BaseButton variant="secondary" label="Try again" @click="promocodesQuery.refetch()" />
      </template>
    </BaseEmptyState>

    <template v-else>
      <AdminTable
        :rows="visiblePromocodes"
        data-key="id"
        :loading="promocodesQuery.isPending.value"
      >
        <Column header="Code">
          <template #body="{ data }: { data: Promocode }">
            <span class="flex items-center gap-2 whitespace-nowrap">
              <i class="pi pi-tag text-muted-foreground" aria-hidden="true" />
              <span class="font-mono font-semibold" data-test="promocode-code">{{
                data.code
              }}</span>
            </span>
          </template>
        </Column>
        <Column header="Discount">
          <template #body="{ data }: { data: Promocode }">
            <BaseStatusBadge tone="warning" data-test="promocode-discount">
              {{ formatDiscount(data) }}
            </BaseStatusBadge>
          </template>
        </Column>
        <Column header="Expires">
          <template #body="{ data }: { data: Promocode }">
            <span
              :class="[
                'whitespace-nowrap',
                getPromocodeState(data) === 'expired' ? 'text-primary' : 'text-muted-foreground',
              ]"
              data-test="promocode-expires"
            >
              {{ formatDate(data.validTill) }}
            </span>
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }: { data: Promocode }">
            <BaseStatusBadge
              :tone="PROMOCODE_STATE_META[getPromocodeState(data)].tone"
              dot
              data-test="promocode-status"
            >
              {{ PROMOCODE_STATE_META[getPromocodeState(data)].label }}
            </BaseStatusBadge>
          </template>
        </Column>
        <Column header="Active">
          <template #body="{ data }: { data: Promocode }">
            <ToggleSwitch
              :model-value="data.deletedAt === null"
              :disabled="isToggling(data)"
              :aria-label="`Active ${data.code}`"
              :data-test="`promocode-toggle-${data.code}`"
              @update:model-value="toggleActive(data, $event)"
            />
          </template>
        </Column>
        <Column header="" :pt="{ columnHeaderContent: { class: 'justify-end' } }">
          <template #body="{ data }: { data: Promocode }">
            <TableActionButtons
              :item-label="data.code"
              :actions="['edit']"
              @edit="openEdit(data)"
            />
          </template>
        </Column>
        <template #empty>
          <BaseEmptyState
            icon="pi pi-tag"
            title="No promo codes yet"
            description="Create a code to offer customers a discount."
          />
        </template>
      </AdminTable>

      <BasePagination v-model:page="page" :total-pages="totalPages" />
    </template>

    <PromocodeFormModal
      v-model:visible="formVisible"
      v-model:code="form.code"
      v-model:discount="form.discount"
      v-model:discount-mode="form.discountMode"
      v-model:valid-till="form.validTill"
      v-model:is-active="isActive"
      :mode="formMode"
      :errors="errors"
      :form-error="formError"
      :saving="savePromocode.isPending.value"
      @blur="touch"
      @submit="submit"
    />
  </section>
</template>
