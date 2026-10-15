/**
 * Input limits for prospects, reports and the imported-player bulk delete.
 * The Zod schemas in validation.ts enforce these on every server action.
 */
export const GRADE_MIN = 20;
export const GRADE_MAX = 80;
export const WEIGHT_MIN = 100;
export const WEIGHT_MAX = 350;

/** Word a writer must type before imported MLB players are bulk-deleted. */
export const CLEAR_IMPORTED_CONFIRMATION = "CLEAR";
