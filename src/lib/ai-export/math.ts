function isLikelyMathExpression(expression: string) {
  const trimmed = expression.trim();

  if (!trimmed) {
    return false;
  }

  if (/[\u4e00-\u9fff]/u.test(trimmed)) {
    return false;
  }

  if (/[\\^_=<>+\-*/≈Δ×]/u.test(trimmed)) {
    return true;
  }

  if (/^[A-Za-z]$/.test(trimmed)) {
    return true;
  }

  if (/^[A-Za-z](?:_[A-Za-z0-9]+)?$/.test(trimmed)) {
    return true;
  }

  if (/^\\[A-Za-z]+(?:\s+[A-Za-z](?:_[A-Za-z0-9]+)?)?$/.test(trimmed)) {
    return true;
  }

  return false;
}

function normalizeLegacyMathLine(line: string) {
  const listLeadMatch = line.match(
    /^(\s*(?:[*+-]|\d+\.)\s+)\((.+?)\)(\s*[：:]\s*.*)?$/,
  );

  if (listLeadMatch) {
    const [, prefix, expression, suffix = ""] = listLeadMatch;

    if (isLikelyMathExpression(expression)) {
      return `${prefix}$${expression.trim()}$${suffix}`;
    }
  }

  const standaloneMatch = line.match(/^(\s*)\((.+?)\)\s*$/);

  if (standaloneMatch) {
    const [, leading, expression] = standaloneMatch;

    if (isLikelyMathExpression(expression)) {
      return `${leading}$${expression.trim()}$`;
    }
  }

  return line;
}

export function normalizeMathMarkdown(input: string) {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  let mathBuffer: string[] | null = null;

  for (const rawLine of lines) {
    const line = rawLine;
    const trimmed = line.trim();

    if (mathBuffer === null && (trimmed === "[" || trimmed === "\\[")) {
      mathBuffer = [];
      continue;
    }

    if (mathBuffer !== null) {
      if (trimmed === "]" || trimmed === "\\]") {
        output.push("$$", ...mathBuffer, "$$");
        mathBuffer = null;
      } else {
        mathBuffer.push(line);
      }
      continue;
    }

    output.push(normalizeLegacyMathLine(line));
  }

  if (mathBuffer !== null) {
    output.push("[", ...mathBuffer);
  }

  return output
    .join("\n")
    .replace(/\\\((.+?)\\\)/g, (_, expression: string) => `$${expression.trim()}$`);
}
