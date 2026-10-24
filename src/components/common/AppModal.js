import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Flex,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";

const globalScrollbarStyles = {
  "&::-webkit-scrollbar": { width: "6px", height: "6px" },
  "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.04)", borderRadius: "8px" },
  "&::-webkit-scrollbar-thumb": { background: "rgba(0, 128, 128, 0.28)", borderRadius: "8px" },
  "&::-webkit-scrollbar-thumb:hover": { background: "rgba(0, 128, 128, 0.45)" },
};

/**
 * Universal AppModal Component
 *
 * Provides a standardized, accessible modal shell across all dashboard views.
 * Standardizes backdrop blur, skeuomorphic surface styling, header icon badges,
 * viewport-safe body scrolling, and action footers.
 */
export default function AppModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconBg = "teal.50",
  iconColor = "#008080",
  size = "xl",
  isCentered = true,
  children,
  footer,
  primaryAction,
  secondaryAction,
  showCloseButton = true,
  bodyMaxH = "70vh",
  bodyBg,
  headerBg,
  footerBg,
  scrollBehavior = "inside",
  closeOnOverlayClick = true,
  zIndex = 1400,
}) {
  const defaultHeaderBg = useColorModeValue("white", "gray.800");
  const defaultBodyBg = useColorModeValue("white", "gray.800");
  const defaultFooterBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const titleColor = useColorModeValue("gray.800", "white");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");

  const effectiveHeaderBg = headerBg || defaultHeaderBg;
  const effectiveBodyBg = bodyBg || defaultBodyBg;
  const effectiveFooterBg = footerBg || defaultFooterBg;

  const hasDefaultFooter = Boolean(primaryAction || secondaryAction !== undefined);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isCentered={isCentered}
      scrollBehavior={scrollBehavior}
      closeOnOverlayClick={closeOnOverlayClick}
    >
      <ModalOverlay
        bg="blackAlpha.700"
        backdropFilter="blur(6px)"
        zIndex={zIndex}
      />
      <ModalContent
        bg={effectiveBodyBg}
        borderRadius="10px"
        boxShadow="2xl"
        border="1px solid"
        borderColor={borderColor}
        zIndex={zIndex + 1}
        mx={{ base: 3, md: 4 }}
        overflow="hidden"
      >
        {/* Standardized Header */}
        {(title || icon) && (
          <ModalHeader
            bg={effectiveHeaderBg}
            borderBottom="1px solid"
            borderColor={borderColor}
            pr={showCloseButton ? "52px" : 6}
            py={4}
            px={6}
          >
            <HStack spacing={3} align="center">
              {icon && (
                <Flex
                  w="38px"
                  h="38px"
                  borderRadius="6px"
                  bg={iconBg}
                  color={iconColor}
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={icon} boxSize={5} />
                </Flex>
              )}
              <Box minW={0} flex="1">
                {typeof title === "string" ? (
                  <Text
                    fontSize="md"
                    fontWeight="800"
                    color={titleColor}
                    lineHeight="1.3"
                    noOfLines={1}
                  >
                    {title}
                  </Text>
                ) : (
                  title
                )}
                {subtitle && (
                  <Text
                    fontSize="xs"
                    fontWeight="500"
                    color={subtitleColor}
                    mt={0.5}
                    lineHeight="1.3"
                  >
                    {subtitle}
                  </Text>
                )}
              </Box>
            </HStack>
          </ModalHeader>
        )}

        {showCloseButton && (
          <ModalCloseButton
            top="16px"
            right="16px"
            borderRadius="full"
            _hover={{ bg: "gray.100" }}
          />
        )}

        {/* Modal Body with Viewport Safety & Polish Scrollbars */}
        <ModalBody
          bg={effectiveBodyBg}
          py={5}
          px={6}
          maxH={bodyMaxH}
          overflowY="auto"
          css={globalScrollbarStyles}
        >
          {children}
        </ModalBody>

        {/* Modal Footer */}
        {footer !== undefined ? (
          footer && (
            <ModalFooter
              bg={effectiveFooterBg}
              borderTop="1px solid"
              borderColor={borderColor}
              py={3.5}
              px={6}
            >
              {footer}
            </ModalFooter>
          )
        ) : hasDefaultFooter ? (
          <ModalFooter
            bg={effectiveFooterBg}
            borderTop="1px solid"
            borderColor={borderColor}
            py={3.5}
            px={6}
            justifyContent="flex-end"
          >
            <HStack spacing={3}>
              {secondaryAction !== null && (
                <Button
                  size="sm"
                  variant={secondaryAction?.variant || "ghost"}
                  onClick={secondaryAction?.onClick || onClose}
                  borderRadius="6px"
                >
                  {secondaryAction?.label || "Close"}
                </Button>
              )}
              {primaryAction && (
                <Button
                  size="sm"
                  colorScheme={primaryAction.colorScheme || "teal"}
                  onClick={primaryAction.onClick}
                  isLoading={primaryAction.isLoading}
                  leftIcon={primaryAction.leftIcon}
                  borderRadius="6px"
                  fontWeight="700"
                >
                  {primaryAction.label || "Confirm"}
                </Button>
              )}
            </HStack>
          </ModalFooter>
        ) : null}
      </ModalContent>
    </Modal>
  );
}

AppModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  icon: PropTypes.elementType,
  iconBg: PropTypes.string,
  iconColor: PropTypes.string,
  size: PropTypes.string,
  isCentered: PropTypes.bool,
  children: PropTypes.node,
  footer: PropTypes.node,
  primaryAction: PropTypes.shape({
    label: PropTypes.node,
    onClick: PropTypes.func,
    isLoading: PropTypes.bool,
    colorScheme: PropTypes.string,
    leftIcon: PropTypes.node,
  }),
  secondaryAction: PropTypes.shape({
    label: PropTypes.node,
    onClick: PropTypes.func,
    variant: PropTypes.string,
  }),
  showCloseButton: PropTypes.bool,
  bodyMaxH: PropTypes.string,
  bodyBg: PropTypes.string,
  headerBg: PropTypes.string,
  footerBg: PropTypes.string,
  scrollBehavior: PropTypes.string,
  closeOnOverlayClick: PropTypes.bool,
  zIndex: PropTypes.number,
};
