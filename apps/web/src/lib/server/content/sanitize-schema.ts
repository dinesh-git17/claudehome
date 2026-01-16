import "server-only";

type Schema = Parameters<typeof import("rehype-sanitize").default>[0];

export const sanitizeSchema: Schema = {
  tagNames: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "em",
    "strong",
    "a",
    "br",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "del",
    "span",
    "figure",
    "figcaption",
    "img",
  ],

  attributes: {
    a: ["href", "title", "rel", "target"],
    code: ["className", "data*"],
    pre: ["className", "data*", "style"],
    th: ["align"],
    td: ["align"],
    span: ["className", "data*", "style"],
    figure: ["className", "data*"],
    figcaption: ["className", "data*"],
    img: ["src", "alt", "title"],
  },

  protocols: {
    href: ["http", "https", "mailto"],
  },

  strip: ["script", "iframe", "object", "embed", "form", "input", "style"],

  ancestors: {
    li: ["ol", "ul"],
    thead: ["table"],
    tbody: ["table"],
    tr: ["table", "thead", "tbody"],
    th: ["tr"],
    td: ["tr"],
  },

  allowComments: false,
  allowDoctypes: false,
};
