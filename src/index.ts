import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod"

const server = new McpServer({ name: "mcp-open-library", version: "1.0.0" })

server.tool(
    "search_books",
    `Search books from open library api`,
    {
        q: z.string(),
        limit: z.string().optional().describe("Optimail for limit records"),
        page: z.string().optional().describe('Optional number of page')
    },
    async ({ q, limit, page }) => {
        const data = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=${limit}&page=${page}`)
        const json = await data.json();
        let books = [];

        if (json?.docs?.length > 0) {
            books = json.docs.map((book: any) => {
                const title = book.title;
                const author_name = book.author_name.join(", ");
                const first_publish_year = book.first_publish_year;
                const id = book.lending_edition_s;

                return { id, title, author_name, first_publish_year };
            });
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(books),
                },
            ],
        };
    }
);

await server.connect(new StdioServerTransport())