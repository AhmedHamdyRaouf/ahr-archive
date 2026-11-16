import { describe, it, expect, vi, afterEach } from "vitest";
import { OpenAiClient, createOpenAiClientFromEnv } from "../src/openai-client";
import { AiProviderUnavailableError } from "../src/types";

describe("OpenAiClient", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("throws if constructed with an empty API key (10-Security.md §5)", () => {
    expect(() => new OpenAiClient({ apiKey: "" })).toThrow(/requires an API key/);
  });

  it("returns the message content on a successful call", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }),
    }) as unknown as typeof fetch;

    const client = new OpenAiClient({ apiKey: "test-key" });
    const result = await client.complete("a prompt");
    expect(result).toBe('{"ok":true}');
  });

  it("sends the API key as a Bearer token, never in the body or a query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "x" } }] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new OpenAiClient({ apiKey: "secret-123" });
    await client.complete("a prompt");

    const call = fetchMock.mock.calls[0] as [
      string,
      { headers: Record<string, string>; body: string },
    ];
    const requestInit = call[1];
    expect(requestInit.headers.Authorization).toBe("Bearer secret-123");
    expect(requestInit.body).not.toContain("secret-123");
  });

  it("throws AiProviderUnavailableError on a non-OK HTTP response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "internal error",
    }) as unknown as typeof fetch;

    const client = new OpenAiClient({ apiKey: "test-key" });
    await expect(client.complete("a prompt")).rejects.toThrow(AiProviderUnavailableError);
  });

  it("throws AiProviderUnavailableError when the response has no message content", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    }) as unknown as typeof fetch;

    const client = new OpenAiClient({ apiKey: "test-key" });
    await expect(client.complete("a prompt")).rejects.toThrow(AiProviderUnavailableError);
  });

  it("throws AiProviderUnavailableError when fetch itself rejects (network failure)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("DNS failure")) as unknown as typeof fetch;

    const client = new OpenAiClient({ apiKey: "test-key" });
    await expect(client.complete("a prompt")).rejects.toThrow(AiProviderUnavailableError);
  });

  it("embed() returns the embedding vector on a successful call", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ embedding: [0.1, 0.2, 0.3] }] }),
    }) as unknown as typeof fetch;

    const client = new OpenAiClient({ apiKey: "test-key" });
    const result = await client.embed("some text");
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it("embed() sends the API key as a Bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ embedding: [0.1] }] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new OpenAiClient({ apiKey: "secret-123" });
    await client.embed("some text");

    const call = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(call[1].headers.Authorization).toBe("Bearer secret-123");
  });

  it("embed() throws AiProviderUnavailableError on a non-OK HTTP response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "internal error",
    }) as unknown as typeof fetch;

    const client = new OpenAiClient({ apiKey: "test-key" });
    await expect(client.embed("some text")).rejects.toThrow(AiProviderUnavailableError);
  });

  it("embed() throws AiProviderUnavailableError when the response has no embedding", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    }) as unknown as typeof fetch;

    const client = new OpenAiClient({ apiKey: "test-key" });
    await expect(client.embed("some text")).rejects.toThrow(AiProviderUnavailableError);
  });
});

describe("createOpenAiClientFromEnv", () => {
  it("throws a clear error when OPENAI_API_KEY is missing, rather than a silent placeholder client", () => {
    expect(() => createOpenAiClientFromEnv({} as NodeJS.ProcessEnv)).toThrow(/OPENAI_API_KEY/);
  });

  it("constructs a client when OPENAI_API_KEY is present", () => {
    const client = createOpenAiClientFromEnv({ OPENAI_API_KEY: "test-key" } as NodeJS.ProcessEnv);
    expect(client).toBeInstanceOf(OpenAiClient);
  });
});
