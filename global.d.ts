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
