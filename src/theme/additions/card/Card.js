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
    panel: () => ({
      bg: "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 40%, #EEF2F6 100%)",
      borderRadius: "10px",
      borderTop: "1.5px solid #FFFFFF",
      borderLeft: "1.5px solid rgba(255, 255, 255, 0.9)",
      borderRight: "1.5px solid #D1D9E4",
      borderBottom: "3px solid #BAC6D6",
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
    }),
    claymorphic: () => ({
      bg: "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 40%, #EEF2F6 100%)",
      borderRadius: "10px",
      borderTop: "1.5px solid #FFFFFF",
      borderLeft: "1.5px solid rgba(255, 255, 255, 0.9)",
      borderRight: "1.5px solid #D1D9E4",
      borderBottom: "3px solid #BAC6D6",
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
    }),
    skeuomorphic: () => ({
      bg: "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 40%, #EEF2F6 100%)",
      borderRadius: "10px",
      borderTop: "1.5px solid #FFFFFF",
      borderLeft: "1.5px solid rgba(255, 255, 255, 0.9)",
      borderRight: "1.5px solid #D1D9E4",
      borderBottom: "3px solid #BAC6D6",
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
    }),
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
