import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaUser,
  FaPhone,
  FaTimes,
  FaChevronDown,
  FaCheckCircle,
} from "react-icons/fa";

export default function TechnicianSearchCombobox({
  technicians = [],
  selectedTechId = "",
  onSelect,
  placeholder = "Search technician by name or phone...",
  allowAll = false,
  allLabel = "All Technicians",
  isDark = false,
  width = { base: "full", md: "340px" },
  size = "sm",
  isDisabled = false,
  showBalance = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  // Helper to extract clean name, phone, city, status from any technician object
  const getTechInfo = useCallback((t) => {
    if (!t) return { id: "", name: "Technician", phone: "", city: "", status: "", balance: "" };
    const id = t._id || t.id || t.technicianId || "";
    const name =
      t.name ||
      (t.userId?.fname ? `${t.userId.fname} ${t.userId.lname || ""}`.trim() : "") ||
      (t.fname ? `${t.fname} ${t.lname || ""}`.trim() : "") ||
      (t.user?.fname ? `${t.user.fname} ${t.user.lname || ""}`.trim() : "") ||
      "Technician";
    const phone = (
      t.userId?.mobileNumber ||
      t.mobileNumber ||
      t.phone ||
      t.userId?.phone ||
      t.user?.mobileNumber ||
      ""
    )
      .toString()
      .trim();
    const city = t.city || t.district || t.primaryCityId?.name || "";
    const status = t.workStatus || t.status || "";
    let balance = "";
    if (t.availableBalancePaise !== undefined || t.walletBalance !== undefined) {
      const paise =
        t.availableBalancePaise ??
        (t.walletBalance ? Math.round(t.walletBalance * 100) : 0);
      balance = `₹${((paise || 0) / 100).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return { id, name, phone, city, status, balance };
  }, []);

  const selectedTech = useMemo(() => {
    if (!selectedTechId) return null;
    return (
      technicians.find((t) => {
        const id = t._id || t.id || t.technicianId;
        return String(id) === String(selectedTechId);
      }) || null
    );
  }, [technicians, selectedTechId]);

  const selectedInfo = useMemo(() => {
    return selectedTech ? getTechInfo(selectedTech) : null;
  }, [selectedTech, getTechInfo]);

  // Real-time filter by both technician name and phone number
  const filteredTechnicians = useMemo(() => {
    const q = search.toLowerCase().trim();
    const qClean = q.replace(/[\s-+]/g, "");
    if (!q) return technicians;

    return technicians.filter((t) => {
      const { name, phone } = getTechInfo(t);
      const cleanPhone = phone.replace(/[\s-+]/g, "");
      return (
        name.toLowerCase().includes(q) ||
        cleanPhone.includes(qClean) ||
        phone.includes(q)
      );
    });
  }, [technicians, search, getTechInfo]);

  const handleSelect = (id) => {
    onSelect && onSelect(id);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <Popover
      isOpen={isOpen}
      initialFocusRef={inputRef}
      onOpen={() => {
        if (isDisabled) return;
        setIsOpen(true);
      }}
      onClose={() => {
        setIsOpen(false);
        setSearch("");
      }}
      placement="bottom-end"
      closeOnBlur={true}
      autoFocus={false}
      matchWidth={false}
    >
      <PopoverTrigger>
        <Flex
          as="button"
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          disabled={isDisabled}
          w={width}
          h={size === "md" ? "42px" : "36px"}
          px={3}
          align="center"
          justify="space-between"
          borderRadius="8px"
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.800" : "white"}
          opacity={isDisabled ? 0.6 : 1}
          cursor={isDisabled ? "not-allowed" : "pointer"}
          _hover={!isDisabled ? { borderColor: isDark ? "teal.400" : "teal.500" } : {}}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px #008080" }}
          transition="all 0.15s ease-in-out"
        >
          <HStack spacing={2} overflow="hidden" flex="1" mr={2}>
            <Icon as={FaUser} color="teal.500" boxSize={3.5} flexShrink={0} />
            {selectedInfo ? (
              <HStack spacing={1.5} overflow="hidden">
                <Text
                  fontSize={size === "md" ? "sm" : "xs"}
                  fontWeight="700"
                  color={isDark ? "white" : "gray.800"}
                  isTruncated
                >
                  {selectedInfo.name}{" "}
                  {selectedInfo.phone && (
                    <Text
                      as="span"
                      fontWeight="500"
                      color={isDark ? "gray.400" : "gray.500"}
                    >
                      ({selectedInfo.phone})
                    </Text>
                  )}
                </Text>
                {showBalance && selectedInfo.balance && (
                  <Badge size="xs" fontSize="9px" colorScheme="teal" variant="subtle" flexShrink={0}>
                    {selectedInfo.balance}
                  </Badge>
                )}
              </HStack>
            ) : (
              <Text fontSize={size === "md" ? "sm" : "xs"} color="gray.400" fontWeight="500" isTruncated>
                {placeholder}
              </Text>
            )}
          </HStack>
          <Icon
            as={FaChevronDown}
            boxSize={2.5}
            color="gray.400"
            transition="transform 0.2s"
            transform={isOpen ? "rotate(180deg)" : "none"}
            flexShrink={0}
          />
        </Flex>
      </PopoverTrigger>

      <Portal>
        <PopoverContent
          w={{ base: "320px", sm: "360px" }}
          maxW="90vw"
          bg={isDark ? "gray.800" : "white"}
          borderColor={isDark ? "gray.700" : "gray.200"}
          borderRadius="12px"
          boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          overflow="hidden"
          zIndex={9999}
          _focus={{ boxShadow: "none" }}
        >
          <PopoverBody p={2.5}>
            {/* Search Input Field */}
            <InputGroup size="sm" mb={2}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" boxSize={3.5} />
              </InputLeftElement>
              <Input
                ref={inputRef}
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="8px"
                fontSize="xs"
                bg={isDark ? "gray.900" : "gray.50"}
                borderColor={isDark ? "gray.700" : "gray.200"}
                _focus={{ borderColor: "teal.500", bg: isDark ? "gray.900" : "white" }}
              />
              {search && (
                <InputRightElement>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={<Icon as={FaTimes} boxSize={3} />}
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  />
                </InputRightElement>
              )}
            </InputGroup>

            {/* List Header Count */}
            <Flex justify="space-between" align="center" px={1} mb={1.5}>
              <Text
                fontSize="2xs"
                fontWeight="700"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Technicians ({filteredTechnicians.length})
              </Text>
              {search && (
                <Text fontSize="2xs" color="teal.500" fontWeight="600">
                  Filtered by "{search}"
                </Text>
              )}
            </Flex>

            {/* Scrollable Results List */}
            <Box
              maxH="240px"
              overflowY="auto"
              pr={1}
              css={{
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#cbd5e1",
                  borderRadius: "4px",
                },
              }}
            >
              {allowAll && !search && (
                <Flex
                  p={2}
                  mb={1}
                  borderRadius="8px"
                  align="center"
                  justify="space-between"
                  cursor="pointer"
                  bg={
                    !selectedTechId
                      ? isDark
                        ? "teal.900"
                        : "teal.50"
                      : "transparent"
                  }
                  border="1px solid"
                  borderColor={!selectedTechId ? "teal.300" : "transparent"}
                  _hover={{
                    bg: !selectedTechId
                      ? isDark
                        ? "teal.900"
                        : "teal.50"
                      : isDark
                      ? "gray.700"
                      : "gray.50",
                  }}
                  onClick={() => handleSelect("")}
                  transition="background 0.15s"
                >
                  <HStack spacing={2}>
                    <Icon as={FaUser} color="teal.500" boxSize={3} />
                    <Text
                      fontSize="xs"
                      fontWeight={!selectedTechId ? "800" : "600"}
                      color={
                        !selectedTechId
                          ? "teal.600"
                          : isDark
                          ? "white"
                          : "gray.800"
                      }
                    >
                      {allLabel}
                    </Text>
                  </HStack>
                  {!selectedTechId && (
                    <Icon as={FaCheckCircle} color="teal.500" boxSize={3.5} />
                  )}
                </Flex>
              )}

              {filteredTechnicians.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={6}
                  px={3}
                  textAlign="center"
                >
                  <Icon as={FaUser} color="gray.300" boxSize={6} mb={2} />
                  <Text fontSize="xs" fontWeight="600" color="gray.600">
                    No technicians found
                  </Text>
                  <Text fontSize="2xs" color="gray.400" mt={0.5}>
                    No match for "{search}". Try searching by phone or name.
                  </Text>
                </Flex>
              ) : (
                filteredTechnicians.map((t) => {
                  const { id, name, phone, city, status, balance } = getTechInfo(t);
                  const isSelected = String(id) === String(selectedTechId);
                  return (
                    <Flex
                      key={id}
                      p={2}
                      mb={1}
                      borderRadius="8px"
                      align="center"
                      justify="space-between"
                      cursor="pointer"
                      bg={
                        isSelected
                          ? isDark
                            ? "teal.900"
                            : "teal.50"
                          : "transparent"
                      }
                      border="1px solid"
                      borderColor={isSelected ? "teal.300" : "transparent"}
                      _hover={{
                        bg: isSelected
                          ? isDark
                            ? "teal.900"
                            : "teal.50"
                          : isDark
                          ? "gray.700"
                          : "gray.50",
                      }}
                      onClick={() => handleSelect(id)}
                      transition="background 0.15s"
                    >
                      <Box flex="1" mr={2} overflow="hidden">
                        <HStack spacing={1.5} align="center">
                          <Text
                            fontSize="xs"
                            fontWeight={isSelected ? "800" : "700"}
                            color={
                              isSelected
                                ? "teal.600"
                                : isDark
                                ? "white"
                                : "gray.800"
                            }
                            isTruncated
                          >
                            {name}
                          </Text>
                          {status && (
                            <Badge
                              size="xs"
                              fontSize="9px"
                              px={1.5}
                              py={0.2}
                              borderRadius="full"
                              colorScheme={
                                status.toLowerCase() === "active" ||
                                status.toLowerCase() === "approved"
                                  ? "green"
                                  : "orange"
                              }
                            >
                              {status}
                            </Badge>
                          )}
                          {showBalance && balance && (
                            <Badge
                              size="xs"
                              fontSize="9px"
                              px={1.5}
                              py={0.2}
                              borderRadius="full"
                              colorScheme="teal"
                              variant="subtle"
                            >
                              {balance}
                            </Badge>
                          )}
                        </HStack>
                        <HStack spacing={2} mt={0.5}>
                          {phone && (
                            <Flex align="center" gap={1}>
                              <Icon as={FaPhone} boxSize={2.5} color="gray.400" />
                              <Text
                                fontSize="2xs"
                                color={isDark ? "gray.400" : "gray.600"}
                                fontFamily="monospace"
                              >
                                {phone}
                              </Text>
                            </Flex>
                          )}
                          {city && (
                            <Text fontSize="2xs" color="gray.400" isTruncated>
                              • {city}
                            </Text>
                          )}
                        </HStack>
                      </Box>
                      {isSelected && (
                        <Icon
                          as={FaCheckCircle}
                          color="teal.500"
                          boxSize={4}
                          flexShrink={0}
                        />
                      )}
                    </Flex>
                  );
                })
              )}
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
