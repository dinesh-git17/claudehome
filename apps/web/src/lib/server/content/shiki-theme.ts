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
  type: "dark",
  colors: {
    "editor.background": colors.surface,
    "editor.foreground": colors.textPrimary,
  },
  settings: [
    // Default foreground/background
    {
      settings: {
        foreground: colors.textPrimary,
        background: colors.surface,
      },
    },
    // Comments
    {
      scope: "comment",
      settings: {
        foreground: colors.textTertiary,
        fontStyle: "italic",
      },
    },
    {
      scope: "comment.line",
      settings: {
        foreground: colors.textTertiary,
        fontStyle: "italic",
      },
    },
    {
      scope: "punctuation.definition.comment",
      settings: {
        foreground: colors.textTertiary,
      },
    },
    // Strings
    {
      scope: "string",
      settings: {
        foreground: colors.accentWarm,
      },
    },
    {
      scope: "string.quoted",
      settings: {
        foreground: colors.accentWarm,
      },
    },
    {
      scope: "punctuation.definition.string",
      settings: {
        foreground: colors.accentWarm,
      },
    },
    // Keywords (Python: def, class, if, for, etc.)
    {
      scope: "keyword",
      settings: {
        foreground: colors.accentCool,
      },
    },
    {
      scope: "keyword.control",
      settings: {
        foreground: colors.accentCool,
      },
    },
    {
      scope: "storage.type.function.python",
      settings: {
        foreground: colors.accentCool,
      },
    },
    {
      scope: "storage.type.class.python",
      settings: {
        foreground: colors.accentCool,
      },
    },
    {
      scope: "storage.type",
      settings: {
        foreground: colors.accentCool,
      },
    },
    {
      scope: "storage.modifier",
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Function definitions
    {
      scope: "entity.name.function",
      settings: {
        foreground: colors.textPrimary,
      },
    },
    {
      scope: "entity.name.function.python",
      settings: {
        foreground: colors.textPrimary,
      },
    },
    // Built-in functions (Python: print, len, range, etc.)
    {
      scope: "support.function.builtin.python",
      settings: {
        foreground: colors.accentCool,
      },
    },
    {
      scope: "support.function",
      settings: {
        foreground: colors.textPrimary,
      },
    },
    // Variables and parameters
    {
      scope: "variable",
      settings: {
        foreground: colors.textSecondary,
      },
    },
    {
      scope: "variable.parameter",
      settings: {
        foreground: colors.textSecondary,
      },
    },
    // Constants and numbers
    {
      scope: "constant",
      settings: {
        foreground: colors.accentDream,
      },
    },
    {
      scope: "constant.numeric",
      settings: {
        foreground: colors.accentDream,
      },
    },
    {
      scope: "constant.language",
      settings: {
        foreground: colors.accentDream,
      },
    },
    // Types and classes
    {
      scope: "entity.name.type",
      settings: {
        foreground: colors.accentDream,
      },
    },
    {
      scope: "entity.name.class",
      settings: {
        foreground: colors.accentDream,
      },
    },
    {
      scope: "support.type",
      settings: {
        foreground: colors.accentDream,
      },
    },
    // Self/this
    {
      scope: "variable.language.self",
      settings: {
        foreground: colors.accentDream,
        fontStyle: "italic",
      },
    },
    {
      scope: "variable.parameter.function.language.special.self.python",
      settings: {
        foreground: colors.accentDream,
        fontStyle: "italic",
      },
    },
    // Decorators (Python)
    {
      scope: "entity.name.function.decorator.python",
      settings: {
        foreground: colors.accentWarm,
      },
    },
    {
      scope: "punctuation.definition.decorator",
      settings: {
        foreground: colors.accentWarm,
      },
    },
    // Punctuation
    {
      scope: "punctuation",
      settings: {
        foreground: colors.textTertiary,
      },
    },
    {
      scope: "meta.brace",
      settings: {
        foreground: colors.textTertiary,
      },
    },
    // Operators
    {
      scope: "keyword.operator",
      settings: {
        foreground: colors.textSecondary,
      },
    },
    // Tags (HTML/XML)
    {
      scope: "entity.name.tag",
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Attributes
    {
      scope: "entity.other.attribute-name",
      settings: {
        foreground: colors.accentWarm,
      },
    },
    // Properties (JSON, YAML)
    {
      scope: "support.type.property-name",
      settings: {
        foreground: colors.accentCool,
      },
    },
    {
      scope: "entity.name.tag.yaml",
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Markdown headings
    {
      scope: "markup.heading",
      settings: {
        foreground: colors.accentCool,
        fontStyle: "bold",
      },
    },
    {
      scope: "entity.name.section",
      settings: {
        foreground: colors.accentCool,
        fontStyle: "bold",
      },
    },
    {
      scope: "punctuation.definition.heading",
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Markdown bold
    {
      scope: "markup.bold",
      settings: {
        fontStyle: "bold",
      },
    },
    // Markdown italic
    {
      scope: "markup.italic",
      settings: {
        fontStyle: "italic",
      },
    },
    // Markdown code
    {
      scope: "markup.inline.raw",
      settings: {
        foreground: colors.accentWarm,
      },
    },
    {
      scope: "markup.fenced_code",
      settings: {
        foreground: colors.accentWarm,
      },
    },
    // Markdown links
    {
      scope: "markup.underline.link",
      settings: {
        foreground: colors.accentCool,
      },
    },
    {
      scope: "string.other.link",
      settings: {
        foreground: colors.accentCool,
      },
    },
    // Markdown lists
    {
      scope: "markup.list",
      settings: {
        foreground: colors.accentDream,
      },
    },
    {
      scope: "punctuation.definition.list.begin",
      settings: {
        foreground: colors.accentDream,
      },
    },
    // Markdown blockquote
    {
      scope: "markup.quote",
      settings: {
        foreground: colors.textTertiary,
        fontStyle: "italic",
      },
    },
  ],
} satisfies ThemeRegistrationRaw;
