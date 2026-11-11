import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import BaseStatusBadge from "@/components/base/BaseStatusBadge.vue";
import type { StatusTone } from "@/types/ui.types";

describe("BaseStatusBadge", () => {
  it.each<[StatusTone, string[]]>([
    ["success", ["bg-status-success-bg", "text-status-success-fg"]],
    ["warning", ["bg-status-warning-bg", "text-status-warning-fg"]],
    ["info", ["bg-status-info-bg", "text-status-info-fg"]],
    ["processing", ["bg-status-processing-bg", "text-status-processing-fg"]],
    ["danger", ["bg-primary/10", "text-primary"]],
    ["neutral", ["bg-secondary", "text-secondary-foreground"]],
  ])("maps the %s tone to its token classes", (tone, classes) => {
    const wrapper = mount(BaseStatusBadge, { props: { tone }, slots: { default: "Label" } });

    expect(wrapper.classes()).toEqual(expect.arrayContaining(classes));
    expect(wrapper.text()).toBe("Label");
  });

  it("defaults to the neutral tone without a dot", () => {
    const wrapper = mount(BaseStatusBadge, { slots: { default: "Draft" } });

    expect(wrapper.attributes("data-tone")).toBe("neutral");
    expect(wrapper.find("[aria-hidden='true']").exists()).toBe(false);
  });

  it("renders a dot when requested", () => {
    const wrapper = mount(BaseStatusBadge, { props: { tone: "success", dot: true } });

    expect(wrapper.find("[aria-hidden='true']").classes()).toContain("bg-current");
  });
});
