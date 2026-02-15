# Process Document

## 1. What I Built

The server I have created is a single file, index.js, that has four different tools with the ability to save, list, and read notes in a "/dev-notes" directory, plus check live weather for any city.

Everything is within the index.js, including tthe four tools and two helpers (slugify and ensureNotesDir). Notes are stored in a fixed location close to the user's home. This keeps notes accessible across different projects and avoids cluttering. The ensureNotesDir() helper is called before every file operation so the directory is always created right then and there.


## 2. How Claude Code Helped

The most effective prompt I used with Claude was similar to the one provided to us on asking claude to write the server. I asked it to "Create a simple MCP server for Claude Code using Node.js.
" along with the four tools while being detailed on what I wanted each one to do.

Along with setting up the codetour, I also asked claude to walk me through the code implemented. I asked "Can you explain to me each part of the server code, how it works together, and why its important." Both walkthroughs allowed me to better understand how mcp servers work and how each tool was created.


## 3. Debugging Journey

When first testing the server it started up, but every response came back empty. Claude code was able to fix all responses by switching to newline-delimited JSON.

After adding the weather tool, the first test showed an empty response. The initialize handshake worked, but the get_weather returned nothing within the 3-second wait. Claude figured out that he issue was that the wttr.in API took longer than expected to respond. Increasing the wait from 3 seconds to 8 seconds resolved it and the response came back with valid weather data.


## 4. How MCP Works

The server is a single file, index.js, with around 208 lines of code. It registers four tools on an McpServer and starts a stdio transport.


## 5. What I'd Do Differently

Overall, it was a bit difficult for me to understand the process of creating a mcp server but with the help of Claude code I was able to get a better grasp on it the more I explored and progressed. During this process I was able to learn what things did and didn't work as well as what I would chnage for next time.

Keeping everything in index.js made the server easy to follow, test, and modify. Adding the weather tool was just inserting another server tool. However the wttr.in took a couple seconds to respond. The slow API could hang the tool call indefinitely. As for things to chnage, I would add in a delete_note tool that follows the same pattern when slugifying it, since there is no way currently to delete from the server.