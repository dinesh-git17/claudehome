# Output Patterns

Design patterns for consistent, high-quality output in skills.

## Template Pattern

Use when output must follow a specific structure.

### Strict Template

For APIs, data formats, or standardized outputs:

```markdown
## Output Format

ALWAYS use this exact structure:

\`\`\`
[Header Section]

- Field 1: {value}
- Field 2: {value}

[Body Section]
{content}

[Footer Section]
Generated: {timestamp}
\`\`\`
```

### Flexible Template

For context-dependent outputs:

```markdown
## Output Format

Use this structure as a sensible default, adapting as needed:

\`\`\`

## Summary

[Key findings]

## Details

[Supporting information]

## Recommendations

[Actionable items]
\`\`\`
```

## Examples Pattern

Use when desired output style is easier to demonstrate than describe.

### Input/Output Examples

```markdown
## Examples

**Input**: "Added user authentication with JWT tokens"

**Output**:
\`\`\`
feat(auth): add JWT-based user authentication

Implement token-based authentication system with:

- Token generation on login
- Token validation middleware
- Refresh token rotation
  \`\`\`
```

### Before/After Examples

```markdown
## Examples

**Before**:
\`\`\`sql
select \* from users where active = 1
\`\`\`

**After**:
\`\`\`sql
select
user_id,
user_name,
email,
created_at
from {{ ref('stg_users') }}
where is_active = true
\`\`\`
```

## Best Practices

- Match template strictness to output requirements
- Provide examples when style matters more than structure
- Include both good and bad examples for clarity
- Use placeholders consistently (`{value}`, `[section]`)
