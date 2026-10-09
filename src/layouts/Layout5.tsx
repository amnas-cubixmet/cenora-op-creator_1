import { LAYOUTS } from "./config";
import { GridLayout, type LayoutProps } from "./GridLayout";

export function Layout5(props: LayoutProps) {
  return <GridLayout {...props} cfg={LAYOUTS[5]} />;
}
