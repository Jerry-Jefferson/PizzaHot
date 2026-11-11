import type { ConfirmationOptions } from "primevue/confirmationoptions";
import { useConfirm } from "primevue/useconfirm";

export const CONFIRM_DANGER_GROUP = "danger";

export interface ConfirmDangerOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => unknown;
}

export interface ConfirmDangerMessage extends ConfirmationOptions {
  onConfirm: () => unknown;
}

export function useConfirmDanger(): (options: ConfirmDangerOptions) => void {
  const confirm = useConfirm();

  return ({ title, message, confirmLabel = "Delete", cancelLabel = "Cancel", onConfirm }) => {
    const confirmation: ConfirmDangerMessage = {
      group: CONFIRM_DANGER_GROUP,
      header: title,
      message,
      acceptLabel: confirmLabel,
      rejectLabel: cancelLabel,
      onConfirm,
    };
    confirm.require(confirmation);
  };
}
