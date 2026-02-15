// ============================================================
// Dev Notes MCP Server
// ============================================================
// This is a simple MCP (Model Context Protocol) server that lets
// Claude Code save, list, and read markdown notes in ~/dev-notes/.
//
// It uses:
//   - McpServer:            high-level helper that registers tools
//   - StdioServerTransport: communicates with Claude Code over stdin/stdout
//   - zod:                  validates the parameters Claude sends to each tool
// ============================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import os from "os";

// ------------------------------------
// Where notes are stored
// ------------------------------------
const NOTES_DIR = path.join(os.homedir(), "dev-notes");

// ------------------------------------
// Helper: turn a title into a filename
// "Project Ideas" → "project-ideas.md"
// ------------------------------------
function slugify(title) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric chars with dashes
      .replace(/^-+|-+$/g, "")      // strip leading/trailing dashes
    + ".md"
  );
}

// ------------------------------------
// Helper: make sure ~/dev-notes/ exists
// ------------------------------------
async function ensureNotesDir() {
  await fs.mkdir(NOTES_DIR, { recursive: true });
}

// ============================================================
// Create the MCP server
// ============================================================
const server = new McpServer({
  name: "dev-notes",       // name shown to Claude Code
  version: "1.0.0",
});

// ============================================================
// Tool 1: save_note
// ============================================================
// Saves a markdown file in ~/dev-notes/.
// Creates the directory if it doesn't exist yet.
server.tool(
  "save_note",                                    // tool name
  "Save a markdown note to ~/dev-notes/",         // description shown to Claude
  {
    title: z.string().describe("Note title (used as filename)"),
    content: z.string().describe("Markdown content of the note"),
  },
  async ({ title, content }) => {
    await ensureNotesDir();

    const filename = slugify(title);
    const filepath = path.join(NOTES_DIR, filename);

    await fs.writeFile(filepath, content, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Saved note "${title}" to ${filepath}`,
        },
      ],
    };
  }
);

// ============================================================
// Tool 2: list_notes
// ============================================================
// Lists every .md file in ~/dev-notes/ with its last-modified date.
server.tool(
  "list_notes",
  "List all saved notes in ~/dev-notes/",
  {},                                              // no parameters needed
  async () => {
    await ensureNotesDir();

    const files = await fs.readdir(NOTES_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    if (mdFiles.length === 0) {
      return {
        content: [{ type: "text", text: "No notes found in ~/dev-notes/." }],
      };
    }

    // Build a summary line for each note
    const lines = await Promise.all(
      mdFiles.map(async (file) => {
        const stat = await fs.stat(path.join(NOTES_DIR, file));
        const modified = stat.mtime.toLocaleString();
        const title = file.replace(/\.md$/, "").replace(/-/g, " ");
        return `- ${title}  (${file})  — last modified: ${modified}`;
      })
    );

    return {
      content: [{ type: "text", text: lines.join("\n") }],
    };
  }
);

// ============================================================
// Tool 3: read_note
// ============================================================
// Reads a note by title. Looks for the matching .md file and
// returns its contents.
server.tool(
  "read_note",
  "Read a saved note from ~/dev-notes/",
  {
    title: z.string().describe("Title of the note to read"),
  },
  async ({ title }) => {
    await ensureNotesDir();

    const filename = slugify(title);
    const filepath = path.join(NOTES_DIR, filename);

    try {
      const content = await fs.readFile(filepath, "utf-8");
      return {
        content: [{ type: "text", text: content }],
      };
    } catch {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Note "${title}" not found (looked for ${filename} in ~/dev-notes/).`,
          },
        ],
      };
    }
  }
);

// ============================================================
// Tool 4: get_weather
// ============================================================
// Fetches current weather for a location using the free wttr.in API.
server.tool(
  "get_weather",
  "Get current weather for a location",
  {
    location: z.string().describe("City name (e.g. 'Orlando' or 'New York')"),
  },
  async ({ location }) => {
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(location)}?format=j1`
    );

    if (!response.ok) {
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to fetch weather for "${location}".` }],
      };
    }

    const data = await response.json();
    const current = data.current_condition[0];

    const summary = [
      `Weather for ${location}:`,
      `  Temperature: ${current.temp_F}°F (${current.temp_C}°C)`,
      `  Condition:   ${current.weatherDesc[0].value}`,
      `  Humidity:    ${current.humidity}%`,
      `  Wind:        ${current.windspeedMiles} mph ${current.winddir16Point}`,
    ].join("\n");

    return {
      content: [{ type: "text", text: summary }],
    };
  }
);

// ============================================================
// Start the server
// ============================================================
// StdioServerTransport lets Claude Code talk to this server
// over standard input/output (stdin/stdout).
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dev Notes MCP server is running.");  // stderr so it doesn't interfere with MCP protocol on stdout
}

main();
