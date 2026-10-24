import React from "react";
import { Box, useColorMode } from "@chakra-ui/react";
import { getClaymorphicCardStyle } from "./skeuomorphicStyles";

/**
 * Shared claymorphic section container for dashboard panels, tables, and charts.
 * Features inflated 3D clay depth, dual inset shadows, and smooth squircle corners.
 */
export default function SectionCard(props) {
  const {
    children,
    cardBg,
    borderColor,
    gridColumn,
    bodyProps,
    isInteractive = false,
    ...rest
  } = props;
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const clayStyles = getClaymorphicCardStyle(isDark, false, "#008080", isInteractive);

  return (
    <Box
      gridColumn={gridColumn}
      borderRadius="10px"
      position="relative"
      overflow="hidden"
      _hover={{ transform: "none" }}
      {...clayStyles}
      {...rest}
    >
      <Box p={{ base: 4, md: 5 }} {...bodyProps}>
        {children}
      </Box>
    </Box>
  );
}

