import { mode, transparentize } from "@chakra-ui/theme-tools";

const brandFocus = "0 0 0 3px rgba(0, 128, 128, 0.3)";

export const buttonStyles = {
  components: {
    Button: {
      variants: {
        primary: {
          fontSize: "10px",
          bg: "blue.400",
          color: "#fff",
          _hover: { bg: "blue.500" },
          _focus: { bg: "blue.500" },
          _active: { bg: "blue.600" },
        },
        navy: {
          fontSize: "10px",
          bg: "navy.900",
          color: "#fff",
          _hover: { bg: "navy.900", filter: "brightness(1.15)" },
          _focus: { bg: "navy.900" },
          _active: { bg: "navy.900", filter: "brightness(0.85)" },
        },
        brand: {
          bg: "brand.500",
          color: "#fff",
          _hover: { bg: "brand.600" },
          _focus: { bg: "brand.600", boxShadow: brandFocus },
          _active: { bg: "brand.800" },
        },
        "brand-outline": (props) => ({
          color: mode("brand.500", "brand.300")(props),
          bg: "transparent",
          border: "1px solid",
          borderColor: mode("brand.500", "brand.300")(props),
          _hover: { bg: "brand.500", color: "white" },
          _focus: { bg: "brand.50", boxShadow: brandFocus },
          _active: { bg: "brand.800", color: "white" },
        }),
        "brand-ghost": (props) => ({
          color: mode("brand.500", "brand.300")(props),
          bg: "transparent",
          _hover: { bg: mode("brand.50", "whiteAlpha.200")(props) },
          _focus: { bg: mode("brand.50", "whiteAlpha.200")(props) },
          _active: { bg: mode("brand.100", "whiteAlpha.300")(props) },
        }),
        "outline-fill": (props) => {
          const { colorScheme: c, theme } = props;
          return {
            color: mode(`${c}.500`, `${c}.300`)(props),
            bg: "transparent",
            border: "1px solid",
            borderColor: mode(`${c}.500`, `${c}.300`)(props),
            _hover: {
              bg: mode(`${c}.500`, `${c}.400`)(props),
              color: "white",
            },
            _active: {
              bg: mode(`${c}.600`, `${c}.500`)(props),
              color: "white",
            },
            _focus: {
              boxShadow: `0 0 0 3px ${transparentize(`${c}.300`, 0.45)(theme)}`,
            },
          };
        },
        neutral: {
          bg: "gray.50",
          color: "gray.700",
          _hover: { bg: "gray.100" },
          _focus: { bg: "gray.100" },
          _active: { bg: "gray.200" },
        },
        danger: {
          color: "white",
          bg: "red.500",
          fontSize: "10px",
          _hover: { bg: "red.600" },
          _focus: { bg: "red.600" },
          _active: { bg: "red.700" },
        },
        outlined: (props) => ({
          color: mode("blue.500", "white")(props),
          bg: "transparent",
          fontSize: "10px",
          border: "1px solid",
          borderColor: mode("blue.500", "white")(props),
          _hover: { bg: mode("blue.50", "whiteAlpha.200")(props) },
          _focus: { bg: mode("blue.50", "whiteAlpha.200")(props) },
          _active: { bg: mode("blue.100", "whiteAlpha.300")(props) },
        }),
        dark: (props) => ({
          color: "white",
          bg: mode("gray.700", "blue.500")(props),
          fontSize: "10px",
          _hover: { bg: mode("gray.600", "blue.600")(props) },
          _focus: { bg: mode("gray.600", "blue.600")(props) },
          _active: { bg: mode("gray.800", "blue.700")(props) },
        }),
        light: (props) => {
          const { colorScheme: c } = props;
          return {
            color: mode(`${c}.600`, `${c}.300`)(props),
            bg: mode(`${c}.50`, "whiteAlpha.200")(props),
            fontSize: "10px",
            _hover: { bg: mode(`${c}.100`, "whiteAlpha.300")(props) },
            _focus: { bg: mode(`${c}.100`, "whiteAlpha.300")(props) },
            _active: { bg: mode(`${c}.200`, "whiteAlpha.400")(props) },
          };
        },
        "no-effects": {
          _hover: { bg: "none" },
          _active: { bg: "none" },
          _focus: { boxShadow: "none" },
        },
      },
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "6px",
        fontSize: "10px",
        transitionProperty: "common",
        transitionDuration: "normal",
      },
    },
  },
};
