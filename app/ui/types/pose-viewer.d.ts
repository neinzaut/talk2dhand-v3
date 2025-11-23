// Type definitions for pose-viewer custom element
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

export {};
