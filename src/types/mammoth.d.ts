declare module 'mammoth' {
  interface ImageElement {
    read(encoding: string): Promise<string>;
    contentType: string;
  }

  interface ConvertOptions {
    convertImage?: any;
    styleMap?: string | string[];
    includeDefaultStyleMap?: boolean;
  }

  interface ConvertResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  export function convertToHtml(input: { arrayBuffer: ArrayBuffer } | { path: string }, options?: ConvertOptions): Promise<ConvertResult>;
  export function extractRawText(input: { arrayBuffer: ArrayBuffer } | { path: string }): Promise<ConvertResult>;
  export const images: {
    imgElement: (converter: (image: ImageElement) => Promise<{ src: string }>) => any;
    dataUri: any;
  };
  const mammoth: {
    convertToHtml: typeof convertToHtml;
    extractRawText: typeof extractRawText;
    images: typeof images;
  };
  export default mammoth;
}
