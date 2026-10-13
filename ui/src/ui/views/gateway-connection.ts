import { html } from "lit";

export type GatewayConnectionProps = {
  gatewayUrl: string;
  onConnect: (gatewayUrl: string, token: string) => void;
};

export function gatewayUrlError(gatewayUrl: string, pageProtocol = window.location.protocol): string | null {
  if (gatewayUrl === "/ws") return null;
  try {
    const parsed = new URL(gatewayUrl);
    if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
      return "Enter a WebSocket URL starting with wss:// or ws://.";
    }
    if (pageProtocol === "https:" && parsed.protocol !== "wss:") {
      return "An HTTPS app requires a secure gateway URL starting with wss://.";
    }
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      return "Use a gateway URL without credentials, query parameters, or a fragment.";
    }
    return null;
  } catch {
    return "Enter a valid gateway WebSocket URL.";
  }
}

export function renderGatewayConnection(props: GatewayConnectionProps) {
  return html`
    <form
      class="card"
      style="margin-bottom: 24px;"
      @submit=${(event: SubmitEvent) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        const urlInput = form.elements.namedItem("gatewayUrl") as HTMLInputElement;
        const tokenInput = form.elements.namedItem("token") as HTMLInputElement;
        const gatewayUrl = urlInput.value.trim();
        urlInput.setCustomValidity(gatewayUrlError(gatewayUrl) ?? "");
        if (!form.reportValidity()) return;
        props.onConnect(gatewayUrl === "/ws" ? gatewayUrl : new URL(gatewayUrl).toString(), tokenInput.value.trim());
        tokenInput.value = "";
      }}
    >
      <h2 style="margin-top: 0;">Connect your gateway</h2>
      <p class="muted">
        This interface connects directly to your existing OpenClaw gateway with the GodMode plugin installed.
        Netlify hosts the interface, not your agents or data.
      </p>
      <label class="field" style="display: grid; gap: 6px; margin-bottom: 16px;">
        <span>Gateway WebSocket URL</span>
        <input
          name="gatewayUrl"
          type="text"
          required
          spellcheck="false"
          autocomplete="off"
          placeholder="wss://your-gateway.example.com"
          .value=${props.gatewayUrl}
          @input=${(event: Event) => (event.currentTarget as HTMLInputElement).setCustomValidity("")}
        />
      </label>
      <label class="field" style="display: grid; gap: 6px; margin-bottom: 16px;">
        <span>Gateway token</span>
        <input name="token" type="password" autocomplete="off" spellcheck="false" />
      </label>
      <p class="muted">
        Only connect to a gateway you trust. Enter its token here, not in the address bar.
        Connection settings use this app's existing browser storage; use a trusted device.
        Your gateway must allow this site's exact origin and may require device approval.
      </p>
      <button class="btn primary" type="submit">Save and connect</button>
    </form>
  `;
}
