import React from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";

/**
 * Shared mobile-card shell + ghost action row — Phase 2 UI consolidation.
 *
 * Every *MobileCard in the views (User, Product ×2, Service ×2, Finance,
 * Reports ×2) renders this exact shell: p3 white card, 1px teal-tinted
 * border, md radius, sm shadow, mb3, press-scale feedback. Bodies stay
 * per-screen (entity JSX is not shared); only the shell and the standard
 * ghost IconButton row are centralized so spacing/border/press behavior
 * can never drift between screens again.
 *
 * Visual-parity note: FinanceTracking's PaymentMobileCard previously omitted
 * `transition`/`_active`; it now gets the same press feedback as the other
 * seven cards (layout, spacing and colors unchanged).
 */

export function MobileCard({ children, ...rest }) {
  return (
    <Box
      p={3}
      bg="white"
      borderWidth="1px"
      borderColor="#00808020"
      borderRadius="10px"
      shadow="sm"
      mb={3}
      transition="all 0.2s"
      _active={{ transform: "scale(0.98)" }}
      {...rest}
    >
      {children}
    </Box>
  );
}

/**
 * Standard trailing action row: ghost xs IconButtons, right-aligned.
 * actions: [{ key, label, icon, colorScheme, onClick }]
 */
export function MobileCardActions({ actions = [] }) {
  return (
    <Flex gap={2} justify="flex-end">
      {actions.map((a) => (
        <IconButton
          key={a.key || a.label}
          aria-label={a.label}
          icon={a.icon}
          size="xs"
          colorScheme={a.colorScheme}
          variant="ghost"
          onClick={a.onClick}
        />
      ))}
    </Flex>
  );
}

export default MobileCard;
