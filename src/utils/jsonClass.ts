// Infer a schema from a parsed JSON value and emit class / struct / interface
// definitions in multiple languages. Runs entirely in the browser — no server
// round-trip, no heavyweight codegen dependency.

export type Prim = 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'any'

export type FieldShape =
  | { kind: 'prim'; type: Prim }
  | { kind: 'array'; items: FieldShape }
  | { kind: 'object'; ref: string }

export interface NamedType {
  name: string
  fields: { name: string; shape: FieldShape }[]
}

export interface Schema {
  root: FieldShape
  types: NamedType[]
}

export type Language = 'typescript' | 'csharp' | 'java' | 'python' | 'go' | 'rust'

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'csharp',     label: 'C#' },
  { id: 'java',       label: 'Java' },
  { id: 'python',     label: 'Python' },
  { id: 'go',         label: 'Go' },
  { id: 'rust',       label: 'Rust' },
]

// -----------------------------------------------------------------------------
// Schema inference
// -----------------------------------------------------------------------------

function pascalCase(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'Root'
}

function singularize(name: string): string {
  if (/ies$/i.test(name)) return name.replace(/ies$/i, 'y')
  if (/ses$/i.test(name)) return name.replace(/es$/i, '')
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.replace(/s$/i, '')
  return name + 'Item'
}

function inferPrim(v: unknown): Prim {
  if (v === null) return 'null'
  if (typeof v === 'string') return 'string'
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number'
  if (typeof v === 'boolean') return 'boolean'
  return 'any'
}

// Merge two shapes for the same position (e.g. array elements or fields).
// Widen to `any` on incompatibility. Integers widen to numbers.
function mergeShape(a: FieldShape, b: FieldShape): FieldShape {
  if (a.kind !== b.kind) {
    if (a.kind === 'prim' && b.kind === 'prim') {
      // unreachable: same kind covered above — keep TS happy
      return a
    }
    return { kind: 'prim', type: 'any' }
  }
  if (a.kind === 'prim' && b.kind === 'prim') {
    if (a.type === b.type) return a
    if (a.type === 'null') return b
    if (b.type === 'null') return a
    if ((a.type === 'integer' && b.type === 'number') || (a.type === 'number' && b.type === 'integer')) {
      return { kind: 'prim', type: 'number' }
    }
    return { kind: 'prim', type: 'any' }
  }
  if (a.kind === 'array' && b.kind === 'array') {
    return { kind: 'array', items: mergeShape(a.items, b.items) }
  }
  if (a.kind === 'object' && b.kind === 'object') {
    // Keep the first ref; merge happens at NamedType level.
    return a
  }
  return { kind: 'prim', type: 'any' }
}

function nameFor(base: string, types: Map<string, NamedType>): string {
  if (!types.has(base)) return base
  let i = 2
  while (types.has(`${base}${i}`)) i++
  return `${base}${i}`
}

interface InferCtx {
  types: Map<string, NamedType>
}

function inferValue(value: unknown, suggestedName: string, ctx: InferCtx): FieldShape {
  if (value === null) return { kind: 'prim', type: 'null' }
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'array', items: { kind: 'prim', type: 'any' } }
    let items = inferValue(value[0], singularize(suggestedName), ctx)
    for (let i = 1; i < value.length; i++) {
      items = mergeShape(items, inferValue(value[i], singularize(suggestedName), ctx))
    }
    return { kind: 'array', items }
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const base = pascalCase(suggestedName)
    const typeName = nameFor(base, ctx.types)
    const fields: NamedType['fields'] = []
    // Reserve name slot so nested objects can find it
    ctx.types.set(typeName, { name: typeName, fields })
    for (const key of Object.keys(obj)) {
      fields.push({ name: key, shape: inferValue(obj[key], key, ctx) })
    }
    return { kind: 'object', ref: typeName }
  }
  return { kind: 'prim', type: inferPrim(value) }
}

export function inferSchema(value: unknown, rootName = 'Root'): Schema {
  const ctx: InferCtx = { types: new Map() }
  const root = inferValue(value, rootName, ctx)
  return { root, types: Array.from(ctx.types.values()) }
}

// -----------------------------------------------------------------------------
// Language generators
// -----------------------------------------------------------------------------

function joinTypes(blocks: string[]): string {
  return blocks.join('\n\n').trim() + '\n'
}

function camelCase(s: string): string {
  const pc = pascalCase(s)
  return pc.charAt(0).toLowerCase() + pc.slice(1)
}

function snakeCase(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
    .replace(/^_|_$/g, '')
}

// TypeScript ------------------------------------------------------------------

function tsType(shape: FieldShape): string {
  if (shape.kind === 'prim') {
    if (shape.type === 'integer') return 'number'
    if (shape.type === 'null') return 'null'
    if (shape.type === 'any') return 'any'
    return shape.type
  }
  if (shape.kind === 'array') return `${tsType(shape.items)}[]`
  return shape.ref
}

export function toTypeScript(schema: Schema): string {
  if (schema.types.length === 0) {
    return `export type Root = ${tsType(schema.root)}\n`
  }
  const blocks = schema.types.map((t) => {
    const lines = t.fields.map((f) => `  ${f.name}: ${tsType(f.shape)}`)
    return `export interface ${t.name} {\n${lines.join('\n')}\n}`
  })
  return joinTypes(blocks)
}

// C# --------------------------------------------------------------------------

function csType(shape: FieldShape): string {
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': return 'string'
      case 'integer': return 'long'
      case 'number': return 'double'
      case 'boolean': return 'bool'
      case 'null': return 'object?'
      default: return 'object'
    }
  }
  if (shape.kind === 'array') return `List<${csType(shape.items)}>`
  return shape.ref
}

export function toCSharp(schema: Schema): string {
  if (schema.types.length === 0) return `// using System.Collections.Generic;\n`
  const blocks = schema.types.map((t) => {
    const props = t.fields.map((f) => {
      const propName = pascalCase(f.name)
      const attr = propName !== f.name ? `    [JsonPropertyName("${f.name}")]\n` : ''
      return `${attr}    public ${csType(f.shape)} ${propName} { get; set; }`
    })
    return `public class ${t.name}\n{\n${props.join('\n\n')}\n}`
  })
  const header = `// using System.Collections.Generic;\n// using System.Text.Json.Serialization;\n\n`
  return header + joinTypes(blocks)
}

// Java ------------------------------------------------------------------------

function javaType(shape: FieldShape): string {
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': return 'String'
      case 'integer': return 'long'
      case 'number': return 'double'
      case 'boolean': return 'boolean'
      case 'null': return 'Object'
      default: return 'Object'
    }
  }
  if (shape.kind === 'array') return `List<${javaBoxed(shape.items)}>`
  return shape.ref
}

function javaBoxed(shape: FieldShape): string {
  const t = javaType(shape)
  const box: Record<string, string> = { long: 'Long', double: 'Double', boolean: 'Boolean' }
  return box[t] ?? t
}

export function toJava(schema: Schema): string {
  if (schema.types.length === 0) return `// import java.util.List;\n`
  const blocks = schema.types.map((t) => {
    const fields = t.fields.map((f) => `    private ${javaType(f.shape)} ${camelCase(f.name)};`)
    const accessors = t.fields.flatMap((f) => {
      const getter = pascalCase(f.name)
      const varName = camelCase(f.name)
      const type = javaType(f.shape)
      return [
        `    public ${type} get${getter}() { return ${varName}; }`,
        `    public void set${getter}(${type} ${varName}) { this.${varName} = ${varName}; }`,
      ]
    })
    return `public class ${t.name} {\n${fields.join('\n')}\n\n${accessors.join('\n')}\n}`
  })
  const header = `// import java.util.List;\n\n`
  return header + joinTypes(blocks)
}

// Python ----------------------------------------------------------------------

function pyType(shape: FieldShape): string {
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': return 'str'
      case 'integer': return 'int'
      case 'number': return 'float'
      case 'boolean': return 'bool'
      case 'null': return 'None'
      default: return 'Any'
    }
  }
  if (shape.kind === 'array') return `List[${pyType(shape.items)}]`
  return shape.ref
}

export function toPython(schema: Schema): string {
  if (schema.types.length === 0) return `from dataclasses import dataclass\n`
  const blocks = schema.types.map((t) => {
    const fields = t.fields.map((f) => `    ${snakeCase(f.name)}: ${pyType(f.shape)}`)
    return `@dataclass\nclass ${t.name}:\n${fields.join('\n')}`
  })
  const header = `from dataclasses import dataclass\nfrom typing import Any, List\n\n`
  return header + joinTypes(blocks)
}

// Go --------------------------------------------------------------------------

function goType(shape: FieldShape): string {
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': return 'string'
      case 'integer': return 'int64'
      case 'number': return 'float64'
      case 'boolean': return 'bool'
      case 'null': return 'interface{}'
      default: return 'interface{}'
    }
  }
  if (shape.kind === 'array') return `[]${goType(shape.items)}`
  return shape.ref
}

export function toGo(schema: Schema): string {
  if (schema.types.length === 0) return `package main\n`
  const blocks = schema.types.map((t) => {
    const fields = t.fields.map((f) => {
      const goName = pascalCase(f.name)
      return `    ${goName} ${goType(f.shape)} \`json:"${f.name}"\``
    })
    return `type ${t.name} struct {\n${fields.join('\n')}\n}`
  })
  const header = `package main\n\n`
  return header + joinTypes(blocks)
}

// Rust ------------------------------------------------------------------------

function rustType(shape: FieldShape): string {
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': return 'String'
      case 'integer': return 'i64'
      case 'number': return 'f64'
      case 'boolean': return 'bool'
      case 'null': return 'Option<serde_json::Value>'
      default: return 'serde_json::Value'
    }
  }
  if (shape.kind === 'array') return `Vec<${rustType(shape.items)}>`
  return shape.ref
}

export function toRust(schema: Schema): string {
  if (schema.types.length === 0) return `use serde::{Deserialize, Serialize};\n`
  const blocks = schema.types.map((t) => {
    const fields = t.fields.map((f) => {
      const rustName = snakeCase(f.name)
      const rename = rustName !== f.name ? `    #[serde(rename = "${f.name}")]\n` : ''
      return `${rename}    pub ${rustName}: ${rustType(f.shape)},`
    })
    return `#[derive(Debug, Serialize, Deserialize)]\npub struct ${t.name} {\n${fields.join('\n')}\n}`
  })
  const header = `use serde::{Deserialize, Serialize};\n\n`
  return header + joinTypes(blocks)
}

// Dispatcher ------------------------------------------------------------------

export function generate(schema: Schema, lang: Language): string {
  switch (lang) {
    case 'typescript': return toTypeScript(schema)
    case 'csharp':     return toCSharp(schema)
    case 'java':       return toJava(schema)
    case 'python':     return toPython(schema)
    case 'go':         return toGo(schema)
    case 'rust':       return toRust(schema)
  }
}
