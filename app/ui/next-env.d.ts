/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

// Custom element type for pose-viewer
declare namespace JSX {
  interface IntrinsicElements {
    'pose-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        autoplay?: string | boolean;
        loop?: string | boolean;
        width?: string | number;
        'aspect-ratio'?: string | number;
        background?: string;
      },
      HTMLElement
    >;
  }
}
