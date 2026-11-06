export const modalStyles = {
  components: {
    Modal: {
      baseStyle: {
        overlay: {
          bg: "blackAlpha.700",
          backdropFilter: "blur(6px)",
        },
        dialog: {
          borderRadius: "10px",
          boxShadow: "2xl",
          bg: "white",
        },
        header: {
          fontWeight: "800",
          fontSize: "md",
          px: 6,
          py: 4,
          borderBottom: "1px solid",
          borderColor: "gray.100",
          bg: "white",
        },
        body: {
          px: 6,
          py: 5,
        },
        footer: {
          px: 6,
          py: 3.5,
          borderTop: "1px solid",
          borderColor: "gray.100",
          bg: "gray.50",
        },
        closeButton: {
          top: 3,
          right: 3,
          borderRadius: "full",
          _hover: { bg: "blackAlpha.50" },
        },
      },
    },
  },
};
