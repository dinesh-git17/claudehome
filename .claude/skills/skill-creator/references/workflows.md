# Workflow Patterns

Design patterns for organizing multi-step processes in skills.

## Sequential Workflows

Use when tasks must complete in a specific order.

### Pattern

```markdown
## Workflow

1. **Phase 1**: [Action] - run `scripts/step1.py`
2. **Phase 2**: [Action] - run `scripts/step2.py`
3. **Phase 3**: [Action] - run `scripts/step3.py`
4. **Verify**: Confirm output matches expectations
```

### Example: Data Processing

```markdown
## Processing Workflow

1. **Validate input**: Run schema validation on source files
2. **Transform**: Apply business logic transformations
3. **Load**: Write to destination format
4. **Verify**: Confirm row counts and checksums
```

## Conditional Workflows

Use when execution paths depend on context.

### Pattern

```markdown
## Workflow

Determine the task type:

**Creating new content?** → Follow Creation Workflow
**Modifying existing content?** → Follow Modification Workflow
**Analyzing content?** → Follow Analysis Workflow

### Creation Workflow

1. [Steps for creation]

### Modification Workflow

1. [Steps for modification]

### Analysis Workflow

1. [Steps for analysis]
```

### Example: Model Development

```markdown
## Workflow

Determine the model type:

**Staging model?** → Follow Staging Workflow
**Intermediate model?** → Follow Intermediate Workflow
**Mart model?** → Follow Mart Workflow

### Staging Workflow

1. Source from raw tables
2. Rename columns to snake_case
3. Cast types explicitly
4. Generate surrogate keys

### Intermediate Workflow

1. Reference staging models
2. Join related entities
3. Apply business logic
4. Materialize as ephemeral

### Mart Workflow

1. Reference intermediate models
2. Build final structure
3. Add comprehensive tests
4. Materialize as table
```

## Best Practices

- Provide process overview upfront
- Number steps explicitly
- Include verification at the end
- Reference scripts by path when deterministic execution is needed
