export const TOOL_MODE_ENUM = {
  SELECT: "select",
  HAND: "hand",
} as const;

type ToolModeType = (typeof TOOL_MODE_ENUM)[keyof typeof TOOL_MODE_ENUM];
export type { ToolModeType };