import { Token, TokenType, generateTokens } from "./tokenizer.js";

type RobotsTxt = {
  type: "RobotsTxt";
  body: Config[];
};

type Config = {
  type: "Config";
  userAgents: string[];
  rules: Rule[];
};

type Rule = {
  type: "DisallowRule" | "AllowRule" | "CrawlDelayRule" | "SitemapRule";
  value: string;
};

type LookAhead = {
  current: () => Token;
  hasMore: () => boolean;
  findNext: () => Token | null;
};

/**
 * Grammar:
 *
 * RobotsTxt
 *  : ConfigList
 *  ;
 *
 * ConfigList:
 *  : Config
 *  | ConfigList Config
 *  ;
 *
 * Config:
 *  : UserAgentList
 *  | RuleList
 *  ;
 *
 * UserAgentList
 *  : UserAgent
 *  | UserAgentList UserAgent
 *  ;
 *
 * RuleList
 *  : Rule
 *  | RuleList Rule
 *  ;
 */
export function parse(txt: string): RobotsTxt {
  const lookahead = createLookahead(txt);

  return createRobotsTxt(lookahead);
}

function createRobotsTxt(lookahead: LookAhead): RobotsTxt {
  return {
    type: "RobotsTxt",
    body: createConfigList(lookahead),
  };
}

function createConfigList(lookahead: LookAhead): Config[] {
  const configs: Config[] = [];

  while (lookahead.hasMore() && lookahead.current()?.type === "USER_AGENT") {
    configs.push(createConfig(lookahead));
  }

  return configs;
}

function createConfig(lookahead: LookAhead): Config {
  const userAgents: string[] = [];
  while (lookahead.hasMore() && lookahead.current().type === "USER_AGENT") {
    eat("USER_AGENT", lookahead);
    eat(":", lookahead);
    const { value } = eat("VALUE", lookahead);
    userAgents.push(value);
  }

  const rules: Rule[] = [];
  const ruleTypes: TokenType[] = [
    "ALLOW",
    "DISALLOW",
    "CRAWL_DELAY",
    "SITEMAP",
  ];
  while (lookahead.hasMore() && ruleTypes.includes(lookahead.current().type)) {
    const rule = createRule(lookahead);
    rules.push(rule);
  }

  return {
    type: "Config",
    userAgents,
    rules,
  };
}

function createRule(lookahead: LookAhead): Rule {
  const { type, position } = lookahead.current();
  switch (type) {
    case "ALLOW": {
      eat("ALLOW", lookahead);
      eat(":", lookahead);
      const { value } = eat("VALUE", lookahead);
      return {
        type: "AllowRule",
        value: value,
      };
    }
    case "DISALLOW": {
      eat("DISALLOW", lookahead);
      eat(":", lookahead);
      const { value } = eat("VALUE", lookahead);
      return {
        type: "DisallowRule",
        value,
      };
    }
    case "CRAWL_DELAY": {
      eat("CRAWL_DELAY", lookahead);
      eat(":", lookahead);
      const { value } = eat("VALUE", lookahead);
      return {
        type: "CrawlDelayRule",
        value,
      };
    }
    case "SITEMAP": {
      eat("SITEMAP", lookahead);
      eat(":", lookahead);
      const { value } = eat("VALUE", lookahead);
      return {
        type: "SitemapRule",
        value,
      };
    }
    default:
      throw new Error(`Syntax error: Expected a rule at pos ${position}`);
  }
}

function eat(tokenType: TokenType, lookahead: LookAhead) {
  const token = lookahead.current();
  if (token.type !== tokenType) {
    throw new Error(
      `Expected ${tokenType}, found ${token.type} at pos ${token.position}`
    );
  }

  lookahead.findNext();
  return token;
}

function createLookahead(txt: string): LookAhead {
  const iterator = generateTokens(txt);
  let token: Token | null;

  const findNext = () => {
    const { value, done } = iterator.next();
    if (done || !value) {
      token = null;
      return null;
    }

    token = value;
    return value;
  };

  const current = (): Token => {
    if (!token) {
      throw new Error("Unexpected EOF");
    }

    return token;
  };

  const hasMore = (): boolean => token !== null;

  findNext();

  return { current, hasMore, findNext };
}
