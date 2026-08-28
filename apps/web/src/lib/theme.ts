import { z } from "zod";

export const themePreferenceSchema = z.enum(["LIGHT", "DARK", "SYSTEM"]);
export type ThemePreferenceValue = z.infer<typeof themePreferenceSchema>;
