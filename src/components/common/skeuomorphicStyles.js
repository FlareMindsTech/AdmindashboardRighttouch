/**
 * Modern Claymorphic & Skeuomorphic Design System Tokens & Helpers
 *
 * Provides soft, inflated 3D pillowy clay aesthetics:
 * - Dual inner inset shadows (upper specular highlight + lower depth shade)
 * - Soft, floating ambient drop shadows
 * - Pillowy squircle border-radius (22px - 24px)
 * - Tactile clay icon badge buttons with 3D volume
 * - Gentle elastic hover and squish press micro-interactions
 */

/**
 * Modern Skeuomorphic Design System Tokens & Helpers (Zero Box-Shadow)
 *
 * Implements pure tactile, physical skeuomorphism WITHOUT using boxShadow:
 * - Directional 3D bevel edges (illuminated top/left highlight + extruded bottom shelf)
 * - Cylindrical/convex surface gradients for physical ceramic and metallic depth
 * - Specular sheen luster overlays via top pseudo-element reflections
 * - Tactile mechanical button and debossed groove styling
 * - Mechanical press/lift micro-interactions via base-bevel shifts
 */

export const skeuomorphicCardProps = {
  borderRadius: "10px",
  position: "relative",
  overflow: "hidden",
  boxShadow: "none",
  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
};

// Backward-compatible alias
export const claymorphicCardProps = skeuomorphicCardProps;

/**
 * Returns complete skeuomorphic surface styles for a card container (NO BOX-SHADOW)
 * @param {boolean} isDark - Whether dark mode is active
 * @param {boolean} isActive - Whether the card is currently selected/active filter
 * @param {string} accentColor - Active border or accent tint
 */
export const getSkeuomorphicCardStyle = (
  isDark = false,
  isActive = false,
  accentColor = "#008080",
  isInteractive = false
) => {
  if (isDark) {
    return {
      bg: "linear-gradient(180deg, #253347 0%, #1D2635 50%, #151D28 100%)",
      borderRadius: "10px",
      borderTop: isActive ? `2px solid ${accentColor}` : "1.5px solid rgba(255, 255, 255, 0.22)",
      borderLeft: isActive ? `2px solid ${accentColor}` : "1.5px solid rgba(255, 255, 255, 0.12)",
      borderRight: isActive ? `2px solid ${accentColor}` : "1.5px solid rgba(0, 0, 0, 0.45)",
      borderBottom: isActive ? `3.5px solid ${accentColor}` : "3px solid rgba(0, 0, 0, 0.75)",
      boxShadow: "none",
      position: "relative",
      transition: "all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)",
      _before: {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "38%",
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%)",
        borderTopLeftRadius: "inherit",
        borderTopRightRadius: "inherit",
        pointerEvents: "none",
      },
      _hover: isInteractive
        ? {
            transform: "translateY(-3px)",
            boxShadow: "none",
            borderBottom: isActive ? `4px solid ${accentColor}` : "4px solid rgba(0, 0, 0, 0.9)",
            borderTopColor: isActive ? accentColor : "rgba(255, 255, 255, 0.32)",
          }
        : {
            transform: "none",
            boxShadow: "none",
          },
      _active: isInteractive
        ? {
            transform: "translateY(1.5px)",
            boxShadow: "none",
            borderBottom: isActive ? `1.5px solid ${accentColor}` : "1.5px solid rgba(0, 0, 0, 0.6)",
          }
        : {
            transform: "none",
            boxShadow: "none",
          },
    };
  }

  // Light Mode (Tactile ceramic surface with directional bevel edges & specular sheen, NO BOX-SHADOW)
  return {
    bg: "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 40%, #EEF2F6 100%)",
    borderRadius: "10px",
    borderTop: isActive ? `2px solid ${accentColor}` : "1.5px solid #FFFFFF",
    borderLeft: isActive ? `2px solid ${accentColor}` : "1.5px solid rgba(255, 255, 255, 0.9)",
    borderRight: isActive ? `2px solid ${accentColor}` : "1.5px solid #D1D9E4",
    borderBottom: isActive ? `3.5px solid ${accentColor}` : "3px solid #BAC6D6",
    boxShadow: "none",
    position: "relative",
    transition: "all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)",
    _before: {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "38%",
      background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)",
      borderTopLeftRadius: "inherit",
      borderTopRightRadius: "inherit",
      pointerEvents: "none",
    },
    _hover: isInteractive
      ? {
          transform: "translateY(-3px)",
          boxShadow: "none",
          borderBottom: isActive ? `4px solid ${accentColor}` : "4px solid #A8B8CC",
          borderTopColor: "#FFFFFF",
          borderLeftColor: "#FFFFFF",
        }
      : {
          transform: "none",
          boxShadow: "none",
        },
    _active: isInteractive
      ? {
          transform: "translateY(1.5px)",
          boxShadow: "none",
          borderBottom: isActive ? `1.5px solid ${accentColor}` : "1.5px solid #CBD5E1",
        }
      : {
          transform: "none",
          boxShadow: "none",
        },
  };
};

// Backward-compatible alias
export const getClaymorphicCardStyle = getSkeuomorphicCardStyle;

/**
 * Returns skeuomorphic 3D tactile pillowy styles for icon badge tiles (NO BOX-SHADOW)
 * Uses high-contrast directional bevels + cylindrical gradient to create physical volume
 */
export const getSkeuomorphicIconBoxStyle = (bgValue = "teal.500") => {
  return {
    bg: bgValue,
    borderRadius: "6px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "none",
    borderTop: "2px solid rgba(255, 255, 255, 0.55)",
    borderLeft: "1.5px solid rgba(255, 255, 255, 0.35)",
    borderRight: "1.5px solid rgba(0, 0, 0, 0.18)",
    borderBottom: "3px solid rgba(0, 0, 0, 0.32)",
    transition: "all 0.2s ease",
    _after: {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "48%",
      background: "linear-gradient(180deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.05) 100%)",
      borderTopLeftRadius: "inherit",
      borderTopRightRadius: "inherit",
      pointerEvents: "none",
    },
    _hover: {
      transform: "scale(1.04)",
      boxShadow: "none",
    },
    _active: {
      transform: "translateY(1px) scale(0.97)",
      borderBottomWidth: "1.5px",
      boxShadow: "none",
    },
  };
};

// Backward-compatible alias
export const getClaymorphicIconBoxStyle = getSkeuomorphicIconBoxStyle;

export const skeuomorphicIconFilter = {
  filter: "none",
};

// Backward-compatible alias
export const claymorphicIconFilter = skeuomorphicIconFilter;

/**
 * Helper for skeuomorphic debossed/grooved inner items (NO BOX-SHADOW)
 * Creates physical sunken tray appearance using top dark groove + bottom white highlight rim
 */
export const getSkeuomorphicItemStyle = (isDark = false) => {
  if (isDark) {
    return {
      bg: "linear-gradient(180deg, #131A24 0%, #1A2330 100%)",
      borderRadius: "6px",
      borderTop: "1.5px solid rgba(0, 0, 0, 0.65)",
      borderLeft: "1px solid rgba(0, 0, 0, 0.45)",
      borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      borderBottom: "1.5px solid rgba(255, 255, 255, 0.12)",
      boxShadow: "none",
      transition: "all 0.2s ease",
      _hover: {
        bg: "linear-gradient(180deg, #161E2A 0%, #202B3B 100%)",
        transform: "translateY(-1px)",
        boxShadow: "none",
      },
    };
  }
  return {
    bg: "linear-gradient(180deg, #EAEFF5 0%, #F5F8FA 100%)",
    borderRadius: "6px",
    borderTop: "1.5px solid rgba(148, 163, 184, 0.45)",
    borderLeft: "1px solid rgba(148, 163, 184, 0.28)",
    borderRight: "1px solid #FFFFFF",
    borderBottom: "1.5px solid #FFFFFF",
    boxShadow: "none",
    transition: "all 0.2s ease",
    _hover: {
      bg: "linear-gradient(180deg, #E3E9F0 0%, #EEF3F8 100%)",
      transform: "translateY(-1px)",
      boxShadow: "none",
    },
  };
};

// Backward-compatible alias
export const getClaymorphicItemStyle = getSkeuomorphicItemStyle;

/**
 * Skeuomorphic Table & Row styles with ZERO hover transforms/lifts
 * Prevents jitter, shifts, and unexpected hover movement on data tables
 */
export const getSkeuomorphicTableStyle = (isDark = false) => ({
  ...getSkeuomorphicCardStyle(isDark, false, "#008080", false),
  _hover: {
    transform: "none",
    boxShadow: "none",
  },
  _active: {
    transform: "none",
    boxShadow: "none",
  },
});

export const skeuomorphicTableRowProps = {
  transition: "none",
  _hover: {
    transform: "none",
    boxShadow: "none",
  },
};

