import { mount } from "@vue/test-utils";
import Typewriter from "../components/Typewriter.vue";
import { describe, expect, test } from "vitest";

describe("Typewriter.vue", () => {
  test("escreve o texto corretamente", async () => {
    const wrapper = mount(Typewriter);

    // Chama o método typeText
    wrapper.vm.typeText();

    // Espera um tempo curto para garantir que o texto seja digitado
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verifica se o texto digitado é "Buddy"
    expect(wrapper.find(".typed-text").text()).toBe("Buddy");
  });

  test("apaga o texto corretamente", async () => {
    const wrapper = mount(Typewriter);

    // Chama o método eraseText
    wrapper.vm.eraseText();

    // Espera um tempo curto para garantir que o texto seja apagado
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verifica se o texto apagado é vazio
    expect(wrapper.find(".typed-text").text()).toBe("");
  });
});