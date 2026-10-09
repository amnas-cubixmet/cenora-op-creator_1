import { LAYOUTS } from "./config";
import { GridLayout, type LayoutProps } from "./GridLayout";

export function Layout6(props: LayoutProps) {
  return <GridLayout {...props} cfg={LAYOUTS[6]} />;
}
