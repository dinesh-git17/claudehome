import "server-only";

import type { ThemeRegistrationRaw } from "shiki";

export const contemplativeTheme = {
  name: "contemplative",
  type: "dark",
  colors: {
    "editor.background": "var(--color-surface)",
    "editor.foreground": "var(--color-text-primary)",
  },
  settings: [],
  tokenColors: [
    // Comments
    {
      scope: [
        "comment",
        "comment.line",
        "comment.block",
        "punctuation.definition.comment",
      ],
      settings: {
        foreground: "var(--color-text-tertiary)",
        fontStyle: "italic",
      },
    },
    // Strings
    {
      scope: [
        "string",
        "string.quoted",
        "string.quoted.single",
        "string.quoted.double",
        "string.quoted.triple",
        "string.quoted.docstring",
        "string.template",
        "punctuation.definition.string",
      ],
      settings: {
        foreground: "var(--color-accent-warm)",
      },
    },
    // Keywords
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.control.flow",
        "keyword.control.import",
        "keyword.control.from",
        "keyword.operator.expression",
        "keyword.operator.logical.python",
        "storage.type",
        "storage.type.function",
        "storage.type.class",
        "storage.modifier",
      ],
      settings: {
        foreground: "var(--color-accent-cool)",
      },
    },
    // Variables and parameters
    {
      scope: [
        "variable",
        "variable.other",
        "variable.parameter",
        "variable.parameter.function",
        "meta.definition.variable",
        "meta.function-call.arguments",
      ],
      settings: {
        foreground: "var(--color-text-secondary)",
      },
    },
    // Functions
    {
      scope: [
        "entity.name.function",
        "meta.function-call",
        "support.function",
        "support.function.builtin",
        "meta.function-call.generic",
      ],
      settings: {
        foreground: "var(--color-text-primary)",
      },
    },
    // Constants and numbers
    {
      scope: [
        "constant",
        "constant.numeric",
        "constant.language",
        "constant.language.python",
        "constant.character",
        "support.constant",
        "constant.other",
      ],
      settings: {
        foreground: "var(--color-accent-dream)",
      },
    },
    // Types and classes
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "support.type.python",
      ],
      settings: {
        foreground: "var(--color-accent-dream)",
      },
    },
    // Built-in functions (Python)
    {
      scope: ["support.function.builtin.python"],
      settings: {
        foreground: "var(--color-accent-cool)",
      },
    },
    // Self/this
    {
      scope: [
        "variable.language.self",
        "variable.language.this",
        "variable.parameter.function.language.special.self",
      ],
      settings: {
        foreground: "var(--color-accent-dream)",
        fontStyle: "italic",
      },
    },
    // Decorators (Python)
    {
      scope: [
        "entity.name.function.decorator",
        "meta.function.decorator",
        "punctuation.definition.decorator",
      ],
      settings: {
        foreground: "var(--color-accent-warm)",
      },
    },
    // Tags (HTML/XML)
    {
      scope: ["entity.name.tag", "meta.tag"],
      settings: {
        foreground: "var(--color-accent-cool)",
      },
    },
    // Attributes
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: "var(--color-accent-warm)",
      },
    },
    // Punctuation
    {
      scope: [
        "punctuation",
        "punctuation.accessor",
        "punctuation.separator",
        "punctuation.section",
        "meta.brace",
      ],
      settings: {
        foreground: "var(--color-text-tertiary)",
      },
    },
    // Operators
    {
      scope: [
        "keyword.operator",
        "keyword.operator.assignment",
        "keyword.operator.arithmetic",
        "keyword.operator.logical",
        "keyword.operator.comparison",
      ],
      settings: {
        foreground: "var(--color-text-secondary)",
      },
    },
    // Properties
    {
      scope: ["meta.property-name", "support.type.property-name"],
      settings: {
        foreground: "var(--color-text-primary)",
      },
    },
    // YAML
    {
      scope: ["entity.name.tag.yaml", "punctuation.definition.block.scalar"],
      settings: {
        foreground: "var(--color-accent-cool)",
      },
    },
    // Markdown headings
    {
      scope: [
        "markup.heading",
        "entity.name.section",
        "punctuation.definition.heading",
      ],
      settings: {
        foreground: "var(--color-accent-cool)",
        fontStyle: "bold",
      },
    },
    // Markdown bold
    {
      scope: ["markup.bold", "punctuation.definition.bold"],
      settings: {
        foreground: "var(--color-text-primary)",
        fontStyle: "bold",
      },
    },
    // Markdown italic
    {
      scope: ["markup.italic", "punctuation.definition.italic"],
      settings: {
        foreground: "var(--color-text-primary)",
        fontStyle: "italic",
      },
    },
    // Markdown code
    {
      scope: [
        "markup.inline.raw",
        "markup.fenced_code",
        "markup.raw",
        "fenced_code.block.language",
      ],
      settings: {
        foreground: "var(--color-accent-warm)",
      },
    },
    // Markdown links
    {
      scope: [
        "markup.underline.link",
        "string.other.link",
        "punctuation.definition.link",
      ],
      settings: {
        foreground: "var(--color-accent-cool)",
      },
    },
    // Markdown link text
    {
      scope: ["string.other.link.title", "string.other.link.description"],
      settings: {
        foreground: "var(--color-accent-warm)",
      },
    },
    // Markdown lists
    {
      scope: [
        "markup.list.numbered",
        "markup.list.unnumbered",
        "punctuation.definition.list.begin",
      ],
      settings: {
        foreground: "var(--color-accent-dream)",
      },
    },
    // Markdown blockquote
    {
      scope: ["markup.quote", "punctuation.definition.quote.begin"],
      settings: {
        foreground: "var(--color-text-tertiary)",
        fontStyle: "italic",
      },
    },
    // Embedded source
    {
      scope: ["meta.embedded", "source.groovy.embedded"],
      settings: {
        foreground: "var(--color-text-primary)",
      },
    },
  ],
} satisfies ThemeRegistrationRaw;
