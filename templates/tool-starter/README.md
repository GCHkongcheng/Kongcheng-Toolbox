# Tool Starter

## Files

- `manifest.ts`: tool metadata contract.
- `page.tsx`: UI entry with input/output/loading/error states.

## Usage

1. Copy this folder to `src/tools/<tool-id>/`.
2. Update `manifest.ts` fields.
3. Replace demo logic in `page.tsx`.
4. Run `npm run gen:tools` to auto-generate registry.

## Validation

- Run `npx tsc --noEmit`
- Run `npm run lint`
