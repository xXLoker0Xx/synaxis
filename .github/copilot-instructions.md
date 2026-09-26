# BioLunar workspace guidance

- Keep the app Expo + React Native + TypeScript and follow the existing `src/app`, `src/core`, `src/data`, and `src/components` separation.
- Keep solar/lunar computations client-side, typed, and deterministic; do not present lunar symbolism as causal or predictive.
- Treat chronobiology as general educational context, not medical advice or hormone measurement.
- Persist journal entries and decision results locally; request GPS only while in use and retain a non-GPS fallback.
- Use SDK-compatible Expo packages and run `npm run typecheck` after code changes.
