import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdRefresh, MdSpaceDashboard, MdWarningAmber } from "react-icons/md";

const isChunkError = (error) => {
  const message = String(error?.message || "");
  return (
    error?.name === "ChunkLoadError" ||
    /loading chunk/i.test(message) ||
    /failed to fetch dynamically imported module/i.test(message)
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      isChunkError: isChunkError(error),
    };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Unhandled UI error:", error, info?.componentStack);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleDashboard = () => {
    window.location.hash = "#/owner/dashboard";
    this.setState({ error: null, hasError: false, isChunkError: false });
  };

  render() {
    const { hasError, error, isChunkError: chunkError } = this.state;
    if (!hasError) return this.props.children;

    return (
      <ErrorFallback
        error={error}
        isChunkError={chunkError}
        onReload={this.handleReload}
        onDashboard={this.handleDashboard}
      />
    );
  }
}

function ErrorFallback({ error, isChunkError: chunkError, onReload, onDashboard }) {
  const surface = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const titleColor = useColorModeValue("gray.900", "white");
  const bodyColor = useColorModeValue("gray.600", "gray.300");
  const iconBg = useColorModeValue("orange.50", "orange.900");
  const iconColor = useColorModeValue("orange.600", "orange.300");
  const detailsBg = useColorModeValue("gray.50", "gray.900");
  const details = process.env.NODE_ENV !== "production" ? error?.message : null;

  return (
    <Flex minH="100vh" w="100%" align="center" justify="center" px={4} bg="gray.50">
      <Box
        bg={surface}
        border="1px solid"
        borderColor={border}
        borderRadius="12px"
        boxShadow="0 20px 50px rgba(15, 23, 42, 0.12)"
        p={{ base: 6, md: 8 }}
        maxW="560px"
        w="100%"
      >
        <HStack spacing={3} align="flex-start">
          <Flex
            w="44px"
            h="44px"
            borderRadius="10px"
            bg={iconBg}
            color={iconColor}
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon as={MdWarningAmber} boxSize={6} />
          </Flex>
          <Box>
            <Heading size="md" color={titleColor} lineHeight="1.3">
              {chunkError ? "A new version is available" : "This page could not be displayed"}
            </Heading>
            <Text fontSize="sm" color={bodyColor} mt={2} lineHeight="1.6">
              {chunkError
                ? "The dashboard was updated while this page was open. Reload to continue."
                : "An unexpected error stopped this page from rendering. Your data was not changed."}
            </Text>
          </Box>
        </HStack>

        {details ? (
          <Box
            mt={4}
            p={3}
            borderRadius="8px"
            border="1px solid"
            borderColor={border}
            bg={detailsBg}
          >
            <Text fontSize="xs" color={bodyColor} fontFamily="mono" wordBreak="break-word">
              {details}
            </Text>
          </Box>
        ) : null}

        <HStack mt={6} spacing={3} flexWrap="wrap">
          <Button size="sm" colorScheme="teal" leftIcon={<MdRefresh />} onClick={onReload}>
            Reload page
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<MdSpaceDashboard />}
            onClick={onDashboard}
          >
            Go to dashboard
          </Button>
        </HStack>
      </Box>
    </Flex>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.object,
  isChunkError: PropTypes.bool,
  onReload: PropTypes.func.isRequired,
  onDashboard: PropTypes.func.isRequired,
};

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

export default ErrorBoundary;
