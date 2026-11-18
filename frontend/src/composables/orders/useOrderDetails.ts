import { computed, type ComputedRef, type Ref, ref } from "vue";

import { useAppToast } from "@/composables/common/useAppToast";
import { useConfirmDanger } from "@/composables/common/useConfirmDanger";
import { type NextOrderStatus, type Order, OrderStatus } from "@/types/order.types";
import { shortId } from "@/utils/format";

import { useUpdateOrderStatus } from "./useAdminOrders";

interface OrderDetails {
  selectedOrder: Ref<Order | null>;
  detailsVisible: Ref<boolean>;
  updating: ComputedRef<boolean>;
  openOrder: (order: Order) => void;
  changeStatus: (nextStatus: NextOrderStatus) => Promise<void>;
}

export function useOrderDetails(): OrderDetails {
  const { showSuccess, showError } = useAppToast();
  const confirmDanger = useConfirmDanger();
  const updateStatus = useUpdateOrderStatus();

  const selectedOrder = ref<Order | null>(null);
  const detailsVisible = ref(false);
  const updating = computed(() => updateStatus.isPending.value);

  function openOrder(order: Order): void {
    selectedOrder.value = order;
    detailsVisible.value = true;
  }

  async function applyStatus(order: Order, nextStatus: NextOrderStatus): Promise<void> {
    selectedOrder.value = await updateStatus.mutateAsync({ id: order.id, status: nextStatus });
    showSuccess("Order status updated");
  }

  async function changeStatus(nextStatus: NextOrderStatus): Promise<void> {
    const order = selectedOrder.value;
    if (!order) {
      return;
    }
    if (nextStatus === OrderStatus.CANCELLED) {
      confirmDanger({
        title: "Cancel this order?",
        message: `Order ${shortId(order.id)} will be marked as cancelled. This can't be undone.`,
        confirmLabel: "Cancel order",
        cancelLabel: "Keep order",
        onConfirm: () => applyStatus(order, nextStatus),
      });
      return;
    }
    try {
      await applyStatus(order, nextStatus);
    } catch (error) {
      showError(error, "Couldn't update the order status");
    }
  }

  return { selectedOrder, detailsVisible, updating, openOrder, changeStatus };
}
