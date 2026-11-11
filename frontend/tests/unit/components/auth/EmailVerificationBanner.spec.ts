import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner.vue";

describe("EmailVerificationBanner", () => {
  it("explains why ordering is blocked and emits refresh", async () => {
    const wrapper = mount(EmailVerificationBanner);

    expect(wrapper.text()).toContain("Verify your email to place orders. Already verified?");
    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("refresh")).toHaveLength(1);
  });

  it("disables the button while loading", () => {
    const button = mount(EmailVerificationBanner, { props: { loading: true } }).get("button");

    expect(button.attributes()).toHaveProperty("disabled");
  });
});
