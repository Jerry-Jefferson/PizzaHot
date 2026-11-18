import { mount, type VueWrapper } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PizzaImageCard from "@/components/admin/PizzaImageCard.vue";
import { MAX_IMAGE_BYTES } from "@/utils/constants/limits.constants";
import { IMAGE_TOO_LARGE_MESSAGE, INVALID_IMAGE_TYPE_MESSAGE } from "@/utils/media";

const imageFile = (type = "image/png", size = 2048, name = "pizza.png") => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

function setup(props: { file?: File | null; currentImageUrl?: string | null } = {}) {
  const wrapper: VueWrapper = mount(PizzaImageCard, {
    props: {
      file: null,
      ...props,
      "onUpdate:file": (file: File | null) => wrapper.setProps({ file }),
    },
    global: { plugins: [PrimeVue] },
  });
  return wrapper;
}

async function choose(wrapper: VueWrapper, file: File): Promise<void> {
  const input = wrapper.get<HTMLInputElement>("[data-test='image-input']");
  Object.defineProperty(input.element, "files", { value: [file], configurable: true });
  await input.trigger("change");
}

const revokeObjectURL = vi.fn();

beforeEach(() => {
  revokeObjectURL.mockReset();
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = revokeObjectURL;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PizzaImageCard", () => {
  it("shows a drop zone when there is no image", () => {
    const wrapper = setup();

    expect(wrapper.get("[data-test='drop-zone']").text()).toContain("Drag an image here or");
    expect(wrapper.find("[data-test='image-preview']").exists()).toBe(false);
  });

  it("selects a valid image and previews it", async () => {
    const wrapper = setup();
    const file = imageFile();

    await choose(wrapper, file);

    expect(wrapper.emitted("update:file")?.[0]).toEqual([file]);
    expect(wrapper.get("[data-test='image-preview']").attributes("src")).toBe("blob:preview");
    expect(wrapper.text()).toContain("pizza.png");
  });

  it.each([
    ["an unsupported type", imageFile("image/gif"), INVALID_IMAGE_TYPE_MESSAGE],
    ["a file over 5 MB", imageFile("image/png", MAX_IMAGE_BYTES + 1), IMAGE_TOO_LARGE_MESSAGE],
  ])("rejects %s with an inline error", async (_label, file, message) => {
    const wrapper = setup();

    await choose(wrapper, file);

    expect(wrapper.emitted("update:file")).toBeUndefined();
    expect(wrapper.get("[data-test='image-error']").text()).toBe(message);
  });

  it("accepts a dropped image", async () => {
    const wrapper = setup();
    const file = imageFile("image/webp");

    await wrapper.get("[data-test='drop-zone']").trigger("drop", {
      dataTransfer: { files: [file] },
    });

    expect(wrapper.emitted("update:file")?.[0]).toEqual([file]);
  });

  it("shows the current image with a replace button when editing", () => {
    const wrapper = setup({ currentImageUrl: "/uploads/pizzas/p1.png" });

    expect(wrapper.get("[data-test='image-preview']").attributes("src")).toBe(
      "/uploads/pizzas/p1.png"
    );
    expect(wrapper.text()).toContain("Replace image");
    expect(wrapper.find("[data-test='remove-image']").exists()).toBe(false);
  });

  it("removing a new selection restores the current image", async () => {
    const wrapper = setup({ currentImageUrl: "/uploads/pizzas/p1.png" });
    await choose(wrapper, imageFile());
    expect(wrapper.get("[data-test='image-preview']").attributes("src")).toBe("blob:preview");

    await wrapper.get("[data-test='remove-image']").trigger("click");

    const updates = wrapper.emitted("update:file") ?? [];
    expect(updates[updates.length - 1]).toEqual([null]);
    expect(wrapper.get("[data-test='image-preview']").attributes("src")).toBe(
      "/uploads/pizzas/p1.png"
    );
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
});
