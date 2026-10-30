import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverAnchor,
  PopoverBody,
  PopoverContent,
  Portal,
  Text,
} from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa6";
import { MdClear, MdPlace, MdSearch } from "react-icons/md";

const optionSearchText = (option) =>
  [
    option.label,
    option.value,
    option.description,
    option.badge,
    option.keywords,
    option.groupLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const optionKey = (option, index = 0) =>
  String(
    option?.value ??
      option?.label ??
      `${option?.groupLabel || "option"}-${index}`
  );

const LocationCombobox = forwardRef(function LocationCombobox(
  {
    options = [],
    groups = null,
    value = "",
    selectedLabel = "",
    onChange,
    onCustomSelect,
    allowCustom = false,
    placeholder = "Search or select...",
    emptyText = "No results found.",
    colorScheme = "teal",
    size = "sm",
    isDisabled = false,
    isInvalid = false,
    footer = null,
    maxH = "240px",
    inputProps = {},
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef(null);
  const optionRefs = useRef({});
  const listboxId = useMemo(
    () => `location-listbox-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  const flatOptions = useMemo(() => {
    if (groups) {
      return groups.flatMap((group) =>
        (group.options || []).map((option) => ({
          ...option,
          groupLabel: group.label,
        }))
      );
    }
    return options;
  }, [groups, options]);

  const selectedOption = useMemo(
    () =>
      flatOptions.find(
        (option) => String(option.value) === String(value)
      ) || null,
    [flatOptions, value]
  );

  const displayValue = isOpen
    ? query
    : selectedLabel || selectedOption?.label || (value ? String(value) : "");

  const displayGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    const matches = (option) =>
      !search || optionSearchText(option).includes(search);

    const baseGroups = groups
      ? groups.map((group) => ({
          label: group.label,
          options: (group.options || []).filter(matches),
        }))
      : [{ label: null, options: options.filter(matches) }];

    const hasExact = flatOptions.some(
      (option) =>
        String(option.label || "").trim().toLowerCase() === search
    );

    if (allowCustom && search && !hasExact) {
      baseGroups.push({
        label: "Custom location",
        options: [
          {
            value: "__custom__",
            label: `Use "${query.trim()}"`,
            description: "Search this place with OpenStreetMap",
            __custom: true,
            keywords: query,
          },
        ],
      });
    }

    return baseGroups.filter((group) => group.options.length > 0);
  }, [allowCustom, flatOptions, groups, options, query]);

  const navOptions = useMemo(
    () =>
      displayGroups
        .flatMap((group) => group.options)
        .filter((option) => !option.disabled),
    [displayGroups]
  );

  const openDropdown = useCallback(() => {
    if (isDisabled) return;
    setQuery("");
    setIsOpen(true);
  }, [isDisabled]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        openDropdown();
        inputRef.current?.focus();
      },
      close: closeDropdown,
      focus: () => inputRef.current?.focus(),
    }),
    [closeDropdown, openDropdown]
  );

  useEffect(() => {
    if (!isOpen) return;
    const selectedIndex = navOptions.findIndex(
      (option) => String(option.value) === String(value)
    );
    setHighlighted(selectedIndex >= 0 ? selectedIndex : navOptions.length ? 0 : -1);
  }, [isOpen, navOptions, value]);

  useEffect(() => {
    if (!isOpen || highlighted < 0) return;
    const option = navOptions[highlighted];
    if (!option) return;
    const node = optionRefs.current[optionKey(option, highlighted)];
    if (node?.scrollIntoView) {
      node.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted, isOpen, navOptions]);

  const selectOption = useCallback(
    (option) => {
      if (!option || option.disabled) return;
      if (option.__custom) {
        onCustomSelect?.(query.trim());
      } else {
        onChange?.(option);
      }
      closeDropdown();
    },
    [closeDropdown, onCustomSelect, onChange, query]
  );

  const moveHighlight = useCallback(
    (direction) => {
      if (!isOpen) {
        openDropdown();
        return;
      }
      if (!navOptions.length) return;
      setHighlighted((current) => {
        const start = current < 0 ? 0 : current;
        return (start + direction + navOptions.length) % navOptions.length;
      });
    },
    [isOpen, navOptions.length, openDropdown]
  );

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
      return;
    }
    if (event.key === "Home" && isOpen) {
      event.preventDefault();
      if (navOptions.length) setHighlighted(0);
      return;
    }
    if (event.key === "End" && isOpen) {
      event.preventDefault();
      if (navOptions.length) setHighlighted(navOptions.length - 1);
      return;
    }
    if (event.key === "Enter") {
      if (isOpen && highlighted >= 0 && navOptions[highlighted]) {
        event.preventDefault();
        selectOption(navOptions[highlighted]);
      }
      return;
    }
    if (event.key === "Escape") {
      if (isOpen) {
        event.preventDefault();
        closeDropdown();
      }
      return;
    }
    if (event.key === "Tab" && isOpen) {
      closeDropdown();
    }
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={closeDropdown}
      placement="bottom-start"
      strategy="fixed"
      matchWidth
      isLazy
      autoFocus={false}
      returnFocusOnClose={false}
      closeOnBlur
      gutter={4}
    >
      <PopoverAnchor>
        <Box w="100%" minW={0}>
          <InputGroup size={size}>
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color={`${colorScheme}.500`} boxSize={4} />
            </InputLeftElement>
            <Input
              ref={inputRef}
              role="combobox"
              aria-expanded={isOpen}
              aria-autocomplete="list"
              aria-activedescendant={
                isOpen && highlighted >= 0 && navOptions[highlighted]
                  ? `${listboxId}-option-${optionKey(
                      navOptions[highlighted],
                      highlighted
                    )}`
                  : undefined
              }
              aria-controls={listboxId}
              value={displayValue}
              placeholder={placeholder}
              onFocus={() => {
                if (!isDisabled) openDropdown();
              }}
              onClick={() => {
                if (!isDisabled && !isOpen) openDropdown();
              }}
              onKeyDown={handleKeyDown}
              onChange={(event) => {
                setQuery(event.target.value);
                if (!isOpen) setIsOpen(true);
                setHighlighted(0);
              }}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              bg="white"
              borderRadius="8px"
              borderColor={
                isOpen ? `${colorScheme}.400` : `${colorScheme}.300`
              }
              focusBorderColor={`${colorScheme}.500`}
              fontSize="xs"
              fontWeight={query ? "600" : "500"}
              pr="52px"
              {...inputProps}
            />
            <InputRightElement w="auto" pr={1.5}>
              <HStack spacing={0.5}>
                {isOpen && query && (
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={<MdClear />}
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      setHighlighted(0);
                      inputRef.current?.focus();
                    }}
                    h="20px"
                    w="20px"
                    minW="20px"
                  />
                )}
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={
                    <Icon
                      as={FaChevronDown}
                      transform={isOpen ? "rotate(180deg)" : "none"}
                      transition="transform 0.2s"
                    />
                  }
                  aria-label={isOpen ? "Close options" : "Open options"}
                  onClick={() => {
                    if (isOpen) {
                      closeDropdown();
                    } else {
                      openDropdown();
                      inputRef.current?.focus();
                    }
                  }}
                  h="20px"
                  w="20px"
                  minW="20px"
                  color={`${colorScheme}.600`}
                />
              </HStack>
            </InputRightElement>
          </InputGroup>
        </Box>
      </PopoverAnchor>

      <Portal>
        <PopoverContent
          rootProps={{ zIndex: 1800 }}
          zIndex={1800}
          minW="240px"
          maxW="calc(100vw - 32px)"
          bg="white"
          border="1px solid"
          borderColor={`${colorScheme}.300`}
          borderRadius="10px"
          boxShadow="0 18px 40px -14px rgba(15, 23, 42, 0.35)"
          overflow="hidden"
          _focus={{ outline: "none" }}
        >
          <PopoverBody
            p={1.5}
            maxH={maxH}
            overflowY="auto"
            overscrollBehavior="contain"
            role="listbox"
            id={listboxId}
          >
            {displayGroups.map((group, groupIndex) => (
              <Box key={`${group.label || "options"}-${groupIndex}`} mb={1}>
                {group.label && (
                  <Text
                    fontSize="10px"
                    fontWeight="700"
                    color={`${colorScheme}.800`}
                    px={2.5}
                    py={1}
                    bg={`${colorScheme}.50`}
                    borderRadius="6px"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    mb={1}
                  >
                    {group.label}
                  </Text>
                )}
                {group.options.map((option, optionIndex) => {
                  const key = optionKey(option, optionIndex);
                  const navIndex = navOptions.indexOf(option);
                  const isHighlighted = navIndex === highlighted;
                  const isSelected =
                    String(option.value) === String(value) && !option.__custom;
                  return (
                    <Flex
                      key={key}
                      id={`${listboxId}-option-${key}`}
                      ref={(node) => {
                        optionRefs.current[key] = node;
                      }}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      align="center"
                      justify="space-between"
                      gap={2}
                      px={3}
                      py={1.5}
                      borderRadius="6px"
                      cursor={option.disabled ? "not-allowed" : "pointer"}
                      opacity={option.disabled ? 0.55 : 1}
                      bg={
                        isSelected
                          ? `${colorScheme}.50`
                          : isHighlighted
                          ? "gray.50"
                          : "transparent"
                      }
                      _hover={
                        option.disabled ? {} : { bg: `${colorScheme}.50` }
                      }
                      transition="background 0.15s"
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => {
                        if (!option.disabled && navIndex >= 0) {
                          setHighlighted(navIndex);
                        }
                      }}
                      onClick={() => selectOption(option)}
                    >
                      <HStack spacing={2} minW={0} flex="1">
                        <Icon
                          as={MdPlace}
                          color={
                            option.disabled
                              ? "gray.400"
                              : `${colorScheme}.500`
                          }
                          boxSize={3.5}
                          flexShrink={0}
                        />
                        <Box minW={0}>
                          <Text
                            fontSize="xs"
                            fontWeight={isSelected ? "700" : "600"}
                            color={option.disabled ? "gray.500" : "gray.800"}
                            isTruncated
                          >
                            {option.label}
                          </Text>
                          {option.description && (
                            <Text
                              fontSize="10px"
                              color="gray.500"
                              isTruncated
                            >
                              {option.description}
                            </Text>
                          )}
                        </Box>
                      </HStack>
                      {option.badge && (
                        <Badge
                          colorScheme={option.badgeColor || colorScheme}
                          variant={option.disabled ? "subtle" : "solid"}
                          fontSize="9px"
                          borderRadius="full"
                          px={2}
                          flexShrink={0}
                        >
                          {option.badge}
                        </Badge>
                      )}
                    </Flex>
                  );
                })}
              </Box>
            ))}

            {displayGroups.length === 0 && (
              <Box py={4} px={3} textAlign="center">
                <Text fontSize="xs" color="gray.500">
                  {emptyText}
                </Text>
              </Box>
            )}

            {footer && (
              <Box
                borderTop="1px solid"
                borderColor="gray.100"
                pt={1.5}
                mt={1}
                onMouseDown={(event) => event.preventDefault()}
              >
                {footer}
              </Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
});

export default LocationCombobox;
