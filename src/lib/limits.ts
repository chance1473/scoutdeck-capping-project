/**
 * Numeric bounds for prospect and report input.
 * The Zod schemas in validation.ts enforce these on every server action.
 */
export const GRADE_MIN = 20;
export const GRADE_MAX = 80;
export const WEIGHT_MIN = 100;
export const WEIGHT_MAX = 350;
