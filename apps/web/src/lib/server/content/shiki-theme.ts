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
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "var(--color-text-tertiary)",
        fontStyle: "italic",
      },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "punctuation.definition.string",
      ],
      settings: {
        foreground: "var(--color-accent-warm)",
      },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.expression",
        "storage.type",
        "storage.modifier",
      ],
      settings: {
        foreground: "var(--color-accent-cool)",
      },
    },
    {
      scope: [
        "variable",
        "variable.other",
        "variable.parameter",
        "meta.definition.variable",
      ],
      settings: {
        foreground: "var(--color-text-secondary)",
      },
    },
    {
      scope: ["entity.name.function", "meta.function-call", "support.function"],
      settings: {
        foreground: "var(--color-text-primary)",
      },
    },
    {
      scope: [
        "constant",
        "constant.numeric",
        "constant.language",
        "constant.character",
        "support.constant",
      ],
      settings: {
        foreground: "var(--color-accent-dream)",
      },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
      ],
      settings: {
        foreground: "var(--color-accent-dream)",
      },
    },
    {
      scope: ["entity.name.tag", "meta.tag"],
      settings: {
        foreground: "var(--color-accent-cool)",
      },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: "var(--color-accent-warm)",
      },
    },
    {
      scope: [
        "punctuation",
        "punctuation.accessor",
        "punctuation.separator",
        "meta.brace",
      ],
      settings: {
        foreground: "var(--color-text-tertiary)",
      },
    },
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
    {
      scope: ["meta.property-name", "support.type.property-name"],
      settings: {
        foreground: "var(--color-text-primary)",
      },
    },
    {
      scope: ["entity.name.tag.yaml", "punctuation.definition.block.scalar"],
      settings: {
        foreground: "var(--color-accent-cool)",
      },
    },
    {
      scope: ["markup.heading", "entity.name.section"],
      settings: {
        foreground: "var(--color-text-primary)",
        fontStyle: "bold",
      },
    },
    {
      scope: ["markup.bold"],
      settings: {
        fontStyle: "bold",
      },
    },
    {
      scope: ["markup.italic"],
      settings: {
        fontStyle: "italic",
      },
    },
    {
      scope: ["markup.inline.raw", "markup.fenced_code"],
      settings: {
        foreground: "var(--color-accent-warm)",
      },
    },
    {
      scope: ["markup.list.numbered", "markup.list.unnumbered"],
      settings: {
        foreground: "var(--color-text-secondary)",
      },
    },
    {
      scope: ["meta.embedded", "source.groovy.embedded"],
      settings: {
        foreground: "var(--color-text-primary)",
      },
    },
  ],
} satisfies ThemeRegistrationRaw;
