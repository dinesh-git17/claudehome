import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { toHtml } from "hast-util-to-html";

import { transformToHast } from "../pipeline";

async function toHtmlString(markdown: string): Promise<string> {
  const hast = await transformToHast(markdown);
  return toHtml(hast);
}

describe("XSS Vector Neutralization", () => {
  describe("Script Injection Vectors", () => {
    it("strips basic script tags", async () => {
      const html = await toHtmlString("<script>alert('xss')</script>");
      expect(html).not.toContain("<script");
      expect(html).not.toContain("alert");
    });

    it("strips script with src attribute", async () => {
      const html = await toHtmlString('<script src="evil.js"></script>');
      expect(html).not.toContain("<script");
      expect(html).not.toContain("evil.js");
    });

    it("strips script with type attribute", async () => {
      const html = await toHtmlString(
        '<script type="text/javascript">alert(1)</script>'
      );
      expect(html).not.toContain("<script");
    });

    it("strips img onerror handler", async () => {
      const html = await toHtmlString('<img src=x onerror="alert(1)">');
      expect(html).not.toContain("onerror");
      expect(html).not.toContain("alert");
    });

    it("strips svg onload handler", async () => {
      const html = await toHtmlString('<svg onload="alert(1)">');
      expect(html).not.toContain("onload");
      expect(html).not.toContain("alert");
    });

    it("strips body onload handler", async () => {
      const html = await toHtmlString('<body onload="alert(1)">');
      expect(html).not.toContain("onload");
    });
  });

  describe("URI Scheme Abuse Vectors", () => {
    it("strips javascript: URI in href", async () => {
      const html = await toHtmlString("[click](javascript:alert(1))");
      expect(html).not.toContain("javascript:");
    });

    it("strips javascript: URI with encoding", async () => {
      const html = await toHtmlString("[click](javascript&#58;alert(1))");
      expect(html).not.toContain("javascript");
    });

    it("strips vbscript: URI", async () => {
      const html = await toHtmlString("[click](vbscript:msgbox(1))");
      expect(html).not.toContain("vbscript:");
    });

    it("strips data: URI with HTML", async () => {
      const html = await toHtmlString(
        "[click](data:text/html,<script>alert(1)</script>)"
      );
      expect(html).not.toContain("data:text/html");
    });

    it("strips data: URI base64 encoded", async () => {
      const html = await toHtmlString(
        "[click](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)"
      );
      expect(html).not.toContain("data:");
    });

    it("allows http: URI", async () => {
      const html = await toHtmlString("[link](http://example.com)");
      expect(html).toContain("http://example.com");
    });

    it("allows https: URI", async () => {
      const html = await toHtmlString("[link](https://example.com)");
      expect(html).toContain("https://example.com");
    });

    it("allows mailto: URI", async () => {
      const html = await toHtmlString("[email](mailto:test@example.com)");
      expect(html).toContain("mailto:test@example.com");
    });
  });

  describe("Attribute Injection Vectors", () => {
    it("strips onclick handler", async () => {
      const html = await toHtmlString('<div onclick="alert(1)">text</div>');
      expect(html).not.toContain("onclick");
    });

    it("strips onmouseover handler", async () => {
      const html = await toHtmlString(
        '<a href="#" onmouseover="alert(1)">link</a>'
      );
      expect(html).not.toContain("onmouseover");
    });

    it("strips onfocus handler", async () => {
      const html = await toHtmlString('<input onfocus="alert(1)">');
      expect(html).not.toContain("onfocus");
    });

    it("strips onerror on various elements", async () => {
      const html = await toHtmlString(
        '<video onerror="alert(1)"><source onerror="alert(2)">'
      );
      expect(html).not.toContain("onerror");
    });

    it("strips style attribute", async () => {
      const html = await toHtmlString(
        '<p style="background:url(javascript:alert(1))">text</p>'
      );
      expect(html).not.toContain("style=");
      expect(html).not.toContain("javascript");
    });
  });

  describe("Encoding Bypass Vectors", () => {
    it("handles HTML entity encoded script", async () => {
      const html = await toHtmlString(
        "&#60;script&#62;alert(1)&#60;/script&#62;"
      );
      expect(html).not.toContain("<script");
    });

    it("handles hex encoded javascript URI", async () => {
      const html = await toHtmlString(
        "[click](&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;alert(1))"
      );
      expect(html).not.toContain("javascript");
    });

    it("handles mixed case script tag", async () => {
      const html = await toHtmlString("<ScRiPt>alert(1)</ScRiPt>");
      expect(html.toLowerCase()).not.toContain("<script");
    });

    it("handles null byte injection", async () => {
      const html = await toHtmlString("<scr\x00ipt>alert(1)</script>");
      expect(html).not.toContain("<script");
    });
  });

  describe("Nested/Malformed Tag Vectors", () => {
    it("handles nested script in other tags", async () => {
      const html = await toHtmlString(
        "<div><p><script>alert(1)</script></p></div>"
      );
      expect(html).not.toContain("<script");
    });

    it("handles iframe injection", async () => {
      const html = await toHtmlString('<iframe src="javascript:alert(1)">');
      expect(html).not.toContain("<iframe");
    });

    it("handles object tag injection", async () => {
      const html = await toHtmlString('<object data="javascript:alert(1)">');
      expect(html).not.toContain("<object");
    });

    it("handles embed tag injection", async () => {
      const html = await toHtmlString('<embed src="javascript:alert(1)">');
      expect(html).not.toContain("<embed");
    });

    it("handles form action injection", async () => {
      const html = await toHtmlString(
        '<form action="javascript:alert(1)"><input type="submit"></form>'
      );
      expect(html).not.toContain("<form");
      expect(html).not.toContain("<input");
    });

    it("handles meta refresh injection", async () => {
      const html = await toHtmlString(
        '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">'
      );
      expect(html).not.toContain("<meta");
    });

    it("handles base tag injection", async () => {
      const html = await toHtmlString('<base href="javascript:alert(1)//">');
      expect(html).not.toContain("<base");
    });

    it("handles link tag injection", async () => {
      const html = await toHtmlString(
        '<link rel="stylesheet" href="javascript:alert(1)">'
      );
      expect(html).not.toContain("<link");
    });

    it("handles style tag injection", async () => {
      const html = await toHtmlString(
        "<style>body{background:url(javascript:alert(1))}</style>"
      );
      expect(html).not.toContain("<style");
    });
  });

  describe("SVG-based Vectors", () => {
    it("strips SVG with embedded script", async () => {
      const html = await toHtmlString("<svg><script>alert(1)</script></svg>");
      expect(html).not.toContain("<script");
    });

    it("strips SVG animate with onbegin", async () => {
      const html = await toHtmlString(
        '<svg><animate onbegin="alert(1)"></animate></svg>'
      );
      expect(html).not.toContain("onbegin");
    });

    it("strips SVG use with external reference", async () => {
      const html = await toHtmlString(
        '<svg><use href="data:image/svg+xml,<svg onload=alert(1)>"></use></svg>'
      );
      expect(html).not.toContain("onload");
    });
  });
});
