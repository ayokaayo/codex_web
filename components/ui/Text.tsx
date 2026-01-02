import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { ReactNode } from "react";

type Variant =
  | "title"
  | "heading"
  | "subheading"
  | "body"
  | "caption"
  | "label"
  | "oracle"
  | "oracleItalic";

interface Props extends TextProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<Variant, { className: string; fontFamily: string }> = {
  title: { className: "text-4xl text-gold tracking-widest", fontFamily: "Cinzel-Bold" },
  heading: { className: "text-2xl text-gold", fontFamily: "Cinzel-Regular" },
  subheading: { className: "text-lg text-gold", fontFamily: "Cinzel-Regular" },
  body: { className: "text-base text-text-primary", fontFamily: "EBGaramond-Regular" },
  caption: { className: "text-sm text-text-secondary", fontFamily: "EBGaramond-Regular" },
  label: { className: "text-xs text-text-secondary uppercase tracking-wider", fontFamily: "EBGaramond-Medium" },
  oracle: { className: "text-lg text-text-primary leading-relaxed", fontFamily: "EBGaramond-Regular" },
  oracleItalic: { className: "text-lg text-text-primary leading-relaxed", fontFamily: "EBGaramond-Italic" },
};

export function Text({ variant = "body", className = "", children, style, ...props }: Props) {
  const variantStyle = variantStyles[variant];

  return (
    <RNText
      className={`${variantStyle.className} ${className}`}
      style={[{ fontFamily: variantStyle.fontFamily }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
