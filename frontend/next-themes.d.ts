declare module "next-themes" {
  import * as React from "react";

  export interface ThemeProviderProps {
    attribute?: string;
    defaultTheme?: string;
    value?: Record<string, string>;
    children: React.ReactNode;
  }

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
}
