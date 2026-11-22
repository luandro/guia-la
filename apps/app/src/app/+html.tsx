import {
  ScrollViewStyleReset,
  useServerDocumentContext,
} from "expo-router/html";
import type { ReactNode } from "react";

import { langForPath } from "@/lib/html-lang";

/**
 * Static web HTML shell (PR #14 review): Expo Router's default shell
 * hard-codes <html lang="en">, which mislabeled every locale page and
 * contradicted the hreflang/og:locale metadata. The static renderer calls
 * this component per exported page with the matched route's pathname
 * (@expo/router-server prepareRenderContext), so the document language
 * follows the page's locale segment. Everything else mirrors the default
 * shell (expo-router/html + @expo/router-server Html), including the
 * server-document head/body nodes where generateMetadata output lands.
 */

interface RootHtmlProps {
  children?: ReactNode;
  pathname?: string;
}

export default function RootHtml({ children, pathname = "/" }: RootHtmlProps) {
  const { bodyAttributes, bodyNodes, headNodes, htmlAttributes } =
    useServerDocumentContext();
  return (
    <html lang={langForPath(pathname)} {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
