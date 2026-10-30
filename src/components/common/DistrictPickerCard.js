import React, { useMemo, useRef } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Progress,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { MdApartment, MdCheckCircle } from "react-icons/md";
import LocationCombobox from "./LocationCombobox";
import {
  TAMIL_NADU_DISTRICTS,
  findTnDistrictForRecord,
} from "../../data/tamilNaduLocations";

export function QuickPickChips({
  items = [],
  max = 8,
  accent = "teal",
  label = "Quick Pick:",
  countText = "",
  onMore,
}) {
  if (!items.length) return null;

  const visible = items.slice(0, max);
  const remaining = items.length - visible.length;
  const isTeal = accent === "teal";

  return (
    <Box mb={2.5}>
      <Flex align="center" justify="space-between" mb={1} gap={2}>
        <Text
          fontSize="10px"
          fontWeight="700"
          color={`${accent}.700`}
          textTransform="uppercase"
        >
          {label}
        </Text>
        {countText && (
          <Text fontSize="10px" color={`${accent}.600`} fontWeight="600">
            {countText}
          </Text>
        )}
      </Flex>
      <Wrap spacing={1.5}>
        {visible.map((item) => (
          <WrapItem key={item.key}>
            <Button
              size="xs"
              borderRadius="full"
              variant={
                item.selected
                  ? isTeal
                    ? "brand"
                    : "solid"
                  : isTeal
                  ? "brand-outline"
                  : "outline"
              }
              colorScheme={isTeal ? undefined : accent}
              fontWeight={item.selected ? "700" : "600"}
              fontSize="11px"
              h="24px"
              px={2.5}
              maxW="210px"
              onClick={item.onClick}
            >
              <Text isTruncated>{item.label}</Text>
            </Button>
          </WrapItem>
        ))}
        {remaining > 0 && onMore && (
          <WrapItem>
            <Button
              size="xs"
              borderRadius="full"
              variant="subtle"
              colorScheme={accent}
              fontSize="10px"
              h="24px"
              px={2.5}
              onClick={onMore}
            >
              +{remaining} more in dropdown
            </Button>
          </WrapItem>
        )}
      </Wrap>
    </Box>
  );
}

export default function DistrictPickerCard({
  mode = "master",
  allDistricts = TAMIL_NADU_DISTRICTS,
  operationalDistricts = [],
  selectedName = "",
  selectedId = "",
  onSelectTnDistrict,
  onSelectOperationalDistrict,
  isEditing = false,
  editingDistrictId = null,
  accent = "teal",
}) {
  const comboboxRef = useRef(null);
  const isMaster = mode === "master";

  const configuredRecords = useMemo(() => {
    const list = [];
    if (!isMaster) return list;
    (operationalDistricts || []).forEach((record) => {
      const tn = findTnDistrictForRecord(record);
      if (tn) list.push({ record, tn });
    });
    return list;
  }, [isMaster, operationalDistricts]);

  const configuredByName = useMemo(() => {
    const map = new Map();
    configuredRecords.forEach(({ record, tn }) => {
      const isCurrent =
        isEditing && String(record._id) === String(editingDistrictId);
      if (!map.has(tn.name) || isCurrent) {
        map.set(tn.name, record);
      }
    });
    return map;
  }, [configuredRecords, editingDistrictId, isEditing]);

  const availableDistricts = useMemo(
    () =>
      isMaster
        ? (allDistricts || []).filter(
            (district) => !configuredByName.has(district.name)
          )
        : [],
    [allDistricts, configuredByName, isMaster]
  );

  const masterGroups = useMemo(() => {
    if (!isMaster) return [];
    const available = availableDistricts.map((district) => ({
      value: district.name,
      label: district.name,
      description: "Available to configure",
      badge: district.code,
      keywords: `${district.name} ${district.code}`,
    }));

    const configured = (allDistricts || [])
      .filter((district) => configuredByName.has(district.name))
      .map((district) => {
        const record = configuredByName.get(district.name);
        const isCurrent =
          isEditing && String(record?._id) === String(editingDistrictId);
        return {
          value: district.name,
          label: district.name,
          description: isCurrent ? "Currently editing" : "Already added",
          badge: district.code,
          keywords: `${district.name} ${district.code}`,
          disabled: !isCurrent,
        };
      });

    return [
      {
        label: `Available Districts to Add (${available.length})`,
        options: available,
      },
      {
        label: `Already Configured (${configured.length})`,
        options: configured,
      },
    ].filter((group) => group.options.length);
  }, [
    allDistricts,
    availableDistricts,
    configuredByName,
    editingDistrictId,
    isEditing,
    isMaster,
  ]);

  const zoneOptions = useMemo(() => {
    if (isMaster) return [];
    return (operationalDistricts || [])
      .map((record) => {
        const tn = findTnDistrictForRecord(record);
        const inactive =
          record.active === false || record.isActive === false;
        return {
          value: String(record._id),
          label: tn?.name || record.city || record.name || "Unnamed district",
          description: [
            record.city && record.city !== tn?.name
              ? `Hub: ${record.city}`
              : record.name,
            inactive ? "Inactive" : null,
          ]
            .filter(Boolean)
            .join(" • "),
          badge: tn?.code || record.code || "",
          badgeColor: inactive ? "red" : accent,
          keywords: [
            tn?.name,
            record.name,
            record.city,
            record.code,
            record.state,
          ]
            .filter(Boolean)
            .join(" "),
          record,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [accent, isMaster, operationalDistricts]);

  const groups = isMaster ? masterGroups : null;
  const options = isMaster ? [] : zoneOptions;

  const selectedOption =
    !isMaster &&
    zoneOptions.find((option) => String(option.value) === String(selectedId));

  const selectedDistrict = isMaster
    ? (allDistricts || []).find((district) => district.name === selectedName)
    : null;

  const configuredCount = configuredByName.size;
  const coveragePercent = Math.round(
    (configuredCount / Math.max(1, (allDistricts || []).length)) * 100
  );

  const quickItems = isMaster
    ? availableDistricts.map((district) => ({
        key: district.name,
        label: `${district.name} (${district.code})`,
        selected: selectedName === district.name,
        onClick: () => onSelectTnDistrict?.(district.name),
      }))
    : zoneOptions.map((option) => ({
        key: option.value,
        label: option.label,
        selected: String(option.value) === String(selectedId),
        onClick: () => onSelectOperationalDistrict?.(option.record),
      }));

  const comboValue = isMaster ? selectedName : selectedId;
  const comboSelectedLabel = isMaster
    ? selectedDistrict
      ? `${selectedDistrict.name} (${selectedDistrict.code})`
      : selectedName
    : selectedOption?.label || "";

  return (
    <Box
      bg="white"
      p={3.5}
      borderRadius="12px"
      border="1px solid"
      borderColor={`${accent}.200`}
      mb={4}
      boxShadow="xs"
    >
      <Flex justify="space-between" align="center" mb={2} flexWrap="wrap" gap={2}>
        <HStack spacing={2}>
          <Icon as={MdApartment} color={`${accent}.600`} boxSize={4} />
          <Text
            fontSize="xs"
            fontWeight="700"
            color={`${accent}.900`}
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            {isMaster
              ? `Tamil Nadu District Master (${(allDistricts || []).length} Revenue Districts)`
              : `Operational Districts (${(operationalDistricts || []).length})`}
          </Text>
        </HStack>
        <HStack spacing={1.5} flexWrap="wrap">
          {isMaster ? (
            <>
              <Badge
                colorScheme={accent}
                fontSize="10px"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontWeight="700"
              >
                {configuredCount} / {(allDistricts || []).length} Added
              </Badge>
              <Badge
                colorScheme="blue"
                fontSize="10px"
                borderRadius="full"
                px={2}
                py={0.5}
              >
                {availableDistricts.length} Available ({coveragePercent}% configured)
              </Badge>
            </>
          ) : (
            <Badge
              colorScheme={accent}
              fontSize="10px"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontWeight="700"
            >
              {selectedOption
                ? "Parent district selected"
                : "Select parent operational district"}
            </Badge>
          )}
        </HStack>
      </Flex>

      {isMaster && (
        <Box mb={2.5}>
          <Progress
            value={coveragePercent}
            colorScheme={accent}
            size="xs"
            borderRadius="full"
            bg="gray.100"
            h="4px"
          />
        </Box>
      )}

      <QuickPickChips
        items={quickItems}
        accent={accent}
        label={isMaster ? "Quick Pick Available Districts:" : "Quick Pick District:"}
        countText={
          isMaster
            ? `${availableDistricts.length} remaining`
            : `${(operationalDistricts || []).length} available`
        }
        onMore={() => comboboxRef.current?.open()}
      />

      <Box>
        <Flex align="center" justify="space-between" mb={1} gap={2}>
          <Text
            fontSize="10px"
            fontWeight="700"
            color={`${accent}.800`}
            textTransform="uppercase"
          >
            {isMaster
              ? "Select Tamil Nadu Revenue District:"
              : "Select Parent Operational District:"}
          </Text>
          {isMaster && selectedDistrict && (
            <Badge
              colorScheme="green"
              fontSize="10px"
              borderRadius="full"
              px={2}
            >
              Selected: {selectedDistrict.name} ({selectedDistrict.code})
            </Badge>
          )}
          {!isMaster && selectedOption && (
            <Badge
              colorScheme={accent}
              fontSize="10px"
              borderRadius="full"
              px={2}
            >
              Selected: {selectedOption.label}
            </Badge>
          )}
        </Flex>

        <LocationCombobox
          ref={comboboxRef}
          options={options}
          groups={groups}
          value={comboValue}
          selectedLabel={comboSelectedLabel}
          onChange={(option) => {
            if (isMaster) {
              onSelectTnDistrict?.(option.value);
            } else {
              onSelectOperationalDistrict?.(option.record);
            }
          }}
          placeholder={
            isMaster
              ? "Search or select from all 38 Tamil Nadu districts..."
              : "Search operational districts..."
          }
          emptyText={
            isMaster
              ? "No Tamil Nadu district found."
              : "No operational districts yet. Create a district first."
          }
          colorScheme={accent}
        />
      </Box>

      {isMaster && availableDistricts.length === 0 && (
        <HStack spacing={1.5} mt={2} color="green.600">
          <Icon as={MdCheckCircle} boxSize={3.5} />
          <Text fontSize="10px" fontWeight="600">
            All 38 Tamil Nadu revenue districts are configured.
          </Text>
        </HStack>
      )}
    </Box>
  );
}
