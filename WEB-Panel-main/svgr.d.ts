// Adjusted code in the documentation as type safe because of TypeScript.
declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {title?: string}
  >;
  export default ReactComponent;
}

declare module '*.svg?url' {
  const url: string;
  export default url;
}
