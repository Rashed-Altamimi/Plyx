// Infer a schema from a parsed JSON value and emit class / struct / interface
// definitions in multiple languages. Runs entirely in the browser — no server
// round-trip, no heavyweight codegen dependency.

export type Prim = 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'any'

export type FieldShape =
  | { kind: 'prim'; type: Prim; nullable?: boolean }
  | { kind: 'array'; items: FieldShape; nullable?: boolean }
  | { kind: 'object'; ref: string; nullable?: boolean }

export interface NamedField {
  name: string
  shape: FieldShape
  optional?: boolean
}

export interface NamedType {
  name: string
  fields: NamedField[]
}

export interface Schema {
  root: FieldShape
  rootName: string
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
//
// Two passes. First infer an anonymous shape tree, merging every object seen at
// the same position (array elements, same field across siblings) into a single
// shape — fields missing on one side become optional, nulls make the other side
// nullable. Then a naming pass assigns type names, reusing one name for
// structurally identical objects so the output never contains duplicate classes.
// -----------------------------------------------------------------------------

function pascalCase(s: string): string {
  const out = s
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
  if (!out) return 'Root'
  return /^\d/.test(out) ? `_${out}` : out
}

function singularize(name: string): string {
  if (/ies$/i.test(name)) return name.replace(/ies$/i, 'y')
  if (/ses$/i.test(name)) return name.replace(/es$/i, '')
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.replace(/s$/i, '')
  return name + 'Item'
}

function inferPrim(v: unknown): Prim {
  if (typeof v === 'string') return 'string'
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number'
  if (typeof v === 'boolean') return 'boolean'
  return 'any'
}

// 'unknown' marks positions with no information yet (items of an empty array);
// unlike 'any' it merges as identity instead of poisoning the other side.
type RawPrim = Prim | 'unknown'

interface RawField { shape: RawShape; optional: boolean }

type RawShape =
  | { kind: 'prim'; type: RawPrim; nullable?: boolean }
  | { kind: 'array'; items: RawShape; nullable?: boolean }
  | { kind: 'obj'; fields: Map<string, RawField>; nullable?: boolean }

function inferRaw(value: unknown): RawShape {
  if (value === null) return { kind: 'prim', type: 'null' }
  if (Array.isArray(value)) {
    let items: RawShape | null = null
    for (const el of value) {
      const s = inferRaw(el)
      items = items ? mergeRaw(items, s) : s
    }
    return { kind: 'array', items: items ?? { kind: 'prim', type: 'unknown' } }
  }
  if (typeof value === 'object') {
    const fields = new Map<string, RawField>()
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      fields.set(key, { shape: inferRaw(v), optional: false })
    }
    return { kind: 'obj', fields }
  }
  return { kind: 'prim', type: inferPrim(value) }
}

function isNull(s: RawShape): boolean {
  return s.kind === 'prim' && s.type === 'null'
}

function markNullable(s: RawShape): RawShape {
  if (s.kind === 'prim' && (s.type === 'null' || s.type === 'any')) return s
  return { ...s, nullable: true }
}

function withNull(s: RawShape, nullable: boolean | undefined): RawShape {
  return nullable ? markNullable(s) : s
}

// Merge two shapes seen at the same position. Incompatible kinds widen to
// `any`; integers widen to numbers; null makes the other side nullable.
function mergeRaw(a: RawShape, b: RawShape): RawShape {
  if (isNull(a)) return markNullable(b)
  if (isNull(b)) return markNullable(a)
  if (a.kind === 'prim' && a.type === 'unknown') return withNull(b, a.nullable)
  if (b.kind === 'prim' && b.type === 'unknown') return withNull(a, b.nullable)
  const nullable = a.nullable || b.nullable
  if (a.kind === 'prim' && b.kind === 'prim') {
    if (a.type === b.type) return withNull(a, nullable)
    if ((a.type === 'integer' && b.type === 'number') || (a.type === 'number' && b.type === 'integer')) {
      return withNull({ kind: 'prim', type: 'number' }, nullable)
    }
    return { kind: 'prim', type: 'any' }
  }
  if (a.kind === 'array' && b.kind === 'array') {
    return withNull({ kind: 'array', items: mergeRaw(a.items, b.items) }, nullable)
  }
  if (a.kind === 'obj' && b.kind === 'obj') {
    const fields = new Map<string, RawField>()
    for (const [key, fa] of a.fields) {
      const fb = b.fields.get(key)
      if (fb) {
        fields.set(key, { shape: mergeRaw(fa.shape, fb.shape), optional: fa.optional || fb.optional })
      } else {
        fields.set(key, { ...fa, optional: true })
      }
    }
    for (const [key, fb] of b.fields) {
      if (!a.fields.has(key)) fields.set(key, { ...fb, optional: true })
    }
    return withNull({ kind: 'obj', fields }, nullable)
  }
  return { kind: 'prim', type: 'any' }
}

function nameFor(base: string, used: Set<string>): string {
  if (!used.has(base)) return base
  let i = 2
  while (used.has(`${base}${i}`)) i++
  return `${base}${i}`
}

interface NameCtx {
  used: Set<string>
  bySig: Map<string, string>
  types: NamedType[]
}

function shapeSig(s: FieldShape): string {
  const n = s.nullable ? '?' : ''
  if (s.kind === 'prim') return `p:${s.type}${n}`
  if (s.kind === 'array') return `a:${shapeSig(s.items)}${n}`
  return `o:${s.ref}${n}`
}

function resolveShape(s: RawShape, suggested: string, ctx: NameCtx): FieldShape {
  if (s.kind === 'prim') {
    const type: Prim = s.type === 'unknown' ? 'any' : s.type
    return s.nullable && type !== 'any' && type !== 'null'
      ? { kind: 'prim', type, nullable: true }
      : { kind: 'prim', type }
  }
  if (s.kind === 'array') {
    const items = resolveShape(s.items, singularize(suggested), ctx)
    return s.nullable ? { kind: 'array', items, nullable: true } : { kind: 'array', items }
  }
  // Name the object before its children so types come out in top-down order,
  // then drop it again if an identical structure was already named.
  const name = nameFor(pascalCase(suggested), ctx.used)
  ctx.used.add(name)
  const named: NamedType = { name, fields: [] }
  ctx.types.push(named)
  for (const [key, f] of s.fields) {
    const shape = resolveShape(f.shape, key, ctx)
    named.fields.push(f.optional ? { name: key, shape, optional: true } : { name: key, shape })
  }
  const sig = JSON.stringify(named.fields.map((f) => [f.name, shapeSig(f.shape), !!f.optional]).sort())
  const existing = ctx.bySig.get(sig)
  if (existing !== undefined) {
    ctx.used.delete(name)
    ctx.types.splice(ctx.types.indexOf(named), 1)
    return s.nullable ? { kind: 'object', ref: existing, nullable: true } : { kind: 'object', ref: existing }
  }
  ctx.bySig.set(sig, name)
  return s.nullable ? { kind: 'object', ref: name, nullable: true } : { kind: 'object', ref: name }
}

export function inferSchema(value: unknown, rootName = 'Root'): Schema {
  const raw = inferRaw(value)
  const ctx: NameCtx = { used: new Set(), bySig: new Map(), types: [] }
  const rootPc = pascalCase(rootName)
  // When the root is not an object the generators emit a `rootName` alias for
  // it — reserve the name so no nested type takes it.
  if (raw.kind !== 'obj') ctx.used.add(rootPc)
  const root = resolveShape(raw, rootName, ctx)
  return { root, rootName: rootPc, types: ctx.types }
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
  const out = s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
    .replace(/^_|_$/g, '')
  if (!out) return 'field'
  return /^\d/.test(out) ? `_${out}` : out
}

// TypeScript ------------------------------------------------------------------

const TS_IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/

function tsFieldName(name: string): string {
  return TS_IDENT.test(name) ? name : JSON.stringify(name)
}

function tsType(shape: FieldShape): string {
  let base: string
  if (shape.kind === 'prim') {
    base = shape.type === 'integer' ? 'number' : shape.type
  } else if (shape.kind === 'array') {
    const items = tsType(shape.items)
    base = /[ |]/.test(items) ? `(${items})[]` : `${items}[]`
  } else {
    base = shape.ref
  }
  if (shape.nullable && base !== 'any' && base !== 'null') base += ' | null'
  return base
}

export function toTypeScript(schema: Schema): string {
  const blocks: string[] = []
  if (schema.root.kind !== 'object') {
    blocks.push(`export type ${schema.rootName} = ${tsType(schema.root)}`)
  }
  for (const t of schema.types) {
    const lines = t.fields.map((f) => `  ${tsFieldName(f.name)}${f.optional ? '?' : ''}: ${tsType(f.shape)}`)
    blocks.push(lines.length ? `export interface ${t.name} {\n${lines.join('\n')}\n}` : `export interface ${t.name} {}`)
  }
  return joinTypes(blocks)
}

// C# --------------------------------------------------------------------------

function csType(shape: FieldShape): string {
  let base: string
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': base = 'string'; break
      case 'integer': base = 'long'; break
      case 'number': base = 'double'; break
      case 'boolean': base = 'bool'; break
      case 'null': base = 'object?'; break
      default: base = 'object'
    }
  } else if (shape.kind === 'array') {
    base = `List<${csType(shape.items)}>`
  } else {
    base = shape.ref
  }
  if (shape.nullable && !base.endsWith('?')) base += '?'
  return base
}

export function toCSharp(schema: Schema): string {
  const blocks = schema.types.map((t) => {
    const props = t.fields.map((f) => {
      const propName = pascalCase(f.name)
      const attr = propName !== f.name ? `    [JsonPropertyName("${f.name}")]\n` : ''
      let type = csType(f.shape)
      if (f.optional && !type.endsWith('?')) type += '?'
      return `${attr}    public ${type} ${propName} { get; set; }`
    })
    return props.length
      ? `public class ${t.name}\n{\n${props.join('\n\n')}\n}`
      : `public class ${t.name}\n{\n}`
  })
  if (schema.root.kind !== 'object') {
    blocks.unshift(`// ${schema.rootName}: ${csType(schema.root)}`)
  }
  const header = `// using System.Collections.Generic;\n// using System.Text.Json.Serialization;\n\n`
  return header + joinTypes(blocks)
}

// Java ------------------------------------------------------------------------

const JAVA_BOX: Record<string, string> = { long: 'Long', double: 'Double', boolean: 'Boolean' }

function javaType(shape: FieldShape): string {
  let base: string
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': base = 'String'; break
      case 'integer': base = 'long'; break
      case 'number': base = 'double'; break
      case 'boolean': base = 'boolean'; break
      default: base = 'Object'
    }
  } else if (shape.kind === 'array') {
    base = `List<${javaBoxed(shape.items)}>`
  } else {
    base = shape.ref
  }
  if (shape.nullable) base = JAVA_BOX[base] ?? base
  return base
}

function javaBoxed(shape: FieldShape): string {
  const t = javaType(shape)
  return JAVA_BOX[t] ?? t
}

export function toJava(schema: Schema): string {
  const blocks = schema.types.map((t) => {
    const fields = t.fields.map((f) => {
      const varName = camelCase(f.name)
      const attr = varName !== f.name ? `    @JsonProperty("${f.name}")\n` : ''
      const type = f.optional ? javaBoxed(f.shape) : javaType(f.shape)
      return `${attr}    private ${type} ${varName};`
    })
    const accessors = t.fields.flatMap((f) => {
      const getter = pascalCase(f.name)
      const varName = camelCase(f.name)
      const type = f.optional ? javaBoxed(f.shape) : javaType(f.shape)
      return [
        `    public ${type} get${getter}() { return ${varName}; }`,
        `    public void set${getter}(${type} ${varName}) { this.${varName} = ${varName}; }`,
      ]
    })
    return fields.length
      ? `public class ${t.name} {\n${fields.join('\n')}\n\n${accessors.join('\n')}\n}`
      : `public class ${t.name} {\n}`
  })
  if (schema.root.kind !== 'object') {
    blocks.unshift(`// ${schema.rootName}: ${javaType(schema.root)}`)
  }
  const needsJsonProperty = schema.types.some((t) => t.fields.some((f) => camelCase(f.name) !== f.name))
  const header = `// import java.util.List;\n${needsJsonProperty ? '// import com.fasterxml.jackson.annotation.JsonProperty;\n' : ''}\n`
  return header + joinTypes(blocks)
}

// Python ----------------------------------------------------------------------

function pyType(shape: FieldShape): string {
  let base: string
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': base = 'str'; break
      case 'integer': base = 'int'; break
      case 'number': base = 'float'; break
      case 'boolean': base = 'bool'; break
      case 'null': base = 'None'; break
      default: base = 'Any'
    }
  } else if (shape.kind === 'array') {
    base = `List[${pyType(shape.items)}]`
  } else {
    base = shape.ref
  }
  if (shape.nullable && base !== 'None' && base !== 'Any') base = `Optional[${base}]`
  return base
}

export function toPython(schema: Schema): string {
  const blocks = schema.types.map((t) => {
    const fields = t.fields.map((f) => {
      let type = pyType(f.shape)
      if (f.optional && !type.startsWith('Optional[') && type !== 'None' && type !== 'Any') {
        type = `Optional[${type}]`
      }
      return `    ${snakeCase(f.name)}: ${type}`
    })
    return `@dataclass\nclass ${t.name}:\n${fields.length ? fields.join('\n') : '    pass'}`
  })
  if (schema.root.kind !== 'object') {
    blocks.push(`${schema.rootName} = ${pyType(schema.root)}`)
  }
  const header = `from __future__ import annotations\n\nfrom dataclasses import dataclass\nfrom typing import Any, List, Optional\n\n`
  return header + joinTypes(blocks)
}

// Go --------------------------------------------------------------------------

function goType(shape: FieldShape): string {
  let base: string
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': base = 'string'; break
      case 'integer': base = 'int64'; break
      case 'number': base = 'float64'; break
      case 'boolean': base = 'bool'; break
      default: base = 'interface{}'
    }
  } else if (shape.kind === 'array') {
    base = `[]${goType(shape.items)}`
  } else {
    base = shape.ref
  }
  if (shape.nullable && base !== 'interface{}' && !base.startsWith('*')) base = `*${base}`
  return base
}

export function toGo(schema: Schema): string {
  const blocks = schema.types.map((t) => {
    const fields = t.fields.map((f) => {
      // A leading underscore would make the field unexported and invisible to
      // encoding/json.
      const goName = pascalCase(f.name).replace(/^_/, 'X')
      let type = goType(f.shape)
      if (f.optional && type !== 'interface{}' && !type.startsWith('*')) type = `*${type}`
      return `    ${goName} ${type} \`json:"${f.name}${f.optional ? ',omitempty' : ''}"\``
    })
    return fields.length
      ? `type ${t.name} struct {\n${fields.join('\n')}\n}`
      : `type ${t.name} struct {}`
  })
  if (schema.root.kind !== 'object') {
    blocks.unshift(`type ${schema.rootName} ${goType(schema.root)}`)
  }
  const header = `package main\n\n`
  return header + joinTypes(blocks)
}

// Rust ------------------------------------------------------------------------

function rustType(shape: FieldShape): string {
  let base: string
  if (shape.kind === 'prim') {
    switch (shape.type) {
      case 'string': base = 'String'; break
      case 'integer': base = 'i64'; break
      case 'number': base = 'f64'; break
      case 'boolean': base = 'bool'; break
      case 'null': base = 'Option<serde_json::Value>'; break
      default: base = 'serde_json::Value'
    }
  } else if (shape.kind === 'array') {
    base = `Vec<${rustType(shape.items)}>`
  } else {
    base = shape.ref
  }
  if (shape.nullable && !base.startsWith('Option<')) base = `Option<${base}>`
  return base
}

export function toRust(schema: Schema): string {
  const blocks = schema.types.map((t) => {
    const fields = t.fields.map((f) => {
      const rustName = snakeCase(f.name)
      const rename = rustName !== f.name ? `    #[serde(rename = "${f.name}")]\n` : ''
      let type = rustType(f.shape)
      if (f.optional && !type.startsWith('Option<')) type = `Option<${type}>`
      return `${rename}    pub ${rustName}: ${type},`
    })
    return fields.length
      ? `#[derive(Debug, Serialize, Deserialize)]\npub struct ${t.name} {\n${fields.join('\n')}\n}`
      : `#[derive(Debug, Serialize, Deserialize)]\npub struct ${t.name} {}`
  })
  if (schema.root.kind !== 'object') {
    blocks.unshift(`pub type ${schema.rootName} = ${rustType(schema.root)};`)
  }
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
