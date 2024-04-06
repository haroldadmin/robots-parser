# robotstxt-parser

A parser for robots.txt files.

## Installation

```bash
npm install robotstxt-parser
```

## Usage

Use the `parse` function to convert a robots.txt string into a parse tree.

```ts
import { parse } from "robotstxt-parser";

const res = await fetch("https://www.google.com/robots.txt");
const robotsTxt = await res.text();

const parseTree = parse(robotsTxt);

console.log(JSON.stringify(parseTree));
```
