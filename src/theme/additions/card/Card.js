const Card = {
  baseStyle: {
    p: "22px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderRadius: "10px",
    position: "relative",
    wordWrap: "break-word",
    backgroundClip: "border-box",
    transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  variants: {
    panel: (props) => {
      const isDark = props.colorMode === "dark";
      return {
        bg: isDark
          ? "linear-gradient(180deg, #253347 0%, #1D2635 50%, #151D28 100%)"
          : "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 40%, #EEF2F6 100%)",
        borderRadius: "10px",
        borderTop: isDark ? "1.5px solid rgba(255, 255, 255, 0.22)" : "1.5px solid #FFFFFF",
        borderLeft: isDark ? "1.5px solid rgba(255, 255, 255, 0.12)" : "1.5px solid rgba(255, 255, 255, 0.9)",
        borderRight: isDark ? "1.5px solid rgba(0, 0, 0, 0.45)" : "1.5px solid #D1D9E4",
        borderBottom: isDark ? "3px solid rgba(0, 0, 0, 0.75)" : "3px solid #BAC6D6",
        boxShadow: "none",
        position: "relative",
        transition: "all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)",
        _hover: {
          transform: "none",
          boxShadow: "none",
        },
        _active: {
          transform: "none",
          boxShadow: "none",
        },
      };
    },
    claymorphic: (props) => {
      const isDark = props.colorMode === "dark";
      return {
        bg: isDark
          ? "linear-gradient(180deg, #253347 0%, #1D2635 50%, #151D28 100%)"
          : "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 40%, #EEF2F6 100%)",
        borderRadius: "10px",
        borderTop: isDark ? "1.5px solid rgba(255, 255, 255, 0.22)" : "1.5px solid #FFFFFF",
        borderLeft: isDark ? "1.5px solid rgba(255, 255, 255, 0.12)" : "1.5px solid rgba(255, 255, 255, 0.9)",
        borderRight: isDark ? "1.5px solid rgba(0, 0, 0, 0.45)" : "1.5px solid #D1D9E4",
        borderBottom: isDark ? "3px solid rgba(0, 0, 0, 0.75)" : "3px solid #BAC6D6",
        boxShadow: "none",
        position: "relative",
        transition: "all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)",
        _hover: {
          transform: "none",
          boxShadow: "none",
        },
        _active: {
          transform: "none",
          boxShadow: "none",
        },
      };
    },
    skeuomorphic: (props) => {
      const isDark = props.colorMode === "dark";
      return {
        bg: isDark
          ? "linear-gradient(180deg, #253347 0%, #1D2635 50%, #151D28 100%)"
          : "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 40%, #EEF2F6 100%)",
        borderRadius: "10px",
        borderTop: isDark ? "1.5px solid rgba(255, 255, 255, 0.22)" : "1.5px solid #FFFFFF",
        borderLeft: isDark ? "1.5px solid rgba(255, 255, 255, 0.12)" : "1.5px solid rgba(255, 255, 255, 0.9)",
        borderRight: isDark ? "1.5px solid rgba(0, 0, 0, 0.45)" : "1.5px solid #D1D9E4",
        borderBottom: isDark ? "3px solid rgba(0, 0, 0, 0.75)" : "3px solid #BAC6D6",
        boxShadow: "none",
        position: "relative",
        transition: "all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)",
        _hover: {
          transform: "none",
          boxShadow: "none",
        },
        _active: {
          transform: "none",
          boxShadow: "none",
        },
      };
    },
  },
  defaultProps: {
    variant: "panel",
  },
};

export const CardComponent = {
  components: {
    Card,
  },
};
