# @haroldadmin/robots-parser

A parser for robots.txt files.

## Installation

```bash
npm install @haroldadmin/robots-parser
```

## Usage

Use the `parse` function to convert a robots.txt string into a parse tree.

```ts
import { parse } from "@haroldadmin/robots-parser";

const res = await fetch("https://www.google.com/robots.txt");
const robotsTxt = await res.text();

const parseTree = parse(robotsTxt);

console.log(JSON.stringify(parseTree));
```
