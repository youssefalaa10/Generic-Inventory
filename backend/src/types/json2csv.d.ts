declare module 'json2csv' {
  export class AsyncParser {
    constructor(options?: any);
    parse(data: any): { promise(): Promise<string> };
  }
  
  export class Parser {
    constructor(options?: any);
    parse(data: any): string;
  }
}
