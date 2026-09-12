declare module 'xss-clean' {
  import type { RequestHandler } from 'express';
  const xss: () => RequestHandler;
  export default xss;
}
