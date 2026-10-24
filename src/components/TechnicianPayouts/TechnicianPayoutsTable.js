import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Skeleton,
  Center,
  Icon,
  Tooltip,
  useToast,
  useColorMode,
  Flex,
  Select,
} from "@chakra-ui/react";
import {
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaMoneyCheckAlt,
  FaEye,
  FaUndo,
  FaFileInvoice,
  FaLock,
  FaCopy,
  FaExclamationCircle,
} from "react-icons/fa";
import PayoutStatusBadge from "./PayoutStatusBadge";
import { formatInr } from "./FinancialBreakdown";

export default function TechnicianPayoutsTable({
  withdrawals = [],
  loading = false,
  currentUser,
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 25,
  onPageChange,
  onLimitChange,
  onViewDetails,
  onViewReceipt,
  onRecordTransfer,
  onApprove,
  onReject,
  onRevert,
  onResolveReview,
  onFreezeTechnician,
  onRetry,
}) {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const isOwner = currentUser?.role?.toLowerCase() === "owner";

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const getGrossPaise = (item) =>
    item?.requestedAmountPaise ??
    item?.amountPaise ??
    (item?.amount ? Math.round(item.amount * 100) : 0);

  const getNetPaise = (item) =>
    item?.netPayoutAmountPaise ??
    (item?.financials?.netPayoutAmountPaise ?? getGrossPaise(item));

  const getTechName = (item) => {
    if (typeof item.technicianName === "string" && item.technicianName) return item.technicianName;
    const tech = item.technicianId || item.technician;
    if (tech && typeof tech === "object") {
      const user = tech.userId;
      if (user && typeof user === "object") {
        return `${user.fname || ""} ${user.lname || ""}`.trim() || user.mobileNumber || "Technician";
      }
      if (tech.fname) return `${tech.fname} ${tech.lname || ""}`.trim();
      if (tech.name) return tech.name;
    }
    return "Technician";
  };

  const getTechPhone = (item) => {
    const tech = item.technicianId || item.technician;
    if (tech && typeof tech === "object") {
      const user = tech.userId;
      if (user && typeof user === "object") return user.mobileNumber || "";
      if (tech.mobileNumber) return tech.mobileNumber;
    }
    return "";
  };

  return (
    <Box overflowX="auto" borderRadius="16px" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
      <Table variant="simple" size="sm" bg={isDark ? "gray.850" : "white"}>
        <Thead bg={isDark ? "gray.800" : "gray.50"}>
          <Tr>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em">
              Withdrawal ID
            </Th>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em">
              Technician
            </Th>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em">
              Requested Date
            </Th>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em" isNumeric>
              Gross (₹)
            </Th>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em" isNumeric>
              Deductions (₹)
            </Th>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em" isNumeric>
              Net Payable (₹)
            </Th>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em">
              Mode
            </Th>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em">
              Status
            </Th>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em">
              Bank Ref / UTR
            </Th>
            <Th py={3.5} fontSize="3xs" textTransform="uppercase" letterSpacing="0.05em" textAlign="center">
              Actions
            </Th>
          </Tr>
        </Thead>

        <Tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Tr key={i}>
                <Td colSpan={10} py={4}>
                  <Skeleton height="24px" borderRadius="6px" />
                </Td>
              </Tr>
            ))
          ) : withdrawals.length === 0 ? (
            <Tr>
              <Td colSpan={10} py={12} textAlign="center">
                <Center>
                  <VStack spacing={2}>
                    <Icon as={FaExclamationCircle} boxSize={8} color="gray.400" />
                    <Text fontSize="sm" fontWeight="600" color="gray.600">
                      No withdrawal requests found for this filter.
                    </Text>
                    <Text fontSize="2xs" color="gray.400">
                      Adjust your search or filter settings to view records.
                    </Text>
                  </VStack>
                </Center>
              </Td>
            </Tr>
          ) : (
            withdrawals.map((item) => {
              const id = String(item._id || item.withdrawalId || "");
              const status = String(item.status || "").toLowerCase().trim();
              const grossPaise = getGrossPaise(item);
              const netPaise = getNetPaise(item);
              const commPaise = item.commissionDeductionPaise || 0;
              const penaltyPaise = item.penaltyDeductionPaise || 0;
              const totalDeductionsPaise = commPaise + penaltyPaise;

              const techName = getTechName(item);
              const techPhone = getTechPhone(item);
              const techObj = item.technicianId || item.technician || {};

              return (
                <Tr
                  key={id}
                  _hover={{ bg: isDark ? "gray.750" : "gray.50" }}
                  transition="background 0.15s ease"
                >
                  {/* Withdrawal ID */}
                  <Td fontWeight="600" fontFamily="mono" fontSize="xs">
                    <HStack spacing={1}>
                      <Text
                        as="span"
                        color="teal.600"
                        cursor="pointer"
                        _hover={{ textDecoration: "underline" }}
                        onClick={() => onViewDetails && onViewDetails(item)}
                      >
                        #{id.length > 8 ? `${id.slice(0, 8)}...` : id}
                      </Text>
                      <Tooltip label="Copy ID" hasArrow placement="top">
                        <IconButton
                          aria-label="Copy ID"
                          icon={<FaCopy />}
                          size="2xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(id, "Withdrawal ID")}
                        />
                      </Tooltip>
                    </HStack>
                    {item.origin === "admin_direct" && (
                      <Badge colorScheme="purple" fontSize="3xs" mt={0.5}>
                        ADMIN DIRECT
                      </Badge>
                    )}
                  </Td>

                  {/* Technician */}
                  <Td>
                    <Text fontSize="xs" fontWeight="700">
                      {techName}
                    </Text>
                    {techPhone && (
                      <Text fontSize="3xs" color="gray.500">
                        {techPhone}
                      </Text>
                    )}
                    {techObj.payoutBlocked && (
                      <Badge colorScheme="red" fontSize="3xs">
                        FROZEN
                      </Badge>
                    )}
                  </Td>

                  {/* Requested Date */}
                  <Td fontSize="xs" color="gray.600" whiteSpace="nowrap">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }) : "N/A"}
                  </Td>

                  {/* Gross Amount */}
                  <Td fontSize="xs" fontWeight="600" isNumeric>
                    {formatInr(grossPaise)}
                  </Td>

                  {/* Deductions */}
                  <Td fontSize="xs" color={totalDeductionsPaise > 0 ? "red.500" : "gray.400"} isNumeric>
                    {totalDeductionsPaise > 0 ? `-${formatInr(totalDeductionsPaise)}` : "—"}
                  </Td>

                  {/* Net Payable */}
                  <Td fontSize="xs" fontWeight="800" color="teal.700" isNumeric>
                    <Badge colorScheme="teal" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="md">
                      {formatInr(netPaise)}
                    </Badge>
                  </Td>

                  {/* Payout Mode */}
                  <Td fontSize="2xs">
                    <Badge variant="outline" colorScheme="gray" fontSize="3xs">
                      {item.payoutMode || "NEFT"}
                    </Badge>
                  </Td>

                  {/* Status Badge */}
                  <Td>
                    <PayoutStatusBadge status={status} size="sm" />
                  </Td>

                  {/* Bank Ref / UTR */}
                  <Td fontSize="xs" fontFamily="mono">
                    {item.utr ? (
                      <HStack spacing={1}>
                        <Text color="green.700" fontWeight="700">
                          {item.utr.length > 12 ? `${item.utr.slice(0, 12)}...` : item.utr}
                        </Text>
                        <Tooltip label="Copy UTR" hasArrow placement="top">
                          <IconButton
                            aria-label="Copy UTR"
                            icon={<FaCopy />}
                            size="2xs"
                            variant="ghost"
                            onClick={() => copyToClipboard(item.utr, "UTR")}
                          />
                        </Tooltip>
                      </HStack>
                    ) : status === "approved" ? (
                      <Text fontSize="3xs" color="blue.600" fontWeight="600">
                        Awaiting transfer
                      </Text>
                    ) : (
                      <Text fontSize="3xs" color="gray.400">
                        —
                      </Text>
                    )}
                  </Td>

                  {/* Actions Menu */}
                  <Td textAlign="center">
                    <Menu placement="bottom-end">
                      <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        size="xs"
                        aria-label="Actions"
                      />
                      <MenuList fontSize="xs" shadow="lg" borderRadius="10px" py={1}>
                        <MenuItem icon={<FaEye />} onClick={() => onViewDetails && onViewDetails(item)}>
                          View Details Drawer
                        </MenuItem>
                        {status === "paid" && (
                          <MenuItem
                            icon={<FaFileInvoice color="teal" />}
                            onClick={() => onViewReceipt && onViewReceipt(item)}
                          >
                            View Official Receipt
                          </MenuItem>
                        )}
                        {status === "approved" && (
                          <MenuItem
                            icon={<FaFileInvoice color="blue" />}
                            onClick={() => onViewReceipt && onViewReceipt(item)}
                          >
                            View Approval Summary
                          </MenuItem>
                        )}

                        {/* Approved -> Record Bank Transfer */}
                        {status === "approved" && (
                          <MenuItem
                            icon={<FaMoneyCheckAlt color="teal" />}
                            color="teal.700"
                            fontWeight="700"
                            onClick={() => onRecordTransfer && onRecordTransfer(item)}
                          >
                            Record Bank Transfer (Mark Paid)
                          </MenuItem>
                        )}

                        {/* Pending / Requested -> Approve */}
                        {(status === "pending" || status === "requested") && (
                          <MenuItem
                            icon={<FaCheck color="green" />}
                            color="green.700"
                            fontWeight="600"
                            onClick={() => onApprove && onApprove(item)}
                          >
                            Approve Withdrawal
                          </MenuItem>
                        )}

                        {/* Pending / Requested / Approved -> Reject */}
                        {(status === "pending" || status === "requested" || status === "approved") && (
                          <MenuItem
                            icon={<FaTimes color="red" />}
                            color="red.600"
                            onClick={() => onReject && onReject(item)}
                          >
                            Reject Withdrawal
                          </MenuItem>
                        )}

                        {/* Manual Review -> Resolve */}
                        {status === "manual_review" && (
                          <MenuItem
                            icon={<FaExclamationCircle color="purple" />}
                            color="purple.700"
                            fontWeight="600"
                            onClick={() => onResolveReview && onResolveReview(item)}
                          >
                            Resolve Manual Review
                          </MenuItem>
                        )}

                        {/* Paid -> Revert (Owner only) */}
                        {status === "paid" && isOwner && (
                          <>
                            <MenuDivider />
                            <MenuItem
                              icon={<FaUndo color="red" />}
                              color="red.700"
                              fontWeight="700"
                              onClick={() => onRevert && onRevert(item)}
                            >
                              Revert Recorded Payment (Owner)
                            </MenuItem>
                          </>
                        )}

                        {/* Freeze/Unfreeze Technician Payouts */}
                        {techObj._id && (
                          <>
                            <MenuDivider />
                            <MenuItem
                              icon={<FaLock color={techObj.payoutBlocked ? "green" : "red"} />}
                              onClick={() => onFreezeTechnician && onFreezeTechnician(techObj)}
                            >
                              {techObj.payoutBlocked ? "Unfreeze Technician Payouts" : "Freeze Technician Payouts"}
                            </MenuItem>
                          </>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>

      {/* Pagination Footer */}
      {!loading && withdrawals.length > 0 && (
        <Flex
          px={6}
          py={3}
          align="center"
          justify="space-between"
          borderTop="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.800" : "gray.50"}
          flexWrap="wrap"
          gap={3}
        >
          <HStack spacing={2} fontSize="xs" color="gray.500">
            <Text>
              Showing {withdrawals.length} of {total.toLocaleString()} total withdrawals
            </Text>
            <Text>•</Text>
            <HStack spacing={1}>
              <Text>Rows per page:</Text>
              <Select
                size="xs"
                w="65px"
                borderRadius="6px"
                value={limit}
                onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </HStack>
          </HStack>

          <HStack spacing={2}>
            <Button
              size="xs"
              variant="outline"
              isDisabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Text fontSize="xs" fontWeight="600" px={2}>
              Page {page} of {totalPages || 1}
            </Text>
            <Button
              size="xs"
              variant="outline"
              isDisabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
}
