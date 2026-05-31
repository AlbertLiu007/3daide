# 3daide UI Guidelines

This document defines the current visual and interaction standard for 3daide. New features should follow these rules so light mode, dark mode, hover states, focus states, and form controls stay consistent.

## Theme Tokens

Theme values live in [src/app/globals.css](/Users/albert/Documents/3daide/src/app/globals.css). Use CSS variables first; avoid adding one-off hex colors inside new components unless a new token is truly needed.

Light mode tokens:

| Token | Value | Usage |
| --- | --- | --- |
| `--page-bg` | `#f6f7f9` | App background |
| `--panel-bg` | `#ffffff` | Header, panels, menus |
| `--surface-bg` | `#f1f4f8` | Nested controls, metric boxes, subtle surfaces |
| `--surface-hover` | `#e4e9f1` | Active tabs and neutral hover surfaces |
| `--border-muted` | `#d8dee8` | Default borders |
| `--text-strong` | `#111827` | Headlines and strongest text |
| `--text-primary` | `#1f2937` | Main body text |
| `--text-secondary` | `#374151` | Secondary labels |
| `--text-muted` | `#64748b` | Helper text |
| `--text-subtle` | `#94a3b8` | Placeholders and quiet metadata |
| `--primary-button-bg` | `#3b82f6` | Primary buttons |
| `--primary-button-hover` | `#2563eb` | Primary button hover |
| `--primary-button-text` | `#ffffff` | Primary button text |
| `--hover-bg` | `rgba(59, 130, 246, 0.08)` | Standard light hover background |
| `--hover-border` | `rgba(59, 130, 246, 0.52)` | Standard light hover border |
| `--hover-text` | `#2563eb` | Standard light hover text |

Dark mode keeps the same interaction model with darker surfaces and stronger light text. Do not implement light-only interaction patterns unless they also have a dark-mode equivalent.

## Interaction Classes

Use the shared classes below instead of hand-writing hover or focus Tailwind utilities in each component.

### `interactive-hover`

Use for text buttons, header links, footer links, tabs, theme/language triggers, and low-emphasis controls.

Behavior:

- Transition duration: `160ms`
- Hover changes background, border, text color, and shadow if defined by the component
- Light mode hover should read as blue-accented but not like a primary action

Do:

```tsx
className="interactive-hover rounded-md border border-transparent px-2 py-1"
```

Avoid:

```tsx
className="hover:text-zinc-50 hover:bg-[#27272a]"
```

### `menu-item-hover`

Use for custom dropdown menu options. Native `select` controls should not be used for styled app menus when hover consistency matters.

Menu item standard:

- Height: `h-8`
- Radius: `rounded`
- Text size: `text-xs`
- Weight: `font-semibold`
- Check icon area: `w-4`
- Hover: `var(--hover-bg)` and `var(--hover-text)`

### `primary-action`

Use for primary conversion, submission, download, and other main user actions.

Standard:

- Background: `#3b82f6`
- Border: `#3b82f6`
- Text: white
- Hover: `#2563eb`
- Hover shadow: subtle blue shadow
- Disabled state should look like a muted version of the primary color, not a random gray block in light mode

Example:

```tsx
className="primary-action flex h-11 items-center justify-center gap-2 rounded-md border border-[#3b82f6] bg-[#3b82f6] text-sm font-semibold text-white"
```

### `secondary-action`

Use for framed utility buttons such as `Choose file`, `Customize Pricing Rules`, and viewer toolbar buttons.

Standard:

- Default surface: `bg-[#1f1f23]` in markup, mapped to light surface by global theme rules
- Default border: `border-[#27272a]`
- Hover background: `var(--hover-bg)`
- Hover border: `var(--hover-border)`
- Hover text: `var(--hover-text)`

### `field-interactive`

Use for text inputs, number inputs, and custom select trigger buttons.

Standard:

- Height: `h-11` for normal fields
- Height: `h-9` for compact pricing-rule fields
- Radius: `rounded-md`
- Border: `border-[#27272a]`
- Hover: white/panel background with blue border
- Focus: blue border plus `0 0 0 3px rgba(59, 130, 246, 0.16)`
- Width: use `w-full min-w-0` in grids to prevent overflow

## Upload Dropzone

Use `upload-dropzone` for the main `Drop your 3D model here` target.

Markup must include these child classes so text and format chips respond together:

- `upload-dropzone-title`
- `upload-dropzone-hint`
- `upload-dropzone-formats`

Light-mode hover standard:

- Background: `rgba(59, 130, 246, 0.11)`
- Border: `#3b82f6`
- Inner ring: `inset 0 0 0 1px rgba(59, 130, 246, 0.2)`
- Shadow: `0 18px 44px -32px rgba(37, 99, 235, 0.72)`
- Title: `#1d4ed8`
- Hint/formats: `#2563eb`

This is intentionally stronger than generic `interactive-hover`, because the dropzone is a large interaction target and must feel obviously clickable in light mode.

## Dropdowns

Styled dropdowns should be custom button + menu controls, not native `select`, when visual consistency is required.

Trigger standard:

- Use `interactive-hover` or `field-interactive` depending on context
- Height: `h-[34px]` for header controls
- Height: `h-11` for form controls
- Border: `var(--border-muted)` or `border-[#27272a]`
- Background: `var(--panel-bg)` or `bg-[#1f1f23]`
- Include `aria-haspopup="menu"` and `aria-expanded`

Menu standard:

- `rounded-md`
- `border border-[var(--border-muted)]`
- `bg-[var(--panel-bg)]`
- `p-1.5`
- `shadow-[0_14px_34px_-18px_rgba(15,23,42,0.42)]`
- Options use `menu-item-hover`

## Layout And Text Rules

- Use `rounded-md` for controls and compact panels.
- Use cards only for real repeated items, modals, and framed tools.
- Do not nest cards inside cards.
- In two-column input grids, labels need `min-w-0` and inputs need `w-full min-w-0`.
- Do not use oversized hero typography inside panels, toolbars, menus, or controls.
- Avoid negative letter spacing in new UI.
- Text should never overlap controls; use responsive widths, `min-w-0`, and wrapping where needed.

## Implementation Checklist

Before adding or changing a UI feature:

1. Use existing theme tokens from `globals.css`.
2. Pick one shared interaction class: `interactive-hover`, `primary-action`, `secondary-action`, `field-interactive`, `menu-item-hover`, or `upload-dropzone`.
3. Verify both light and dark themes.
4. Verify hover and keyboard focus states.
5. Check disabled state if the control can be disabled.
6. Run `npm run pages:build` and `npm run typecheck`.

If a new component needs a new interaction pattern, add a named class in `globals.css` and document it here in the same change.
