import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  IconButton,
  Flex,
  HStack,
  Icon,
  Text,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  MdCheckCircle,
  MdErrorOutline,
  MdInfoOutline,
  MdWarningAmber,
  MdClose,
} from "react-icons/md";

const STATUS_CONFIG = {
  success: {
    icon: MdCheckCircle,
    label: "SUCCESS",
    colorScheme: "green",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    glow: "rgba(16, 185, 129, 0.35)",
    badgeBg: "green.50",
    badgeColor: "green.700",
    darkBadgeBg: "rgba(16, 185, 129, 0.15)",
    darkBadgeColor: "green.300",
  },
  error: {
    icon: MdErrorOutline,
    label: "ERROR",
    colorScheme: "red",
    gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    glow: "rgba(239, 68, 68, 0.35)",
    badgeBg: "red.50",
    badgeColor: "red.700",
    darkBadgeBg: "rgba(239, 68, 68, 0.15)",
    darkBadgeColor: "red.300",
  },
  warning: {
    icon: MdWarningAmber,
    label: "WARNING",
    colorScheme: "orange",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    glow: "rgba(245, 158, 11, 0.35)",
    badgeBg: "orange.50",
    badgeColor: "orange.700",
    darkBadgeBg: "rgba(245, 158, 11, 0.15)",
    darkBadgeColor: "orange.300",
  },
  info: {
    icon: MdInfoOutline,
    label: "NOTICE",
    colorScheme: "teal",
    gradient: "linear-gradient(135deg, #008080 0%, #005959 100%)",
    glow: "rgba(0, 128, 128, 0.35)",
    badgeBg: "teal.50",
    badgeColor: "teal.700",
    darkBadgeBg: "rgba(0, 128, 128, 0.15)",
    darkBadgeColor: "teal.300",
  },
};

const safeDescription = (description) => {
  if (description == null || description === "") return null;
  if (React.isValidElement(description)) return description;
  if (typeof description === "string" || typeof description === "number") {
    return String(description);
  }
  return null;
};

export default function AppToast({
  title,
  description,
  status = "info",
  isClosable = true,
  onClose,
  action,
  requestId,
  duration,
}) {
  const meta = STATUS_CONFIG[status] || STATUS_CONFIG.info;
  const surface = useColorModeValue("rgba(255, 255, 255, 0.96)", "rgba(17, 24, 39, 0.94)");
  const border = useColorModeValue("rgba(0, 0, 0, 0.08)", "rgba(255, 255, 255, 0.12)");
  const titleColor = useColorModeValue("gray.900", "white");
  const bodyColor = useColorModeValue("gray.600", "gray.300");
  const badgeBg = useColorModeValue(meta.badgeBg, meta.darkBadgeBg);
  const badgeColor = useColorModeValue(meta.badgeColor, meta.darkBadgeColor);
  const shadow = useColorModeValue(
    "0 20px 48px -12px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
    "0 20px 48px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
  );
  const hoverShadow = useColorModeValue(
    "0 24px 54px -10px rgba(15, 23, 42, 0.2), 0 6px 16px rgba(15, 23, 42, 0.08)",
    "0 24px 54px -10px rgba(0, 0, 0, 0.8)"
  );
  const ambientOpacity = useColorModeValue(0.5, 0.7);
  const refTagBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const closeBtnHoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.200");
  const closeBtnHoverColor = useColorModeValue("gray.800", "white");
  const progressTrackBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");

  const descriptionNode = safeDescription(description);

  return (
    <Box
      role={status === "error" ? "alert" : "status"}
      aria-live={status === "error" ? "assertive" : "polite"}
      bg={surface}
      backdropFilter="blur(20px) saturate(180%)"
      sx={{ WebkitBackdropFilter: "blur(20px) saturate(180%)" }}
      border="1px solid"
      borderColor={border}
      borderRadius="16px"
      boxShadow={shadow}
      p={4}
      pr={isClosable ? 10 : 4}
      minW={{ base: "calc(100vw - 32px)", sm: "380px" }}
      maxW="460px"
      position="relative"
      overflow="hidden"
      transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{
        boxShadow: hoverShadow,
        "& .toast-progress-bar": {
          animationPlayState: "paused",
        },
      }}
    >
      {/* Top Edge Gradient Accent Bar */}
      <Box position="absolute" top={0} left={0} right={0} h="2.5px" bg={meta.gradient} />

      {/* Ambient Diffuse Glow behind Icon */}
      <Box
        position="absolute"
        top="-24px"
        left="-24px"
        w="96px"
        h="96px"
        borderRadius="full"
        bg={meta.glow}
        filter="blur(28px)"
        pointerEvents="none"
        opacity={ambientOpacity}
      />

      <HStack align="flex-start" spacing={3.5} position="relative" zIndex={1}>
        {/* Modern 3D Floating Icon Badge */}
        <Flex
          align="center"
          justify="center"
          w="38px"
          h="38px"
          borderRadius="12px"
          bg={meta.gradient}
          color="white"
          boxShadow={`0 6px 18px ${meta.glow}`}
          flexShrink={0}
          mt={0.5}
        >
          <Icon as={meta.icon} boxSize={5} />
        </Flex>

        {/* Content Area */}
        <Box flex="1" minW={0}>
          <HStack spacing={2} align="center" mb={1}>
            <Badge
              fontSize="3xs"
              fontWeight="900"
              letterSpacing="0.08em"
              px={2}
              py={0.5}
              borderRadius="full"
              bg={badgeBg}
              color={badgeColor}
            >
              {meta.label}
            </Badge>
            <Text fontSize="3xs" color="gray.400" fontWeight="600">
              ● Live Notification
            </Text>
          </HStack>

          {title ? (
            <Text
              fontSize="sm"
              fontWeight="800"
              letterSpacing="-0.01em"
              color={titleColor}
              lineHeight="1.35"
              wordBreak="break-word"
            >
              {title}
            </Text>
          ) : null}

          {descriptionNode ? (
            <Text
              fontSize="xs"
              color={bodyColor}
              mt={title ? 1 : 0}
              lineHeight="1.55"
              wordBreak="break-word"
            >
              {descriptionNode}
            </Text>
          ) : null}

          {requestId ? (
            <HStack
              spacing={1.5}
              mt={2}
              px={2}
              py={0.5}
              bg={refTagBg}
              borderRadius="6px"
              w="fit-content"
            >
              <Text fontSize="3xs" fontWeight="800" color="gray.400">REF</Text>
              <Text fontSize="3xs" color={bodyColor} fontFamily="mono">
                {requestId}
              </Text>
            </HStack>
          ) : null}

          {action?.label && typeof action.onClick === "function" ? (
            <Button
              size="xs"
              bg={meta.gradient}
              color="white"
              _hover={{ opacity: 0.92, transform: "translateY(-1px)" }}
              _active={{ transform: "translateY(0)" }}
              borderRadius="8px"
              fontWeight="800"
              fontSize="xs"
              mt={2.5}
              px={3}
              boxShadow={`0 2px 8px ${meta.glow}`}
              onClick={action.onClick}
              isLoading={Boolean(action.isLoading)}
            >
              {action.label}
            </Button>
          ) : null}
        </Box>
      </HStack>

      {/* Dismiss Button */}
      {isClosable ? (
        <IconButton
          size="xs"
          aria-label="Dismiss notification"
          icon={<Icon as={MdClose} boxSize={3.5} />}
          variant="ghost"
          color="gray.400"
          _hover={{
            bg: closeBtnHoverBg,
            color: closeBtnHoverColor,
            transform: "scale(1.1)",
          }}
          _active={{ transform: "scale(0.95)" }}
          position="absolute"
          top={3}
          right={3}
          borderRadius="full"
          onClick={onClose}
          zIndex={2}
        />
      ) : null}

      {/* Animated Remaining Duration Progress Bar */}
      {duration && duration > 0 ? (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="2.5px"
          bg={progressTrackBg}
          overflow="hidden"
        >
          <Box
            h="100%"
            bg={meta.gradient}
            w="100%"
            className="toast-progress-bar"
            style={{
              animation: `toastCountdown ${duration}ms linear forwards`,
            }}
          />
          <style>{`
            @keyframes toastCountdown {
              0% { width: 100%; }
              100% { width: 0%; }
            }
          `}</style>
        </Box>
      ) : null}
    </Box>
  );
}

AppToast.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  status: PropTypes.oneOf(["success", "error", "warning", "info"]),
  isClosable: PropTypes.bool,
  onClose: PropTypes.func,
  action: PropTypes.shape({
    label: PropTypes.node,
    onClick: PropTypes.func,
    isLoading: PropTypes.bool,
  }),
  requestId: PropTypes.string,
  duration: PropTypes.number,
};
