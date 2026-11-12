<template>
  <div
    class="flex items-start gap-3 rounded-card bg-status-success-bg px-4 py-3 text-status-success-fg"
    role="status"
    data-test="order-placed-banner"
  >
    <i class="pi pi-check-circle mt-0.5 text-lg" aria-hidden="true" />
    <div class="flex flex-col gap-0.5">
      <p class="font-semibold">Order placed!</p>
      <p class="text-sm">We've received your order and will confirm it shortly.</p>
    </div>
  </div>
</template>
