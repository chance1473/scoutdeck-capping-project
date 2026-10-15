/**
 * Numeric bounds already enforced elsewhere.
 * Prospect weight and report grade are validated by Zod in server actions.
 * This module only names those limits; it is not a second schema.
 */
export const GRADE_MIN = 20;
export const GRADE_MAX = 80;
export const WEIGHT_MIN = 100;
export const WEIGHT_MAX = 350;
