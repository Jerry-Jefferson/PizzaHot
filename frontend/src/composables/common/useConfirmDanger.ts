import type { ConfirmationOptions } from "primevue/confirmationoptions";
import { useConfirm } from "primevue/useconfirm";

import { CONFIRM_DANGER_GROUP } from "@/utils/constants/ui.constants";

export interface ConfirmDangerOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => unknown;
  onCancel?: () => void;
}

export interface ConfirmDangerMessage extends ConfirmationOptions {
  onConfirm: () => unknown;
}

export function useConfirmDanger(): (options: ConfirmDangerOptions) => void {
  const confirm = useConfirm();

  return ({
    title,
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
  }) => {
    const confirmation: ConfirmDangerMessage = {
      group: CONFIRM_DANGER_GROUP,
      header: title,
      message,
      acceptLabel: confirmLabel,
      rejectLabel: cancelLabel,
      onConfirm,
      reject: onCancel,
      onHide: onCancel,
    };
    confirm.require(confirmation);
  };
}
