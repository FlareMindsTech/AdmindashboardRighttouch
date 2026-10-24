import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  Text,
  Skeleton,
  Icon,
} from "@chakra-ui/react";
import { FaInbox } from "react-icons/fa";
import TablePagination from "./TablePagination";

const scrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "transparent",
    borderRadius: "3px",
    transition: "background 0.3s ease",
  },
  "&:hover::-webkit-scrollbar-thumb": {
    background: "#cbd5e1",
  },
  "&:hover::-webkit-scrollbar-thumb:hover": {
    background: "#94a3b8",
  },
};

const TH_BASE = {
  bg: "brand.500",
  color: "white",
  fontSize: "xs",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  py: 2.5,
  px: 3,
  whiteSpace: "nowrap",
  borderColor: "brand.600",
};

const TD_BASE = {
  py: 2.5,
  px: 3,
  fontSize: "sm",
  verticalAlign: "middle",
  borderColor: "gray.100",
};

/**
 * Canonical admin table — single source of truth for header/row geometry.
 *
 * - Header: brand.500 filled bar, white uppercase xs text, py 2.5 (uniform height)
 * - Rows: py 2.5 px 3, sm text, gray.100 dividers, brandAlpha.10 hover (uniform height)
 * - Loading: header stays visible, skeleton rows keep geometry stable
 * - Empty: header stays visible, icon empty-state row (fixes floating-text empties)
 * - Pagination: optional canonical footer via `pagination`
 */
export default function DataTable({
  columns,
  rows = [],
  keyExtractor,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription,
  emptyIcon = FaInbox,
  emptyAction,
  showIndex = false,
  stickyHeader = true,
  pagination,
  maxHeight,
  tableProps,
  ...rest
}) {
  const colCount = columns.length + (showIndex ? 1 : 0);
  const skeletonRows = Math.min(5, (pagination?.rowsPerPage ?? 10) || 5);

  const thOf = (col) => {
    const shared = {
      ...TH_BASE,
      textAlign: col.align || "left",
      ...(col.width ? { w: col.width } : {}),
      ...(col.minWidth ? { minW: col.minWidth } : {}),
      ...col.thProps,
    };
    if (stickyHeader) {
      return { ...shared, position: "sticky", top: 0, zIndex: 2 };
    }
    return shared;
  };

  const cellOf = (col, row, index) => {
    if (col.cell) return col.cell(row, index, rows);
    const value = row?.[col.key];
    return value == null || value === "" ? "—" : String(value);
  };

  const tdOf = (col) => ({
    ...TD_BASE,
    textAlign: col.align || "left",
    ...(col.truncate ? { maxW: col.width || "240px", isTruncated: true } : {}),
    ...col.tdProps,
  });

  const rowIndex = (i) => {
    if (pagination?.page && pagination?.rowsPerPage) {
      return (pagination.page - 1) * pagination.rowsPerPage + i + 1;
    }
    return i + 1;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex={1}
      minH={0}
      overflow="hidden"
      {...rest}
    >
      <Box
        overflow="auto"
        css={scrollbarStyles}
        flex={1}
        minH={0}
        display={{ base: "block" }}
      >
        <Table
          variant="simple"
          size="sm"
          bg="white"
          position="relative"
          {...tableProps}
        >
          <Thead>
            <Tr>
              {showIndex && (
                <Th {...thOf({ width: "56px" })} textAlign="center">
                  #
                </Th>
              )}
              {columns.map((col) => (
                <Th key={col.key || col.label} {...thOf(col)}>
                  {col.label}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <Tr key={`skeleton-${i}`}>
                  {showIndex && (
                    <Td {...TD_BASE} textAlign="center">
                      <Skeleton height="14px" width="24px" mx="auto" />
                    </Td>
                  )}
                  {columns.map((col) => (
                    <Td key={col.key || col.label} {...tdOf(col)}>
                      <Skeleton height="14px" width={i % 2 === 0 ? "80%" : "60%"} />
                    </Td>
                  ))}
                </Tr>
              ))
            ) : rows.length === 0 ? (
              <Tr>
                <Td colSpan={colCount} p={0} border="none">
                  <Flex
                    py={10}
                    justify="center"
                    align="center"
                    direction="column"
                    color="gray.400"
                  >
                    <Icon as={emptyIcon} boxSize={8} mb={2} />
                    <Text fontWeight="medium">{emptyTitle}</Text>
                    {emptyDescription && (
                      <Text fontSize="sm" mt={1}>
                        {emptyDescription}
                      </Text>
                    )}
                    {emptyAction}
                  </Flex>
                </Td>
              </Tr>
            ) : (
              rows.map((row, i) => (
                <Tr
                  key={keyExtractor ? keyExtractor(row, i) : i}
                  _hover={{ bg: "brandAlpha.10" }}
                >
                  {showIndex && (
                    <Td {...TD_BASE} textAlign="center" color="gray.500" isTruncated>
                      {rowIndex(i)}
                    </Td>
                  )}
                  {columns.map((col) => (
                    <Td key={col.key || col.label} {...tdOf(col)}>
                      {cellOf(col, row, i)}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
      {pagination && (
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalRows={pagination.totalRows}
          indexOfFirst={pagination.indexOfFirst}
          indexOfLast={pagination.indexOfLast}
          rowsPerPage={pagination.rowsPerPage}
          onPageChange={pagination.onPageChange}
          onRowsPerPageChange={pagination.onRowsPerPageChange}
          rowsPerPageOptions={pagination.rowsPerPageOptions}
          label={pagination.label}
          showRowsPerPage={pagination.showRowsPerPage}
        />
      )}
    </Box>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.node.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"]),
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      truncate: PropTypes.bool,
      cell: PropTypes.func,
      thProps: PropTypes.object,
      tdProps: PropTypes.object,
    })
  ).isRequired,
  rows: PropTypes.array,
  keyExtractor: PropTypes.func,
  isLoading: PropTypes.bool,
  emptyTitle: PropTypes.string,
  emptyDescription: PropTypes.node,
  emptyIcon: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.elementType]),
  emptyAction: PropTypes.node,
  showIndex: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  pagination: PropTypes.shape({
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
  }),
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tableProps: PropTypes.object,
};
