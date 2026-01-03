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
  title: { className: "text-5xl text-gold-bright tracking-widest text-center", fontFamily: "Cinzel-ExtraBold" },
  heading: { className: "text-3xl text-gold-bright mb-3", fontFamily: "Cinzel-ExtraBold" },
  subheading: { className: "text-2xl text-gold mb-2", fontFamily: "Cinzel-ExtraBold" },
  body: { className: "text-2xl text-gray-100 leading-relaxed", fontFamily: "EBGaramond-Regular" },
  caption: { className: "text-xl text-gray-300 leading-normal", fontFamily: "EBGaramond-Regular" },
  label: { className: "text-base text-gold-muted uppercase tracking-[0.2em]", fontFamily: "Cinzel-ExtraBold" },
  oracle: { className: "text-3xl text-gray-100 leading-loose", fontFamily: "EBGaramond-Regular" },
  oracleItalic: { className: "text-3xl text-gray-300 leading-loose italic", fontFamily: "EBGaramond-Italic" },
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
