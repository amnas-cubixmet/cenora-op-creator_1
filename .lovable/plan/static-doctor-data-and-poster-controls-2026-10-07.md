# Static doctor data and poster controls

## Changes
- Replace browser-managed doctor records with a typed static configuration matching the requested schema, including qualification arrays, department fields, visiting-day labels, image paths, and `HH:mm` timings.
- Update poster selection, timing overrides, search, and doctor imagery to consume the static configuration through one adapter.
- Remove the Doctors management page and its navigation entry so there are no add, edit, upload, or delete controls.
- Add a “Show date” switch beside the date selection. Keep it off initially, remember the preference in the browser, and print the selected date in the poster header only when enabled.
- Show “പാണ്ടിക്കാട്” in the Malayalam footer and “Pandikkad” in English.
- Increase department text size and weight slightly across poster layouts.
- Improve narrow-screen behavior for the header, date controls, doctor rows, timing rows, language controls, and poster workspace.

## Validation
- Add focused tests for the static doctor conversion and date visibility preference where practical.
- Run relevant tests, confirm the preview builds, then verify desktop and mobile rendering and date-toggle persistence in the browser.

## Technical details
- Keep the existing in-session ability to select doctors, reorder them, and temporarily adjust a selected day’s times; only doctor record management becomes static.
- Use the current poster and export pipeline so downloaded images match the preview.
