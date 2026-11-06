import { extendTheme } from "@chakra-ui/react";
import { globalStyles } from "./styles";
import { breakpoints } from "./foundations/breakpoints";
import { radii } from "./foundations/radii";
import { buttonStyles } from "./components/button";
import { badgeStyles } from "./components/badge";
import { linkStyles } from "./components/link";
import { inputStyles } from "./components/input";
import { modalStyles } from "./components/modal";
import { CardComponent } from "./additions/card/Card";
import { MainPanelComponent } from "./additions/layout/MainPanel";
import { PanelContentComponent } from "./additions/layout/PanelContent";
import { PanelContainerComponent } from "./additions/layout/PanelContainer";
// import { mode } from "@chakra-ui/theme-tools";
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export default extendTheme(
  { config },
  { breakpoints, radii }, // Breakpoints & Radii tokens
  globalStyles,
  buttonStyles, // Button styles
  badgeStyles, // Badge styles
  linkStyles, // Link styles
  inputStyles, // Input styles
  modalStyles, // Modal styles
  CardComponent, // Card component
  MainPanelComponent, // Main Panel component
  PanelContentComponent, // Panel Content component
  PanelContainerComponent // Panel Container component
);
