/**
 * llmService.ts
 * --------------------------------------------------------------------------
 * Handles the HTTP request to a local LLM server (Ollama by default).
 * Uses the native `fetch` API available in Node 18+.
 */

/**
 * Sends a prompt to the local LLM and returns the generated response text.
 *
 * @param endpoint - The full URL of the LLM API (e.g. http://localhost:11434/api/generate).
 * @param model    - The model identifier to use (e.g. "llama3").
 * @param prompt   - The meta-prompt string to send.
 * @returns The generated text from the LLM.
 * @throws An error with a user-friendly message on network or API failures.
 */
export async function callLocalLLM(
    endpoint: string,
    model: string,
    prompt: string
): Promise<string> {
    // Build the Ollama-compatible request payload.
    // Setting `stream: false` ensures we receive a single JSON response
    // instead of a streamed sequence of tokens.
    const payload = {
        model,
        prompt,
        stream: false,
    };

    let response: Response;

    try {
        response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch (err: unknown) {
        // Network-level error (server unreachable, DNS failure, etc.)
        const message =
            err instanceof Error ? err.message : "Unknown network error";
        throw new Error(
            `Could not connect to local LLM at ${endpoint}. Is Ollama running?\n${message}`
        );
    }

    // Handle non-2xx HTTP responses from the LLM server.
    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
            `LLM server returned HTTP ${response.status}: ${body || response.statusText}`
        );
    }

    // Parse the JSON body and extract the generated text.
    // Ollama returns `{ "response": "..." }` when stream is false.
    const data = (await response.json()) as { response?: string };

    if (!data.response) {
        throw new Error(
            "Unexpected LLM response format: missing 'response' field."
        );
    }

    return data.response.trim();
}
