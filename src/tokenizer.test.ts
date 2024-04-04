import { describe, it, expect } from "vitest";
import { generateTokens, tokenize } from "./tokenizer";

describe('tokenize', () => {
  it('should tokenize an empty file', () => {
    const tokens = tokenize('')
    expect(tokens).toHaveLength(0)
  })

  it('should tokenize a file with just whitespace', () => {
    const tokens = tokenize(`
    `)
    expect(tokens).toHaveLength(0)
  })

  it.each([
    ['User-agent', 'USER_AGENT'],
    ['Allow', 'ALLOW'],
    ['Disallow', 'DISALLOW'],
    ['Crawl-Delay', 'CRAWL_DELAY'],
    ['Sitemap', 'SITEMAP'],
    ['*', 'VALUE'],
    [':', ':']
  ])("should tokenize %s as %s", (token, expectedType) => {
    expect(tokenize(token)).toEqual([{
      type: expectedType,
      value: token
    }])
  })

  it('should tokenize a single user agent string', () => {
    const tokens = tokenize(`User-agent: *`)
    expect(tokens).toEqual(expect.arrayContaining([
      {
        type: 'USER_AGENT',
        value: 'User-agent'
      },
      {
        type: ':',
        value: ':'
      },
      {
        type: 'VALUE',
        value: '*'
      }
    ]))
  })

  it('should tokenize multiple user agents', () => {
    const tokens = tokenize(`
        User-agent: Google
        user-agent: Bing
      `)

    expect(tokens).toEqual(expect.arrayContaining([
      {
        type: 'USER_AGENT',
        value: 'User-agent'
      },
      {
        type: 'VALUE',
        value: 'Google'
      },
      {
        type: 'USER_AGENT',
        value: 'user-agent',
      },
      {
        type: 'VALUE',
        value: 'Bing'
      }
    ]))
  })


  it('should tokenize allow statements', () => {
    expect(tokenize(`
      Allow: /blog
      Allow: /content
      `)).toEqual(expect.arrayContaining([
      {
        type: 'ALLOW',
        value: 'Allow'
      },
      {
        type: 'VALUE',
        value: '/blog'
      },
      {
        type: 'ALLOW',
        value: 'Allow'
      },
      {
        type: 'VALUE',
        value: '/content'
      }
    ]))
  })

  it('should tokenize disallow statements', () => {
    expect(tokenize(`
      Disallow: /dashboard
      disallow: /admin
      `)).toEqual(expect.arrayContaining([
      {
        type: 'DISALLOW',
        value: 'Disallow'
      },
      {
        type: 'VALUE',
        value: '/dashboard'
      },
      {
        type: 'DISALLOW',
        value: 'disallow'
      },
      {
        type: 'VALUE',
        value: '/admin'
      }
    ]))
  })

  it('should tokenize crawl-delay statements', () => {
    expect(tokenize('crawl-delay: 10')).toEqual(expect.arrayContaining([
      {
        type: 'CRAWL_DELAY',
        value: 'crawl-delay'
      },
      {
        type: 'VALUE',
        value: '10'
      }
    ]))
  })

  it('should tokenize crawl-delay statements', () => {
    expect(tokenize('crawl-delay: 10')).toEqual(expect.arrayContaining([
      {
        type: 'CRAWL_DELAY',
        value: 'crawl-delay'
      },
      {
        type: 'VALUE',
        value: '10'
      }
    ]))
  })

  it('should tokenize sitemap statements', () => {
    expect(tokenize(`sitemap: https://www.example.com/sitemap.xml`)).toEqual(expect.arrayContaining([
      {
        type: 'SITEMAP',
        value: 'sitemap'
      },
      {
        type: 'VALUE',
        value: 'https://www.example.com/sitemap.xml'
      }
    ]))
  })
})

describe('generateTokens', () => {
  it('should yield the same data as tokenize', () => {
    const txt = 'User-agent: *'
    const allTokens = tokenize(txt)
    const yieldedTokens = Array.from(generateTokens(txt))

    expect(allTokens).toEqual(yieldedTokens)
  })
})
