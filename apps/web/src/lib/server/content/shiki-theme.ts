import "server-only";

import type { ThemeRegistrationRaw } from "shiki";

/**
 * Contemplative Design System colors in OKLCH.
 * Shiki requires actual color values (CSS variables don't work in themes).
 */
const colors = {
  surface: "oklch(12% 0.02 260)",
  textPrimary: "oklch(92% 0.01 260)",
  textSecondary: "oklch(65% 0.01 260)",
  textTertiary: "oklch(45% 0.01 260)",
  accentWarm: "oklch(70% 0.15 50)",
  accentCool: "oklch(70% 0.12 250)",
  accentDream: "oklch(75% 0.18 320)",
};

export const contemplativeTheme = {
  name: "contemplative",
  type: "dark" as const,
  colors: {
    "editor.background": colors.surface,
    "editor.foreground": colors.textPrimary,
  },
  settings: [
    // Default foreground/background (must be first, no scope)
    {
      settings: {
        foreground: colors.textPrimary,
        background: colors.surface,
      },
    },
    // Comments
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: colors.textTertiary,
        fontStyle: "italic",
      },
    },
    // Strings
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "punctuation.definition.string",
      ],
      settings: {
        foreground: colors.accentWarm,
      },
    },
    // Keywords
    {
      scope: [
        "keyword",
        "keyword.control",
        "storage.type",
        "storage.type.function.python",
        "storage.type.class.python",
        "storage.modifier",
      ],
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Variables
    {
      scope: [
        "variable",
        "variable.other",
        "variable.parameter",
        "meta.definition.variable",
      ],
      settings: {
        foreground: colors.textSecondary,
      },
    },
    // Functions
    {
      scope: ["entity.name.function", "meta.function-call", "support.function"],
      settings: {
        foreground: colors.textPrimary,
      },
    },
    // Built-in functions (Python)
    {
      scope: ["support.function.builtin.python"],
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Constants
    {
      scope: [
        "constant",
        "constant.numeric",
        "constant.language",
        "support.constant",
      ],
      settings: {
        foreground: colors.accentDream,
      },
    },
    // Types and classes
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
      ],
      settings: {
        foreground: colors.accentDream,
      },
    },
    // Self/this
    {
      scope: [
        "variable.language.self",
        "variable.language.this",
        "variable.parameter.function.language.special.self.python",
      ],
      settings: {
        foreground: colors.accentDream,
        fontStyle: "italic",
      },
    },
    // Decorators (Python)
    {
      scope: [
        "entity.name.function.decorator.python",
        "punctuation.definition.decorator",
      ],
      settings: {
        foreground: colors.accentWarm,
      },
    },
    // Tags
    {
      scope: ["entity.name.tag", "meta.tag"],
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Attributes
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: colors.accentWarm,
      },
    },
    // Punctuation
    {
      scope: [
        "punctuation",
        "punctuation.accessor",
        "punctuation.separator",
        "meta.brace",
      ],
      settings: {
        foreground: colors.textTertiary,
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
        foreground: colors.textSecondary,
      },
    },
    // Properties
    {
      scope: ["meta.property-name", "support.type.property-name"],
      settings: {
        foreground: colors.textPrimary,
      },
    },
    // YAML
    {
      scope: ["entity.name.tag.yaml", "punctuation.definition.block.scalar"],
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Markdown headings
    {
      scope: ["markup.heading", "entity.name.section"],
      settings: {
        foreground: colors.accentCool,
        fontStyle: "bold",
      },
    },
    // Markdown bold/italic
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
    // Markdown code
    {
      scope: ["markup.inline.raw", "markup.fenced_code"],
      settings: {
        foreground: colors.accentWarm,
      },
    },
    // Markdown links
    {
      scope: ["markup.underline.link", "string.other.link"],
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Markdown lists
    {
      scope: ["markup.list.numbered", "markup.list.unnumbered"],
      settings: {
        foreground: colors.accentDream,
      },
    },
    // Markdown blockquote
    {
      scope: ["markup.quote"],
      settings: {
        foreground: colors.textTertiary,
        fontStyle: "italic",
      },
    },
    // Embedded
    {
      scope: ["meta.embedded", "source.groovy.embedded"],
      settings: {
        foreground: colors.textPrimary,
      },
    },
  ],
} satisfies ThemeRegistrationRaw;
