import { describe, it, expect } from "vitest";
import { generateTokens, tokenize } from "./tokenizer";

describe('tokenize', () => {
  it('should tokenize an empty file', () => {
    const tokens = tokenize('')
    expect(tokens).toHaveLength(0)
  })

  it('should tokenize a file with just whitespace', () => {
    const tokens = tokenize(`   `)
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
      value: token,
      position: 0
    }])
  })

  it('should tokenize a single user agent string', () => {
    const tokens = tokenize(`User-agent: *`)
    expect(tokens).toEqual(expect.arrayContaining([
      {
        type: 'USER_AGENT',
        value: 'User-agent',
        position: 0,
      },
      {
        type: ':',
        value: ':',
        position: 10,
      },
      {
        type: 'VALUE',
        value: '*',
        position: 12,
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
        value: 'User-agent',
        position: 9,
      },
      {
        type: 'VALUE',
        value: 'Google',
        position: 21,
      },
      {
        type: 'USER_AGENT',
        value: 'user-agent',
        position: 36,
      },
      {
        type: 'VALUE',
        value: 'Bing',
        position: 48,
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
        value: 'Allow',
        position: 7,
      },
      {
        type: 'VALUE',
        value: '/blog',
        position: 14,
      },
      {
        type: 'ALLOW',
        value: 'Allow',
        position: 26,
      },
      {
        type: 'VALUE',
        value: '/content',
        position: 33,
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
        value: 'Disallow',
        position: 7,
      },
      {
        type: 'VALUE',
        value: '/dashboard',
        position: 17,
      },
      {
        type: 'DISALLOW',
        value: 'disallow',
        position: 34,
      },
      {
        type: 'VALUE',
        value: '/admin',
        position: 44,
      }
    ]))
  })

  it('should tokenize crawl-delay statements', () => {
    expect(tokenize('crawl-delay: 10')).toEqual(expect.arrayContaining([
      {
        type: 'CRAWL_DELAY',
        value: 'crawl-delay',
        position: 0
      },
      {
        type: 'VALUE',
        value: '10',
        position: 13
      }
    ]))
  })

  it('should tokenize crawl-delay statements', () => {
    expect(tokenize('crawl-delay: 10')).toEqual(expect.arrayContaining([
      {
        type: 'CRAWL_DELAY',
        value: 'crawl-delay',
        position: 0,
      },
      {
        type: 'VALUE',
        value: '10',
        position: 13,
      }
    ]))
  })

  it('should tokenize sitemap statements', () => {
    expect(tokenize(`sitemap: https://www.example.com/sitemap.xml`)).toEqual(expect.arrayContaining([
      {
        type: 'SITEMAP',
        value: 'sitemap',
        position: 0,
      },
      {
        type: 'VALUE',
        value: 'https://www.example.com/sitemap.xml',
        position: 9
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
