import { mount } from "@vue/test-utils";
import Column from "primevue/column";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";
import { defineComponent, type PropType } from "vue";

import AdminTable from "@/components/admin/AdminTable.vue";

interface Row {
  id: string;
  name: string;
}

const Host = defineComponent({
  components: { AdminTable, Column },
  props: {
    rows: { type: Array as PropType<Row[]>, required: true },
    loading: Boolean,
  },
  template: `
    <AdminTable :rows="rows" data-key="id" :loading="loading" empty-title="No pizzas found">
      <Column field="name" header="Pizza" />
    </AdminTable>
  `,
});

function setup(rows: Row[], loading = false) {
  return mount(Host, { props: { rows, loading }, global: { plugins: [PrimeVue] } });
}

describe("AdminTable", () => {
  it("renders the columns and one row per item", () => {
    const wrapper = setup([
      { id: "p1", name: "Margherita" },
      { id: "p2", name: "Diavola" },
    ]);

    expect(wrapper.get("th").text()).toBe("Pizza");
    expect(wrapper.findAll("tbody tr").map((row) => row.text())).toEqual(["Margherita", "Diavola"]);
  });

  it("shows the empty state when there are no rows", () => {
    const wrapper = setup([]);

    expect(wrapper.text()).toContain("No pizzas found");
  });

  it("shows skeleton rows instead of the table while loading", () => {
    const wrapper = setup([{ id: "p1", name: "Margherita" }], true);

    expect(wrapper.find("[data-test='table-skeleton']").exists()).toBe(true);
    expect(wrapper.find("table").exists()).toBe(false);
  });
});
