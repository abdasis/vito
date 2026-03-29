# Project Guidelines

## Core Rules (High Priority)

- Write LESS code. Reuse existing code. No redundant code.
- Analyse codebase before adding new code. Check sibling files for conventions.
- Never run `npm build/dev` or `artisan serve` - user runs them.
- Don't run formatters (pint/prettier) - user runs them later.
- **NEVER modify files in `resources/js/components/ui/`** unless explicitly instructed.

## Stack

Laravel 12 (L10 structure), PHP 8.4, Inertia v2, React 19, Tailwind v4, PHPUnit 11

## Laravel Boost MCP Tools

- `search-docs`: Use FIRST for Laravel ecosystem docs (version-aware). Pass multiple broad queries.
- `list-artisan-commands`: Check before running artisan commands.
- `tinker`: Debug PHP/Eloquent. `database-query`: Read-only DB queries.
- `get-absolute-url`: For sharing project URLs.
- `browser-logs`: Recent browser errors/exceptions.

## PHP

- Curly braces always. Constructor property promotion. Explicit return types.
- PHPDoc blocks over inline comments. Array shapes where appropriate.
- Avoid `DB::`, prefer `Model::query()`. Eager load to prevent N+1.
- Use `config()` not `env()` outside config files.

## Laravel

- Use `php artisan make:*` with `--no-interaction` for new files.
- Form Request classes for validation, not inline.
- Queued jobs for slow operations (`ShouldQueue`).
- Named routes with `route()` function.
- L10 structure: Middleware in `app/Http/Kernel.php`, Providers in `app/Providers/`.
- Use Actions. Thin Controllers. follow the pattern.
- Use Policies for authorization, not inline checks.
- Don't use FormRequests. Validations in Actions.
- Use Resource classes for API responses.

## Frontend

- Inertia pages in `resources/js/pages`. Use `Inertia::render()`.
- Forms with `useForm` helper (follow existing patterns). Navigation with `<Link>` or `router.visit()`.
- Tailwind v4: Use `@import "tailwindcss"`, `@theme` for config, gap not margins.
- Use Shadcn components and shadcn patterns like `text-foreground`, `bg-background`, ...
- React components in `resources/js/components`. Use functional components and hooks.
- Always use arrow functions for React components: `const MyComponent = () => { ... }`, never `function MyComponent() { ... }`.
- CSS in `resources/css`. Use Tailwind utility classes. Avoid custom CSS unless necessary.
- **NEVER disable type checking**: Do not use `@ts-expect-error`, `@ts-ignore`, `@ts-nocheck`, or `any` type. Always use proper TypeScript types, generics, or type guards instead.

### Modal Style (Soft UI / Subtle Glass)

Always use `Dialog` (not `Sheet`) for modals. Apply the double-wrapper pattern:

```tsx
<DialogContent
  showCloseButton={false}
  className="w-full max-w-3xl overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
>
  {/* Inner content — contrasts with outer wrapper */}
  <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
    {/* Header */}
    <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <DialogTitle>...</DialogTitle>
        <DialogDescription>...</DialogDescription>
      </div>
      <DialogClose asChild>
        <Button variant="ghost" size="icon" className="size-7 shrink-0">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogClose>
    </DialogHeader>

    {/* Scrollable body */}
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="p-5">...</div>
    </div>

    {/* Footer */}
    <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
      ...
    </DialogFooter>
  </div>
</DialogContent>
```

Rules:
- Outer wrapper: `rounded-2xl` gradient muted bg + `p-2` (acts as visual frame)
- Inner wrapper: `rounded-xl bg-background/90 ring-1 ring-foreground/6` (contrasts with outer)
- Header & footer: `bg-muted/30` with `border-foreground/6` separator
- Body: `max-h-[70vh] overflow-y-auto` for scrollable content
- Always include manual close button (`XIcon`) in header, set `showCloseButton={false}` on `DialogContent`

### Card Style (Soft UI / Subtle Glass)

Use the same double-wrapper pattern for cards. Title/header lives in the outer wrapper, content in the inner wrapper:

```tsx
{/* Standard card */}
<div className="overflow-hidden rounded-2xl bg-gradient-to-b from-muted/60 to-muted/30 p-1 ring-1 ring-foreground/8">
  {/* Header — in outer wrapper */}
  <div className="flex items-center justify-between gap-2 px-5 py-4">
    <div className="space-y-0.5">
      <CardTitle>...</CardTitle>
      <CardDescription>...</CardDescription>
    </div>
    {/* Optional action buttons */}
  </div>
  {/* Inner content */}
  <div className="overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
    <div className="p-5">...</div>
  </div>
</div>

{/* Destructive card */}
<div className="overflow-hidden rounded-2xl bg-gradient-to-b from-destructive/10 to-destructive/5 p-1 ring-1 ring-destructive/20">
  <div className="px-5 py-4">
    <CardTitle>...</CardTitle>
    <CardDescription>...</CardDescription>
  </div>
  <div className="overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
    <div className="p-5">...</div>
  </div>
</div>
```

Rules:
- Outer wrapper: `rounded-2xl` gradient muted bg + `p-1` (acts as visual frame), no shadow
- Inner wrapper: `rounded-xl bg-background/90 ring-1 ring-foreground/6` (contrasts with outer)
- Title/description in outer wrapper, content in inner wrapper
- Destructive cards: use `from-destructive/10 to-destructive/5` + `ring-destructive/20` for outer wrapper
- Use `CardTitle` and `CardDescription` from shadcn for text, but do not use `Card`/`CardHeader`/`CardContent` wrappers

## Testing

- PHPUnit only. Create with `php artisan make:test --phpunit`.
- Test logic only, not framework. Use factories. RefreshDatabase trait.
- Add to existing test files when possible. Run minimal tests with `--filter`.
- Don't remove tests without approval.
- Feature tests for user flows, Unit tests for isolated logic.
- Mock external services. Use `Http::fake()` for HTTP calls.
- Use `assertDatabaseHas()` for DB assertions.
- Use RefreshDatabase trait for clean state.

## API

- Consider API endpoints for new features but ask user first.
- Use API Resources for consistent responses.
- Document endpoints in `public/api-docs/openapi`

## Git

- Use `gh` CLI for issues/PRs.
- Don't change dependencies or create new base folders without approval.

## SSH

- All SSH commands are being run using app/Helpers/SSH.php
