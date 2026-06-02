declare const process: { env: Record<string, string | undefined> };
declare const console: { log: (...args: unknown[]) => void };

declare class Buffer extends Uint8Array {
  static concat(chunks: readonly Uint8Array[]): Buffer;
  static from(input: string, encoding?: string): Buffer;
  toString(encoding?: string): string;
}

declare module 'node:http' {
  export interface IncomingMessage extends AsyncIterable<Buffer> {
    method?: string;
    url?: string;
  }

  export interface ServerResponse {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(chunk?: string): void;
  }

  export function createServer(handler: (request: IncomingMessage, response: ServerResponse) => void | Promise<void>): {
    listen(port: number, callback?: () => void): void;
  };
}

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: BufferEncoding): string;
}

type BufferEncoding = 'utf8' | 'utf-8' | 'ascii' | 'base64' | 'base64url' | 'binary' | 'hex' | 'latin1' | 'ucs-2' | 'ucs2' | 'utf16le';
