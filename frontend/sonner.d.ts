declare module "sonner" {
  import React from "react";

  export type ToasterProps = React.ComponentPropsWithoutRef<"div">;

  export const Toaster: React.FC<ToasterProps>;
}