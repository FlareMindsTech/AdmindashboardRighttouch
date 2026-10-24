import { mode } from "@chakra-ui/theme-tools";

export const globalStyles = {
  colors: {
    gray: {
      700: "#1f2733",
    },
    brand: {
      50: "#E6F2F2",
      100: "#CCE4E4",
      200: "#99C9C9",
      300: "#66AFAF",
      400: "#339494",
      500: "#008080",
      600: "#006666",
      700: "#005959",
      800: "#004D4D",
      900: "#004040",
    },
    brandAlpha: {
      5: "rgba(0, 128, 128, 0.04)",
      10: "rgba(0, 128, 128, 0.08)",
      20: "rgba(0, 128, 128, 0.12)",
      30: "rgba(0, 128, 128, 0.19)",
      40: "rgba(0, 128, 128, 0.25)",
      50: "rgba(0, 128, 128, 0.31)",
    },
    navy: {
      50: "#d0dcfb",
      100: "#aac0fe",
      200: "#a3b9f8",
      300: "#728fea",
      400: "#3652ba",
      500: "#1b3bbb",
      600: "#24388a",
      700: "#1b254b",
      800: "#111c44",
      900: "#0b1437",
    },
  },
  styles: {
    global: (props) => ({
      body: {
        overflowX: "hidden",
        bg: mode("gray.50", "#1B254B")(props),
        fontFamily: "Helvetica, sans-serif",
      },
      html: {
        fontFamily: "Helvetica, sans-serif",
      },
      "table tr, table tbody tr, .chakra-table tr, .chakra-table tbody tr": {
        transition: "none !important",
        transform: "none !important",
      },
      "table tr:hover, table tbody tr:hover, .chakra-table tr:hover, .chakra-table tbody tr:hover": {
        transform: "none !important",
        boxShadow: "none !important",
      },
    }),
  },
};
