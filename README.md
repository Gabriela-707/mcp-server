# Dev Notes MCP Server

A Model Context Protocol (MCP) server that gives Claude Code the ability to save, list, and read notes in a "/dev-notes" directory, plus check live weather for any city.

## Why It's Useful

While Claude Code is good at generating information, this server will help Claude by giving it tools to save, list, and read notes in your file. The weather tool here also shows how MCP servers can also connect Claude to external APIs.

## Installation

1. **Prerequisites:** Node.js 18 or later

2. **Clone and install dependencies:**

   - cd dev-notes-server
   - npm install

3. **Configure Claude Code** by adding the server to your MCP settings. Create or edit ".mcp.json" in the project root
   {
     "mcpServers": {
       "dev-notes": {
         "command": "node",
         "args": ["/absolute/path/to/dev-notes-server/index.js"],
         "transport": "stdio"
       }
     }
   }

4. **Restart Claude Code** so it picks up the new server.

## Usage Examples

**Saving a note:**
"Save a note called 'meeting-notes' with the topics discussed."

Claude calls "save_note" and writes "~/dev-notes/meeting-notes.md" with the content you described.

**Listing and reading notes:**
"List all my dev notes."
"Read my meeting-notes note."

Claude calls "list_notes" to show every saved note with its last-modified date, then "read_note" to retrieve a specific note's contents.

**Checking the weather:**
"What's the weather like in Orlando?"

Claude calls "get_weather", which fetches live data from the wttr.in API and shows the temperature, conditions, humidity, and wind.


## Limitations and Known Issues

- **No subdirectories:** All notes are stored flat in "/dev-notes" There's no folder or tagging system.
- **No delete tool:** Notes can only be removed by manually deleting the .md file
- **Weather API dependency:** The "get_weather" tool relies on the free wttr.in service, which may occasionally be slow or unavailable.
