import Mustache from "mustache";
import { nanoid } from "nanoid";

export function generateId(type: string): string {
  return `${type.toLowerCase()}-${nanoid(10)}`;
}

export function replaceVariables(
  template: string,
  variables: Record<string, any>)
  {
    return Mustache.render(template, variables);
  }