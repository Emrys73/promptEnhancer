import * as vscode from "vscode";
import { readProjectConfig } from "./configReader";
import { callLocalLLM } from "./llmService";

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

/**
 * Called by VS Code when the extension is activated.
 * Registers the `promptEnhancer.enhanceSelectedText` command.
 */
export function activate(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand(
        "promptEnhancer.enhanceSelectedText",
        handleEnhanceSelectedText
    );

    context.subscriptions.push(disposable);
}

/**
 * Called by VS Code when the extension is deactivated. No cleanup needed.
 */
export function deactivate(): void {
    // no-op
}

// ---------------------------------------------------------------------------
// Command handler
// ---------------------------------------------------------------------------

/**
 * Core command handler – orchestrates the full enhance-selected-text flow:
 *
 * 1. Grab the active editor and the highlighted text.
 * 2. Read the file's language ID for context.
 * 3. Parse project rules from `.enhancerc.json`.
 * 4. Build the meta-prompt from a template.
 * 5. Call the local LLM inside a progress notification.
 * 6. Replace the original selection with the enhanced prompt.
 */
async function handleEnhanceSelectedText(): Promise<void> {
    // ── Step 1: Get the active editor & selection ──────────────────────────
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showWarningMessage(
            "Prompt Enhancer: No active editor found."
        );
        return;
    }

    const selection = editor.selection;
    const highlightedText = editor.document.getText(selection);

    if (!highlightedText || highlightedText.trim().length === 0) {
        vscode.window.showWarningMessage(
            "Prompt Enhancer: Please select some text first."
        );
        return;
    }

    // ── Step 2: Detect the programming language ────────────────────────────
    const languageId = editor.document.languageId;

    // ── Step 3: Read project-specific configuration ────────────────────────
    let projectRules: Record<string, string> = {};

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        projectRules = readProjectConfig(workspaceFolders[0].uri.fsPath);
    }

    // ── Step 4: Build the meta-prompt ──────────────────────────────────────
    const metaPrompt = buildMetaPrompt(highlightedText, languageId, projectRules);

    // ── Step 5: Read user configuration ────────────────────────────────────
    const config = vscode.workspace.getConfiguration("promptEnhancer");
    const endpoint = config.get<string>(
        "llmEndpoint",
        "http://localhost:11434/api/generate"
    );
    const model = config.get<string>("model", "llama3");

    // ── Step 6: Call the local LLM with a progress indicator ───────────────
    try {
        const enhancedPrompt = await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Prompt Enhancer",
                cancellable: false,
            },
            async (progress) => {
                progress.report({ message: "Enhancing prompt…" });
                return callLocalLLM(endpoint, model, metaPrompt);
            }
        );

        // ── Step 7: Replace the selection with the enhanced text ─────────────
        // `editor.edit` provides a `TextEditorEdit` builder. We call
        // `editBuilder.replace(selection, newText)` to swap the originally
        // highlighted text with the LLM's enhanced version in a single,
        // undoable edit operation.
        const success = await editor.edit((editBuilder) => {
            editBuilder.replace(selection, enhancedPrompt);
        });

        if (success) {
            vscode.window.showInformationMessage(
                "Prompt Enhancer: Prompt enhanced successfully!"
            );
        } else {
            vscode.window.showErrorMessage(
                "Prompt Enhancer: Failed to apply the edit to the document."
            );
        }
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "An unknown error occurred.";
        vscode.window.showErrorMessage(`Prompt Enhancer: ${message}`);
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Constructs the meta-prompt that will be sent to the local LLM.
 *
 * The prompt instructs the LLM to act as a prompt engineer and rewrite the
 * user's rough input into a detailed, professional prompt that respects the
 * project's constraints.
 */
function buildMetaPrompt(
    rawRequest: string,
    languageId: string,
    projectRules: Record<string, string>
): string {
    return [
        "You are an expert prompt engineer. The user is writing a prompt for an AI Code Assistant.",
        "",
        `Raw Request: ${rawRequest}`,
        "",
        `File Language: ${languageId}`,
        "",
        `Project Constraints: ${JSON.stringify(projectRules)}`,
        "",
        "Task: Expand the raw request into a highly detailed, professional prompt.",
        "Ensure it explicitly instructs the AI to follow the Project Constraints.",
        "Output ONLY the final enhanced prompt text, without any conversational filler or markdown code blocks wrapped around the text.",
    ].join("\n");
}
