declare module './ui/input' {
  import { DetailedHTMLProps, InputHTMLAttributes } from 'react';
  export interface InputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}
  export const Input: React.FC<InputProps>;
}

declare module './ui/label' {
  import { DetailedHTMLProps, LabelHTMLAttributes } from 'react';
  export interface LabelProps extends DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> {}
  export const Label: React.FC<LabelProps>;
}

declare module "@radix-ui/react-slot";
declare module "class-variance-authority";
declare module "vaul";
declare module "input-otp";
declare module '@radix-ui/react-menubar';
declare module '@radix-ui/react-navigation-menu';
declare module "react-resizable-panels";
declare module "@radix-ui/react-toast";
declare module "@radix-ui/react-toggle-group";
