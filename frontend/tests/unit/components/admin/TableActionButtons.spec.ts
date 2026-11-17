import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import TableActionButtons from "@/components/admin/TableActionButtons.vue";

describe("TableActionButtons", () => {
  it("shows edit and delete by default, labelled with the item", () => {
    const wrapper = mount(TableActionButtons, { props: { itemLabel: "Margherita" } });

    expect(wrapper.findAll("button").map((button) => button.attributes("aria-label"))).toEqual([
      "Edit Margherita",
      "Delete Margherita",
    ]);
  });

  it.each(["view", "edit", "delete"] as const)(
    "emits %s when its button is clicked",
    async (action) => {
      const wrapper = mount(TableActionButtons, {
        props: { itemLabel: "order #1a2b3c4d", actions: ["view", "edit", "delete"] },
      });

      await wrapper.get(`[data-test='action-${action}']`).trigger("click");

      expect(wrapper.emitted(action)).toHaveLength(1);
    }
  );

  it("disables every button", () => {
    const wrapper = mount(TableActionButtons, {
      props: { itemLabel: "Margherita", disabled: true },
    });

    expect(
      wrapper.findAll("button").every((button) => button.attributes("disabled") !== undefined)
    ).toBe(true);
  });
});
