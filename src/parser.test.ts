import { describe, expect, it } from "vitest";
import { parse } from "./parser.js";

describe(parse, () => {
  it("should parse empty files", () => {
    const tree = parse("");
    expect(tree).toMatchObject({
      type: "RobotsTxt",
      configs: [],
      sitemap: undefined,
    });
  });

  it("should parse single config block", () => {
    const tree = parse(`
		User-Agent: Google
		User-Agent: Bing
		Allow: /
		Disallow: /dashboard
		Crawl-Delay: 100
  
		Sitemap: https://www.example.com/sitemap-index.xml
		`);

    expect(tree).toMatchObject({
      type: "RobotsTxt",
      configs: [
        {
          type: "Config",
          userAgents: ["Google", "Bing"],
          rules: [
            {
              type: "AllowRule",
              value: "/",
            },
            {
              type: "DisallowRule",
              value: "/dashboard",
            },
            {
              type: "CrawlDelayRule",
              value: "100",
            },
          ],
        },
      ],
      sitemap: "https://www.example.com/sitemap-index.xml",
    });
  });

  it("should parse multiple config blocks", () => {
    const tree = parse(`
		User-Agent: Google
		User-Agent: Bing
		Allow: /
		Disallow: /dashboard
		Crawl-Delay: 100

		User-Agent: *
		Allow: /blog
		Disallow: /admin
		Crawl-Delay: 1000

		Sitemap: https://www.example.com/sitemap-index.xml
		`);

    expect(tree).toMatchObject({
      type: "RobotsTxt",
      configs: [
        {
          type: "Config",
          userAgents: ["Google", "Bing"],
          rules: [
            {
              type: "AllowRule",
              value: "/",
            },
            {
              type: "DisallowRule",
              value: "/dashboard",
            },
            {
              type: "CrawlDelayRule",
              value: "100",
            },
          ],
        },
        {
          type: "Config",
          userAgents: ["*"],
          rules: [
            {
              type: "AllowRule",
              value: "/blog",
            },
            {
              type: "DisallowRule",
              value: "/admin",
            },
            {
              type: "CrawlDelayRule",
              value: "1000",
            },
          ],
        },
      ],
      sitemap: "https://www.example.com/sitemap-index.xml",
    });
  });

  it("should throw an error for malformed files", () => {
    const txt = "User-Agent";
    expect(() => parse(txt)).toThrowError("Unexpected EOF");
  });
});
