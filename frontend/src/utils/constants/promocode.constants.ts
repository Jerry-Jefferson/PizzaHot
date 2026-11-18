import { DiscountMode, type PromocodeState } from "@/types/promocode.types";
import type { StatusTone } from "@/types/ui.types";

export const ADMIN_PROMOCODES_PAGE_SIZE = 10;

export const PROMOCODE_CODE_MAX_LENGTH = 50;

export const MAX_PERCENTAGE_DISCOUNT = 100;

export const PROMOCODE_CODE_TAKEN_MESSAGE = "A promo code with this code already exists";

export const INACTIVE_PROMOCODE_EDIT_MESSAGE = "Turn the code on to edit it";

export const PROMOCODE_STATE_META: Record<PromocodeState, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  expired: { label: "Expired", tone: "danger" },
  inactive: { label: "Inactive", tone: "processing" },
};

export const DISCOUNT_MODE_LABELS: Record<DiscountMode, string> = {
  [DiscountMode.PERCENTAGE]: "Percentage (%)",
  [DiscountMode.FIXED_AMOUNT]: "Fixed amount ($)",
};

export const DISCOUNT_MODES = Object.values(DiscountMode);
