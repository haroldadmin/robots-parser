import { Token, TokenType, generateTokens, tokenize } from "./tokenizer.js";

type RobotsTxt = {
  type: "RobotsTxt";
  configs: Config[];
  sitemap: string | undefined;
};

type Config = {
  type: "Config";
  userAgents: string[];
  rules: Rule[];
};

type Rule = {
  type: "DisallowRule" | "AllowRule" | "CrawlDelayRule";
  value: string;
};

type LookAhead = {
  current: () => Token;
  hasMore: () => boolean;
  findNext: () => Token | null;
};

const ruleTypes: readonly TokenType[] = ["ALLOW", "DISALLOW", "CRAWL_DELAY"];

/**
 * Grammar:
 *
 * RobotsTxt
 *  : ConfigList
 *  | Sitemap
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
  const robotsTxt: RobotsTxt = {
    type: "RobotsTxt",
    configs: [],
    sitemap: undefined,
  };

  if (!lookahead.hasMore()) {
    return robotsTxt;
  }

  while (lookahead.hasMore()) {
    switch (lookahead.current().type) {
      case "SITEMAP": {
        const sitemap = createSitemap(lookahead);
        robotsTxt.sitemap = sitemap;
        break;
      }
      case "USER_AGENT": {
        const config = createConfig(lookahead);
        robotsTxt.configs.push(config);
        break;
      }
      default: {
        const token = lookahead.current();
        throw new Error(
          `Unexpected token: ${token.type} at pos ${token.position}`
        );
      }
    }
  }

  return robotsTxt;
}

function createSitemap(lookahead: LookAhead): string {
  eat("SITEMAP", lookahead);
  eat(":", lookahead);
  const { value } = eat("VALUE", lookahead);
  return value;
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
  const tokens = tokenize(txt);
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
