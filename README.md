# ✨ Prompt Enhancer Local

> Turn your rough, lazy prompt comments into highly detailed, professional prompts — powered by a local AI running on **your own machine**. No cloud, no API keys, 100% private.

---

## 📖 What Does This Extension Do?

Imagine you're coding and you write a quick comment like:

```
// make a login page with validation
```

You **select** that text, press a **keyboard shortcut**, and the extension rewrites it into something like:

```
Create a responsive login page component using React with TypeScript.
Include email and password input fields with the following validation rules:
- Email must be a valid email format
- Password must be at least 8 characters with one uppercase letter and one number
Use functional components. Style with Tailwind CSS. Use pnpm as the package manager.
Display inline error messages below each field. Add a "Remember Me" checkbox and a
"Forgot Password?" link. Handle form submission with proper loading state...
```

It takes your rough idea and turns it into a **detailed, context-aware prompt** that any AI coding assistant can understand perfectly.

---

## 🧰 Prerequisites (What You Need Before Starting)

Before using this extension, you need **one thing** installed on your computer: a local AI model server. We recommend **Ollama** — it's free and easy.

### Step 1: Install Ollama

1. Go to [https://ollama.com](https://ollama.com)
2. Click **Download** and choose your operating system (Mac, Windows, or Linux)
3. Follow the installer — it's a standard app installation, just click "Next" a few times
4. Once installed, Ollama runs quietly in the background (you'll see a small llama icon in your menu bar on Mac)

### Step 2: Download an AI Model

Open your **Terminal** app (on Mac, search for "Terminal" in Spotlight) and type:

```bash
ollama pull llama3
```

This downloads the `llama3` model (~4 GB). Wait for it to finish — it only needs to download once.

> **💡 Tip:** If you have a powerful computer with lots of RAM (32 GB+), you can try larger models like `llama3:70b` for even better results. If your computer is older, try the smaller `llama3:8b`.

### Step 3: Verify Ollama Is Running

In your Terminal, type:

```bash
ollama list
```

You should see `llama3` (or whichever model you downloaded) in the list. If you do, you're all set!

---

## 📦 Installing the Extension

### Option A: Run in Development Mode (Recommended for First Time)

1. **Open the `promptEnhancer` folder** in VS Code or Antigravity IDE
   - Go to `File → Open Folder…` and navigate to the `promptEnhancer` folder
2. **Install dependencies** — open the built-in Terminal (`Ctrl+`` ` or `Cmd+`` ` on Mac) and run:
   ```bash
   npm install
   ```
3. **Compile the code** — in the same Terminal, run:
   ```bash
   npm run compile
   ```
4. **Launch the extension** — press **F5** on your keyboard
   - This opens a **brand new VS Code window** called the **Extension Development Host**
   - This new window has your extension loaded and ready to use
   - The original window stays open for debugging (you can minimize it)

> **📝 Note:** Every time you want to use the extension during development, you'll press F5 from the `promptEnhancer` project. In the future, you can package it as a `.vsix` file for permanent installation (see [Packaging for Permanent Use](#-packaging-for-permanent-use) below).

### Option B: Install Permanently as a `.vsix` Package

```bash
# Install the packaging tool (one-time setup)
npm install -g @vscode/vsce

# Build the package
cd /path/to/promptEnhancer
vsce package

# Install into your IDE
code --install-extension prompt-enhancer-local-0.1.0.vsix
```

After this, the extension is permanently installed — no need to press F5 anymore.

---

## 🚀 How to Use the Extension

### The Basic Workflow

1. **Open any code file** in VS Code / Antigravity IDE  
2. **Type a rough prompt** anywhere — as a comment, inline, wherever you like  
   ```python
   # add error handling to this function with retries
   ```
3. **Select (highlight) that text** with your mouse or keyboard  
4. **Press the keyboard shortcut:**

   | Operating System | Shortcut |
   |---|---|
   | **Mac** | `Cmd + Shift + R` |
   | **Windows / Linux** | `Ctrl + Shift + E` |

5. **Wait a moment** — you'll see a notification saying **"Enhancing prompt…"** at the bottom-right  
6. **Done!** — your selected text is replaced with a detailed, professional prompt  

### What Happens Behind the Scenes

```
You type:         "add dark mode toggle"
                        ↓
Extension reads:   File language (e.g., TypeScript)
                   Project rules from .enhancerc.json
                        ↓
Sends to Ollama:   A carefully constructed instruction asking the AI
                   to expand your rough text into a detailed prompt
                        ↓
You get back:      A multi-line, detailed prompt that respects your
                   project's specific tools and conventions
```

---

## ⚙️ Configuring the Extension

### Project-Level Configuration (`.enhancerc.json`)

You can create a file called **`.enhancerc.json`** in the **root folder of any project** to tell the extension about your project's rules and conventions. The enhanced prompts will then automatically include these rules.

1. In your project's root folder, create a file named `.enhancerc.json`
2. Add your project-specific rules as key-value pairs:

```json
{
  "packageManager": "pnpm",
  "styling": "Tailwind CSS",
  "framework": "Next.js 14 with App Router",
  "testing": "Vitest + React Testing Library",
  "customRules": "Use functional components. Prefer server components when possible."
}
```

> **💡 A sample file** is included as `.enhancerc.example.json` — you can copy and rename it:
> ```bash
> cp .enhancerc.example.json .enhancerc.json
> ```

You can add **any rules** that are relevant to your project. Common examples:

| Key | Example Value |
|---|---|
| `packageManager` | `"npm"`, `"pnpm"`, `"yarn"` |
| `styling` | `"Tailwind CSS"`, `"CSS Modules"`, `"styled-components"` |
| `framework` | `"Next.js 14"`, `"React 18"`, `"Vue 3"` |
| `language` | `"TypeScript strict mode"`, `"Python 3.12"` |
| `testing` | `"Jest"`, `"Vitest"`, `"Pytest"` |
| `customRules` | Any free-text instructions for the AI |

If this file doesn't exist, the extension works fine — it just won't include project-specific rules.

### Extension Settings (Global)

You can also configure global settings in VS Code:

1. Open **Settings** — press `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)
2. Search for **"Prompt Enhancer"**
3. You'll see two settings:

| Setting | Default | What It Does |
|---|---|---|
| **LLM Endpoint** | `http://localhost:11434/api/generate` | The URL where Ollama (or another local LLM) is running. Change this only if you run Ollama on a different port or machine. |
| **Model** | `llama3` | The AI model to use. Change this if you downloaded a different model (e.g., `mistral`, `codellama`, `llama3:70b`). |

---

## 🔧 Changing the Keyboard Shortcut

If the default shortcut conflicts with another extension or you simply prefer a different one:

### Method 1: Via VS Code Settings (Easiest)

1. Open **Keyboard Shortcuts** — press `Cmd + K, Cmd + S` (Mac) or `Ctrl + K, Ctrl + S`
2. Search for **"Prompt Enhancer"**
3. Click the ✏️ pencil icon next to the command
4. Press your desired key combination
5. Press **Enter** to save

### Method 2: Edit `package.json` Directly

Open `package.json` and find the `keybindings` section:

```json
"keybindings": [
    {
        "command": "promptEnhancer.enhanceSelectedText",
        "key": "ctrl+shift+e",
        "mac": "cmd+shift+r",
        "when": "editorTextFocus"
    }
]
```

Change the `key` (Windows/Linux) and `mac` values to your preferred combination. Examples:

| Shortcut | Value to Use |
|---|---|
| `Cmd + Alt + E` | `"cmd+alt+e"` |
| `Cmd + K, then E` | `"cmd+k cmd+e"` |
| `Ctrl + Shift + P` | `"ctrl+shift+p"` |

---

## ❓ Troubleshooting

### "Could not connect to local LLM. Is Ollama running?"

This means the extension can't reach Ollama. Try:

1. **Check if Ollama is running** — look for the llama icon in your menu bar (Mac) or system tray (Windows)
2. **Start Ollama manually** — open Terminal and run:
   ```bash
   ollama serve
   ```
3. **Test the connection** — run this in Terminal:
   ```bash
   curl http://localhost:11434/api/generate -d '{"model": "llama3", "prompt": "Hi", "stream": false}'
   ```
   If you get a JSON response back, Ollama is working. If not, reinstall Ollama.

### "Please select some text first."

You pressed the shortcut without highlighting any text. **Select (highlight) the text** you want to enhance first, then press the shortcut.

### The response takes too long

Local LLMs depend on your hardware. If it's slow:
- Try a smaller model: `ollama pull llama3:8b`
- Update the **Model** setting in VS Code to match: `llama3:8b`
- Close other heavy applications to free up RAM

### The enhanced prompt doesn't match my project style

Create or update the `.enhancerc.json` file in your project root with more specific rules. The more detail you provide, the better the output.

---

## 📁 Project Structure

```
promptEnhancer/
├── .vscode/
│   ├── launch.json          # Debug launch configuration (F5)
│   └── tasks.json           # Build task for compilation
├── src/
│   ├── extension.ts         # Main extension logic
│   ├── configReader.ts      # Reads .enhancerc.json configuration
│   └── llmService.ts        # Communicates with the local LLM
├── out/                     # Compiled JavaScript (auto-generated)
├── package.json             # Extension manifest & settings
├── tsconfig.json            # TypeScript configuration
├── .enhancerc.example.json  # Sample project rules configuration
└── README.md                # This file
```

---

## 📜 License

MIT — use it however you like.
