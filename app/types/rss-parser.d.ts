declare module 'rss-parser' {
  export default class Parser {
    parseURL(url: string): Promise<any>;
  }
} 