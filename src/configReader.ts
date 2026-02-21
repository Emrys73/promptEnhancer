import * as fs from "fs";
import * as path from "path";

/**
 * Reads and parses the `.enhancerc.json` configuration file from the
 * workspace root directory.
 *
 * @param workspaceRoot - Absolute path to the workspace root folder.
 * @returns A record of project-specific rules, or an empty object if the
 *          config file is missing or contains invalid JSON.
 */
export function readProjectConfig(
    workspaceRoot: string
): Record<string, string> {
    const configPath = path.join(workspaceRoot, ".enhancerc.json");

    try {
        const raw = fs.readFileSync(configPath, "utf-8");
        const parsed = JSON.parse(raw);

        // Ensure we always return a plain object, even if the JSON root is
        // an array or a primitive.
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed as Record<string, string>;
        }

        return {};
    } catch {
        // File doesn't exist or contains invalid JSON – proceed silently
        // with an empty rule set as specified in the requirements.
        return {};
    }
}
