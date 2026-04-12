type Mode = 'rad' | 'deg'

interface Operator {
  prec: number
  assoc: 'L' | 'R'
  fn: (a: number, b: number) => number
}

const OPERATORS: Record<string, Operator> = {
  '+': { prec: 1, assoc: 'L', fn: (a, b) => a + b },
  '-': { prec: 1, assoc: 'L', fn: (a, b) => a - b },
  '*': { prec: 2, assoc: 'L', fn: (a, b) => a * b },
  '/': { prec: 2, assoc: 'L', fn: (a, b) => a / b },
  '%': { prec: 2, assoc: 'L', fn: (a, b) => a % b },
  '^': { prec: 4, assoc: 'R', fn: (a, b) => Math.pow(a, b) },
}

const FUNCTIONS = new Set(['sin','cos','tan','asin','acos','atan','log','ln','sqrt','abs','exp','floor','ceil','round'])
const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E }

function toRad(x: number, mode: Mode): number {
  return mode === 'deg' ? (x * Math.PI) / 180 : x
}

function fromRad(x: number, mode: Mode): number {
  return mode === 'deg' ? (x * 180) / Math.PI : x
}

function tokenize(expr: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < expr.length) {
    const c = expr[i]
    if (c === ' ') { i++; continue }
    if (/\d/.test(c) || c === '.') {
      let num = ''
      while (i < expr.length && (/[\d.]/.test(expr[i]))) { num += expr[i]; i++ }
      tokens.push(num)
      continue
    }
    if (/[a-zA-Z]/.test(c)) {
      let ident = ''
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) { ident += expr[i]; i++ }
      tokens.push(ident)
      continue
    }
    if ('+-*/%^()'.includes(c)) {
      tokens.push(c)
      i++
      continue
    }
    if (c === '!') { tokens.push('!'); i++; continue }
    throw new Error(`Unexpected character: ${c}`)
  }
  return tokens
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function applyFunction(name: string, arg: number, mode: Mode): number {
  switch (name) {
    case 'sin': return Math.sin(toRad(arg, mode))
    case 'cos': return Math.cos(toRad(arg, mode))
    case 'tan': return Math.tan(toRad(arg, mode))
    case 'asin': return fromRad(Math.asin(arg), mode)
    case 'acos': return fromRad(Math.acos(arg), mode)
    case 'atan': return fromRad(Math.atan(arg), mode)
    case 'log': return Math.log10(arg)
    case 'ln': return Math.log(arg)
    case 'sqrt': return Math.sqrt(arg)
    case 'abs': return Math.abs(arg)
    case 'exp': return Math.exp(arg)
    case 'floor': return Math.floor(arg)
    case 'ceil': return Math.ceil(arg)
    case 'round': return Math.round(arg)
    default: throw new Error(`Unknown function: ${name}`)
  }
}

export function evaluate(expr: string, mode: Mode = 'rad'): number {
  const tokens = tokenize(expr.trim())
  if (tokens.length === 0) throw new Error('Empty expression')

  // Shunting-yard to RPN
  const output: (string | number)[] = []
  const stack: string[] = []

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    if (!isNaN(parseFloat(tok))) {
      output.push(parseFloat(tok))
    } else if (tok in CONSTANTS) {
      output.push(CONSTANTS[tok])
    } else if (FUNCTIONS.has(tok)) {
      stack.push(tok)
    } else if (tok === '!') {
      // Postfix factorial — apply immediately to top of output
      const last = output.pop()
      if (typeof last !== 'number') throw new Error('Invalid factorial operand')
      output.push(factorial(last))
    } else if (tok in OPERATORS) {
      // Handle unary minus
      const prev = tokens[i - 1]
      const isUnary = tok === '-' && (i === 0 || prev === '(' || prev in OPERATORS)
      if (isUnary) {
        output.push(0)
      }
      while (stack.length > 0) {
        const top = stack[stack.length - 1]
        if (top === '(') break
        if (FUNCTIONS.has(top)) {
          stack.pop()
          output.push(`__fn_${top}`)
          continue
        }
        if (!(top in OPERATORS)) break
        const curr = OPERATORS[tok]
        const other = OPERATORS[top]
        if ((curr.assoc === 'L' && curr.prec <= other.prec) || (curr.assoc === 'R' && curr.prec < other.prec)) {
          stack.pop()
          output.push(top)
        } else break
      }
      stack.push(tok)
    } else if (tok === '(') {
      stack.push(tok)
    } else if (tok === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!)
      }
      if (stack.length === 0) throw new Error('Mismatched parentheses')
      stack.pop()
      if (stack.length > 0 && FUNCTIONS.has(stack[stack.length - 1])) {
        const fn = stack.pop()!
        output.push(`__fn_${fn}`)
      }
    } else {
      throw new Error(`Unknown token: ${tok}`)
    }
  }

  while (stack.length > 0) {
    const top = stack.pop()!
    if (top === '(' || top === ')') throw new Error('Mismatched parentheses')
    output.push(top)
  }

  // Evaluate RPN
  const evalStack: number[] = []
  for (const tok of output) {
    if (typeof tok === 'number') {
      evalStack.push(tok)
    } else if (tok.startsWith('__fn_')) {
      const fn = tok.slice(5)
      const a = evalStack.pop()
      if (a === undefined) throw new Error('Invalid function call')
      evalStack.push(applyFunction(fn, a, mode))
    } else if (tok in OPERATORS) {
      const b = evalStack.pop()
      const a = evalStack.pop()
      if (a === undefined || b === undefined) throw new Error('Invalid expression')
      evalStack.push(OPERATORS[tok].fn(a, b))
    } else {
      throw new Error(`Unknown RPN token: ${tok}`)
    }
  }

  if (evalStack.length !== 1) throw new Error('Invalid expression')
  const result = evalStack[0]
  if (!isFinite(result)) throw new Error('Math error')
  return result
}
