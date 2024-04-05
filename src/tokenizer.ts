export type TokenType =
  | "NULL"
  | "USER_AGENT"
  | "ALLOW"
  | "DISALLOW"
  | "CRAWL_DELAY"
  | "SITEMAP"
  | "VALUE"
  | ":";

export type Token = {
  type: TokenType;
  value: string;
  position: number;
};

type TokenSpec = {
  type: TokenType;
  pattern: RegExp;
};

const SPEC: TokenSpec[] = [
  { pattern: /^\s+/, type: "NULL" },
  { pattern: /^user-agent/i, type: "USER_AGENT" },
  { pattern: /^disallow/i, type: "DISALLOW" },
  { pattern: /^allow/i, type: "ALLOW" },
  { pattern: /^crawl-delay/i, type: "CRAWL_DELAY" },
  { pattern: /^sitemap/i, type: "SITEMAP" },
  {
    pattern:
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    type: "VALUE",
  },
  { pattern: /^([^:\s]|\/)+/, type: "VALUE" },
  { pattern: /^\*/, type: "VALUE" },
  { pattern: /^:/, type: ":" },
];

export function tokenize(txt: string): Token[] {
  const tokens: Token[] = [];

  let cursor = 0;
  while (cursor < txt.length) {
    const nextValue = next(txt, cursor);
    if (!nextValue) {
      break;
    }

    cursor = nextValue.cursor;
    tokens.push(nextValue.token);
  }

  return tokens;
}

export function* generateTokens(
  txt: string
): Generator<Token, undefined, void> {
  let cursor = 0;
  while (cursor < txt.length) {
    const nextValue = next(txt, cursor);
    if (!nextValue) {
      break;
    }

    cursor = nextValue.cursor;
    yield nextValue.token;
  }
}

type NextValue = {
  token: Token;
  cursor: number;
};

function next(txt: string, cursor: number): NextValue | null {
  for (const spec of SPEC) {
    const token = match(txt, cursor, spec);
    if (!token) {
      continue;
    }

    if (token.type === "NULL") {
      return next(txt, cursor + token.value.length);
    }

    return {
      token,
      cursor: cursor + token.value.length,
    };
  }

  return null;
}

function match(txt: string, cursor: number, spec: TokenSpec): Token | null {
  const { type, pattern } = spec;

  const window = txt.slice(cursor);
  const match = pattern.exec(window);
  if (!match) {
    return null;
  }

  if (match[0] === null) {
    return null;
  }

  const [value] = match;
  return {
    type,
    value,
    position: cursor,
  };
}
