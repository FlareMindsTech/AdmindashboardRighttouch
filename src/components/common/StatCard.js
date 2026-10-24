import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import {
  getClaymorphicCardStyle,
  getClaymorphicIconBoxStyle,
  claymorphicIconFilter,
} from "./skeuomorphicStyles";

/**
 * Shared Claymorphic KPI / Statistics Card
 * Standardized unified height (105px desktop, 90px mobile) and 10px squircle border-radius
 */
function KpiVariant({
  title,
  value,
  icon,
  color = "teal",
  subValue,
  textColor,
  subTextColor,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const cardStyles = getClaymorphicCardStyle(isDark, false);
  const iconBg = `${color}.500`;

  return (
    <Card
      minH={{ base: "90px", md: "105px" }}
      h={{ base: "auto", md: "105px" }}
      borderRadius="10px"
      position="relative"
      overflow="hidden"
      cursor="default"
      p={0}
      {...cardStyles}
    >
      <CardBody
        position="relative"
        zIndex={1}
        p={{ base: 3, md: 4 }}
        display="flex"
        alignItems="center"
        h="100%"
      >
        <Flex align="center" justify="space-between" w="100%">
          <Box flex="1" mr={2} overflow="hidden">
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="bold"
              color={subTextColor || (isDark ? "gray.400" : "gray.600")}
              noOfLines={1}
              letterSpacing="-0.01em"
            >
              {title}
            </Text>
            <Heading
              as="div"
              fontSize={{ base: "lg", md: "2xl" }}
              mt={0.5}
              color={textColor || (isDark ? "gray.100" : "gray.800")}
              fontWeight="800"
              lineHeight="1.2"
              noOfLines={1}
            >
              {value}
            </Heading>
            {subValue && (
              <Text
                fontSize="2xs"
                color={subTextColor || (isDark ? "gray.400" : "gray.500")}
                fontWeight="medium"
                mt={0.5}
                noOfLines={1}
              >
                {subValue}
              </Text>
            )}
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h={{ base: "40px", md: "44px" }}
            w={{ base: "40px", md: "44px" }}
            flexShrink={0}
            ml={2}
            {...getClaymorphicIconBoxStyle(iconBg)}
          >
            <Icon
              as={icon}
              boxSize={{ base: "18px", md: "20px" }}
              color="white"
              sx={claymorphicIconFilter}
            />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
}

function MiniVariant({
  label,
  title,
  value,
  icon,
  bg = "teal.600",
  accent = "#008080",
  loading,
  textColor,
  numberSize,
  interactive = true,
  onClick,
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const cardStyles = getClaymorphicCardStyle(isDark, false, accent);

  return (
    <Card
      minH={{ base: "90px", md: "105px" }}
      h={{ base: "auto", md: "105px" }}
      borderRadius="10px"
      cursor={interactive || onClick ? "pointer" : "default"}
      onClick={onClick}
      {...cardStyles}
      p={0}
    >
      <CardBody
        position="relative"
        zIndex={1}
        p={{ base: 3, md: 4 }}
        display="flex"
        alignItems="center"
        h="100%"
      >
        <Flex flexDirection="row" align="center" justify="space-between" w="100%">
          <Stat me="auto" overflow="hidden">
            <StatLabel
              as="div"
              fontSize={{ base: "xs", md: "sm" }}
              color={isDark ? "gray.400" : "gray.600"}
              fontWeight="bold"
              letterSpacing="-0.01em"
              pb="2px"
              noOfLines={1}
            >
              {label !== undefined ? label : title}
            </StatLabel>
            <StatNumber
              as="div"
              fontSize={{ base: "lg", md: numberSize || "2xl" }}
              color={textColor || (isDark ? "gray.100" : "gray.800")}
              fontWeight="800"
              lineHeight="1.2"
              mt={0.5}
              noOfLines={1}
            >
              {loading ? <Spinner size="xs" /> : value}
            </StatNumber>
          </Stat>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h={{ base: "40px", md: "44px" }}
            w={{ base: "40px", md: "44px" }}
            flexShrink={0}
            ml={2}
            {...getClaymorphicIconBoxStyle(bg)}
          >
            <Icon
              as={icon}
              boxSize={{ base: "18px", md: "20px" }}
              color="white"
              sx={claymorphicIconFilter}
            />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
}

export default function StatCard(props) {
  const { variant, ...rest } = props;
  if (variant === "mini") return <MiniVariant {...rest} />;
  return <KpiVariant {...rest} />;
}
