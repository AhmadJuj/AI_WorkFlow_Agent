import { nanoid } from "nanoid";

export function generateId(type: string): string {
  return `${type.toLowerCase()}-${nanoid(10)}`;
}