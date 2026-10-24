import React from "react";
import PropTypes from "prop-types";
import { Flex, HStack, Text, Button, Select } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/**
 * Canonical table pagination footer.
 * Left: "Showing X-Y of Z" (omitted when totalRows is unknown).
 * Right: rows-per-page select + Previous/Next buttons.
 * Used internally by <DataTable pagination={{...}}/> and importable directly
 * for legacy tables during migration.
 */
export default function TablePagination({
  page,
  totalPages,
  totalRows,
  indexOfFirst = 0,
  indexOfLast,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 15, 25, 50, 100],
  label = "records",
  showRowsPerPage = true,
}) {
  const first = totalRows === 0 ? 0 : indexOfFirst + 1;
  const last = indexOfLast ?? Math.min(page * (rowsPerPage || 1), totalRows);

  return (
    <Flex
      px={4}
      py={2.5}
      borderTop="1px solid"
      borderColor="gray.100"
      bg="gray.50"
      justify="space-between"
      align="center"
      gap={2}
      flexShrink={0}
    >
      {totalRows != null && (
        <Text fontSize="xs" color="gray.600" noOfLines={1}>
          Showing {first} - {last} of {totalRows} {label}
        </Text>
      )}
      <HStack spacing={2} flexShrink={0}>
        {showRowsPerPage && onRowsPerPageChange && (
          <HStack spacing={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="500" whiteSpace="nowrap">
              Rows per page:
            </Text>
            <Select
              size="xs"
              w="75px"
              borderRadius="6px"
              bg="white"
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {rowsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </HStack>
        )}
        <Button
          size="xs"
          borderRadius="6px"
          leftIcon={<FaChevronLeft />}
          isDisabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        {totalPages != null && (
          <Text fontSize="xs" fontWeight="bold" color="brand.500" px={1} whiteSpace="nowrap">
            {page} / {totalPages}
          </Text>
        )}
        <Button
          size="xs"
          borderRadius="6px"
          rightIcon={<FaChevronRight />}
          isDisabled={totalPages != null ? page >= totalPages : true}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </HStack>
    </Flex>
  );
}

TablePagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number,
  totalRows: PropTypes.number,
  indexOfFirst: PropTypes.number,
  indexOfLast: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  label: PropTypes.string,
  showRowsPerPage: PropTypes.bool,
};
