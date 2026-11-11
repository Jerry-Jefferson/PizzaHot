import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AuthHeroPanel from "@/components/auth/AuthHeroPanel.vue";

describe("AuthHeroPanel", () => {
  it("renders the headline, subtitle, chips and footnote", () => {
    const wrapper = mount(AuthHeroPanel, {
      props: { headline: "Craft. Fire. Deliver.", subtitle: "Stone-baked.", chips: ["Organic"] },
      slots: { footnote: "Trusted by pizza lovers." },
    });

    expect(wrapper.get("h2").text()).toBe("Craft. Fire. Deliver.");
    expect(wrapper.text()).toContain("Stone-baked.");
    expect(wrapper.findAll("li").map((chip) => chip.text())).toEqual(["Organic"]);
    expect(wrapper.text()).toContain("Trusted by pizza lovers.");
  });

  it("omits the chip list and footnote when not given", () => {
    const wrapper = mount(AuthHeroPanel, { props: { headline: "Hi", subtitle: "There" } });

    expect(wrapper.find("ul").exists()).toBe(false);
    expect(wrapper.findAll("p")).toHaveLength(1);
  });
});
