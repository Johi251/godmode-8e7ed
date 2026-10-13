import { render } from "lit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { gatewayUrlError, renderGatewayConnection } from "./gateway-connection";

afterEach(() => {
  document.body.replaceChildren();
});

function createForm(gatewayUrl = "wss://gateway.example.test") {
  const container = document.createElement("div");
  const onConnect = vi.fn();
  document.body.append(container);
  render(renderGatewayConnection({ gatewayUrl, onConnect }), container);
  const form = container.querySelector("form")!;
  const urlInput = form.elements.namedItem("gatewayUrl") as HTMLInputElement;
  const tokenInput = form.elements.namedItem("token") as HTMLInputElement;
  return { form, urlInput, tokenInput, onConnect };
}

function submit(form: HTMLFormElement) {
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

describe("gateway connection", () => {
  it("connects to a secure gateway without putting credentials in the URL", () => {
    const originalSearch = window.location.search;
    const { form, tokenInput, onConnect } = createForm();
    expect(tokenInput.type).toBe("password");
    expect(tokenInput.value).toBe("");
    submit(form);
    expect(onConnect).toHaveBeenCalledWith("wss://gateway.example.test/", "");
    expect(window.location.search).toBe(originalSearch);
  });

  it.each([
    "https://gateway.example.test",
    "javascript:alert(1)",
    "not a URL",
    "wss://user@gateway.example.test",
    "wss://gateway.example.test/#fragment",
    "wss://gateway.example.test/?token=example",
  ])("rejects an unsafe or invalid gateway URL: %s", (gatewayUrl) => {
    const { form, urlInput, onConnect } = createForm(gatewayUrl);
    submit(form);
    expect(onConnect).not.toHaveBeenCalled();
    expect(urlInput.validationMessage).not.toBe("");
  });

  it("rejects insecure WebSocket connections from an HTTPS page", () => {
    expect(gatewayUrlError("ws://gateway.example.test", "https:")).not.toBeNull();
    expect(gatewayUrlError("ws://gateway.example.test", "http:")).toBeNull();
  });

  it("requires a gateway URL", () => {
    const { form, urlInput, onConnect } = createForm("");
    submit(form);
    expect(onConnect).not.toHaveBeenCalled();
    expect(urlInput.validity.valid).toBe(false);
  });

  it("preserves the development WebSocket proxy", () => {
    const { form, onConnect } = createForm("/ws");
    submit(form);
    expect(onConnect).toHaveBeenCalledWith("/ws", "");
  });

  it("clears validation when the URL is corrected", () => {
    const { form, urlInput, onConnect } = createForm("https://gateway.example.test");
    submit(form);
    urlInput.value = "wss://gateway.example.test";
    urlInput.dispatchEvent(new Event("input", { bubbles: true }));
    expect(urlInput.validationMessage).toBe("");
    submit(form);
    expect(onConnect).toHaveBeenCalledOnce();
  });
});
