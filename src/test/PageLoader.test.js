import { mount } from "@vue/test-utils";
import PageLoader from "../components/PageLoader.vue";
import { describe, expect, test } from "vitest";

describe("PageLoader.vue", () => {
  test("renderiza quando 'isloaded' é 'false'", () => {
    const wrapper = mount(PageLoader, {
      data() {
        return {
          isloaded: false,
        };
      },
    });
    expect(wrapper.find(".page-loader").exists()).toBe(true);
  });

  test("não renderiza quando 'isloaded' é 'true'", () => {
    const wrapper = mount(PageLoader, {
      data() {
        return {
          isloaded: true,
        };
      },
    });
    expect(wrapper.find(".page-loader").exists()).toBe(false);
  });

  test("aplica em 'isloaded' true depois de um delay quando o método 'delayAndSetLoadedStatus' é chamado", async () => {
    const wrapper = mount(PageLoader);
    expect(wrapper.vm.isloaded).toBe(false);
  
    // Chamar o método que deve iniciar o atraso
    wrapper.vm.delayAndSetLoadedStatus(1000); // Inicia o atraso de 1 segundo
  
    // Aguardar o atraso terminar
    await new Promise(resolve => setTimeout(resolve, 1100));
  
    // Verificar se 'isloaded' foi definido como true após o atraso
    expect(wrapper.vm.isloaded).toBe(true);
  });
});