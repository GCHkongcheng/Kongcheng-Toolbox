declare module "html-to-docx" {
  interface HtmlToDocxOptions {
    table?: {
      row?: {
        cantSplit?: boolean;
      };
    };
    pageSize?: {
      width: number;
      height: number;
    };
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
      header?: number;
      footer?: number;
      gutter?: number;
    };
  }

  export default function HTMLToDOCX(
    htmlString: string,
    headerHtml?: string,
    options?: HtmlToDocxOptions,
  ): Promise<Buffer | Uint8Array | ArrayBuffer>;
}
