/**
 * Entry point for the question type system.
 *
 * Importing from here guarantees the built-in types are registered before any
 * lookup runs. Always import from `@/lib/questions`, never from
 * `@/lib/questions/registry` directly.
 */

import "./builtins";

export * from "./registry";
