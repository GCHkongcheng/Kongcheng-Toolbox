import {
  Math as DocxMath,
  MathFraction,
  MathRadical,
  MathRoundBrackets,
  MathRun,
  MathSquareBrackets,
  MathSubScript,
  MathSubSuperScript,
  MathSuperScript,
  type MathComponent,
} from "docx";

const COMMAND_SYMBOLS: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  Delta: "Δ",
  epsilon: "ε",
  theta: "θ",
  lambda: "λ",
  mu: "μ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  phi: "φ",
  omega: "ω",
  Gamma: "Γ",
  Lambda: "Λ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Omega: "Ω",
  cdot: "·",
  times: "×",
  approx: "≈",
  pm: "±",
  mp: "∓",
  neq: "≠",
  leq: "≤",
  geq: "≥",
  le: "≤",
  ge: "≥",
  to: "→",
  leftarrow: "←",
  rightarrow: "→",
  infty: "∞",
  partial: "∂",
  degree: "°",
  sin: "sin",
  cos: "cos",
  tan: "tan",
  cot: "cot",
  sec: "sec",
  csc: "csc",
  log: "log",
  ln: "ln",
  exp: "exp",
  sum: "∑",
  int: "∫",
  lim: "lim",
};

const ESCAPED_SYMBOLS: Record<string, string> = {
  "{": "{",
  "}": "}",
  "[": "[",
  "]": "]",
  "(": "(",
  ")": ")",
  "|": "|",
  "_": "_",
  "^": "^",
  "%": "%",
  "#": "#",
  "&": "&",
  "$": "$",
  ",": ",",
  " ": " ",
  "\\": "\\",
};

class LatexToDocxMathParser {
  private index = 0;

  constructor(private readonly source: string) {}

  public parse(): MathComponent[] {
    const children = this.parseExpression();
    return children.length > 0 ? children : [new MathRun(" ")];
  }

  private parseExpression(stopChar?: string): MathComponent[] {
    const output: MathComponent[] = [];

    while (!this.isAtEnd()) {
      this.skipWhitespace();

      if (this.isAtEnd()) {
        break;
      }

      if (stopChar && this.peek() === stopChar) {
        break;
      }

      output.push(...this.parseComponent());
    }

    return output;
  }

  private parseComponent(): MathComponent[] {
    const base = this.parseAtom();

    if (base.length === 0) {
      return [];
    }

    let subScript: MathComponent[] | undefined;
    let superScript: MathComponent[] | undefined;

    while (!this.isAtEnd()) {
      this.skipWhitespace();

      const marker = this.peek();

      if (marker !== "_" && marker !== "^") {
        break;
      }

      this.index += 1;

      if (marker === "_") {
        subScript = this.parseScriptArgument();
      } else {
        superScript = this.parseScriptArgument();
      }
    }

    if (!subScript && !superScript) {
      return base;
    }

    if (subScript && superScript) {
      return [
        new MathSubSuperScript({
          children: base,
          subScript,
          superScript,
        }),
      ];
    }

    if (subScript) {
      return [
        new MathSubScript({
          children: base,
          subScript,
        }),
      ];
    }

    return [
      new MathSuperScript({
        children: base,
        superScript: superScript ?? [new MathRun(" ")],
      }),
    ];
  }

  private parseScriptArgument(): MathComponent[] {
    this.skipWhitespace();

    if (this.peek() === "{") {
      return this.parseGroup();
    }

    return this.parseComponent();
  }

  private parseAtom(): MathComponent[] {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      return [];
    }

    const char = this.peek();

    if (char === "{") {
      return this.parseGroup();
    }

    if (char === "(") {
      return [new MathRoundBrackets({ children: this.parseDelimited("(", ")") })];
    }

    if (char === "[") {
      return [new MathSquareBrackets({ children: this.parseDelimited("[", "]") })];
    }

    if (char === "|") {
      this.index += 1;
      return [new MathRun("|")];
    }

    if (char === "\\") {
      return this.parseCommand();
    }

    this.index += 1;
    return [new MathRun(char)];
  }

  private parseCommand(): MathComponent[] {
    this.index += 1;

    const name = this.readCommandName();

    if (!name) {
      return [new MathRun("\\")];
    }

    if (name === "frac") {
      return [
        new MathFraction({
          numerator: this.parseRequiredGroup("Expected numerator for \\frac"),
          denominator: this.parseRequiredGroup("Expected denominator for \\frac"),
        }),
      ];
    }

    if (name === "sqrt") {
      let degree: MathComponent[] | undefined;
      this.skipWhitespace();

      if (this.peek() === "[") {
        degree = this.parseDelimited("[", "]");
      }

      const children =
        this.peek() === "{"
          ? this.parseGroup()
          : this.parseComponent();

      return [
        new MathRadical({
          children,
          degree,
        }),
      ];
    }

    if (name === "text" || name === "mathrm" || name === "operatorname") {
      return [new MathRun(this.parseTextArgument())];
    }

    if (name === "left" || name === "right") {
      return this.parseLeftRightDelimiter();
    }

    const escaped = ESCAPED_SYMBOLS[name];
    if (escaped) {
      return [new MathRun(escaped)];
    }

    const symbol = COMMAND_SYMBOLS[name];
    if (symbol) {
      return [new MathRun(symbol)];
    }

    return [new MathRun(name)];
  }

  private parseLeftRightDelimiter(): MathComponent[] {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      return [];
    }

    const delimiter = this.peek();
    this.index += 1;

    if (delimiter === ".") {
      return [];
    }

    return [new MathRun(delimiter)];
  }

  private parseTextArgument(): string {
    this.skipWhitespace();

    if (this.peek() !== "{") {
      return "";
    }

    this.index += 1;
    let depth = 1;
    let result = "";

    while (!this.isAtEnd() && depth > 0) {
      const char = this.peek();
      this.index += 1;

      if (char === "{") {
        depth += 1;
        if (depth > 1) {
          result += char;
        }
        continue;
      }

      if (char === "}") {
        depth -= 1;
        if (depth > 0) {
          result += char;
        }
        continue;
      }

      result += char;
    }

    return result;
  }

  private parseRequiredGroup(message: string): MathComponent[] {
    this.skipWhitespace();

    if (this.peek() !== "{") {
      throw new Error(message);
    }

    return this.parseGroup();
  }

  private parseGroup(): MathComponent[] {
    this.index += 1;
    const children = this.parseExpression("}");

    if (this.peek() === "}") {
      this.index += 1;
    }

    return children;
  }

  private parseDelimited(open: string, close: string): MathComponent[] {
    if (this.peek() === open) {
      this.index += 1;
    }

    const children = this.parseExpression(close);

    if (this.peek() === close) {
      this.index += 1;
    }

    return children;
  }

  private readCommandName(): string {
    const start = this.index;

    while (!this.isAtEnd()) {
      const char = this.peek();

      if (!/[A-Za-z]/.test(char)) {
        break;
      }

      this.index += 1;
    }

    if (this.index > start) {
      return this.source.slice(start, this.index);
    }

    const single = this.peek();
    if (!single) {
      return "";
    }

    this.index += 1;
    return single;
  }

  private skipWhitespace() {
    while (!this.isAtEnd() && /\s/.test(this.peek())) {
      this.index += 1;
    }
  }

  private peek() {
    return this.source[this.index] ?? "";
  }

  private isAtEnd() {
    return this.index >= this.source.length;
  }
}

export function createDocxMathFromLatex(formula: string) {
  try {
    return new DocxMath({
      children: new LatexToDocxMathParser(formula.trim()).parse(),
    });
  } catch {
    return new DocxMath({
      children: [new MathRun(formula.trim() || " ")],
    });
  }
}
