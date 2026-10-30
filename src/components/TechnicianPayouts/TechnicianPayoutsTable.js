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
  Button,
  Skeleton,
  Center,
  Icon,
  Tooltip,
  useToast,
  useColorMode,
  Flex,
  Select,
  Avatar,
} from "@chakra-ui/react";
import {
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaMoneyCheckAlt,
  FaEye,
  FaFileInvoice,
  FaCopy,
  FaExclamationCircle,
  FaUniversity,
  FaMobileAlt,
} from "react-icons/fa";
import PayoutStatusBadge from "./PayoutStatusBadge";
import { formatInr } from "./FinancialBreakdown";

export default function TechnicianPayoutsTable({
  withdrawals = [],
  loading = false,
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
  onRetry,
}) {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const copyToClipboard = (text, label) => {
    if (!text) return;
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

  const getBankDetails = (item) => {
    return (
      item?.bankDetails ||
      item?.technician?.bankDetails ||
      item?.technicianId?.bankDetails ||
      {}
    );
  };

  return (
    <Box
      overflowX="auto"
      borderRadius="16px"
      border="1px solid"
      borderColor={isDark ? "gray.700" : "gray.200"}
      boxShadow="sm"
    >
      <Table variant="simple" size="sm" bg={isDark ? "gray.850" : "white"}>
        <Thead bg={isDark ? "gray.800" : "gray.50"}>
          <Tr>
            <Th py={4} fontSize="3xs" textTransform="uppercase" letterSpacing="0.06em">
              Withdrawal Info
            </Th>
            <Th py={4} fontSize="3xs" textTransform="uppercase" letterSpacing="0.06em">
              Technician
            </Th>
            <Th py={4} fontSize="3xs" textTransform="uppercase" letterSpacing="0.06em">
              Net Payable
            </Th>
            <Th py={4} fontSize="3xs" textTransform="uppercase" letterSpacing="0.06em">
              Beneficiary Bank / Account
            </Th>
            <Th py={4} fontSize="3xs" textTransform="uppercase" letterSpacing="0.06em">
              Status & UTR
            </Th>
            <Th py={4} fontSize="3xs" textTransform="uppercase" letterSpacing="0.06em" textAlign="center">
              Quick Actions
            </Th>
          </Tr>
        </Thead>

        <Tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Tr key={i}>
                <Td colSpan={6} py={4}>
                  <Skeleton height="36px" borderRadius="8px" />
                </Td>
              </Tr>
            ))
          ) : withdrawals.length === 0 ? (
            <Tr>
              <Td colSpan={6} py={14} textAlign="center">
                <Center>
                  <VStack spacing={3}>
                    <Icon as={FaExclamationCircle} boxSize={10} color="gray.300" />
                    <Text fontSize="md" fontWeight="700" color="gray.600">
                      No withdrawal requests found
                    </Text>
                    <Text fontSize="xs" color="gray.400" maxW="360px">
                      No records match the current tab and filter criteria. Try clearing search filters or selecting another tab.
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
              const bank = getBankDetails(item);
              const rawAcc = String(bank?.accountNumber || item?.payoutDestination || "").replace(/\s/g, "");
              const maskedAcc = rawAcc.length >= 4 ? `••••${rawAcc.slice(-4)}` : rawAcc || "—";
              const bankName = bank?.bankName || "Bank Account";
              const ifscCode = bank?.ifscCode || "";
              const upiId = bank?.upiId || "";

              return (
                <Tr
                  key={id}
                  _hover={{ bg: isDark ? "gray.750" : "teal.50", transition: "background 0.15s ease" }}
                  transition="background 0.15s ease"
                >
                  {/* Withdrawal Info */}
                  <Td py={3}>
                    <VStack align="flex-start" spacing={1}>
                      <HStack spacing={1}>
                        <Text
                          fontSize="xs"
                          fontWeight="700"
                          fontFamily="mono"
                          color="teal.600"
                          cursor="pointer"
                          _hover={{ textDecoration: "underline", color: "teal.800" }}
                          onClick={() => onViewDetails && onViewDetails(item)}
                        >
                          #{id.length > 8 ? id.slice(-8) : id}
                        </Text>
                        <Tooltip label="Copy Withdrawal ID" hasArrow placement="top">
                          <IconButton
                            aria-label="Copy ID"
                            icon={<FaCopy />}
                            size="2xs"
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: "teal.600" }}
                            onClick={() => copyToClipboard(id, "Withdrawal ID")}
                          />
                        </Tooltip>
                      </HStack>

                      <HStack spacing={1.5}>
                        <Badge
                          fontSize="3xs"
                          px={1.5}
                          py={0.5}
                          borderRadius="4px"
                          colorScheme={item.origin === "admin_direct" ? "purple" : "gray"}
                        >
                          {item.origin === "admin_direct" ? "DIRECT DISPATCH" : "REQUESTED"}
                        </Badge>
                        <Text fontSize="3xs" color="gray.500" whiteSpace="nowrap">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </Text>
                      </HStack>
                    </VStack>
                  </Td>

                  {/* Technician */}
                  <Td py={3}>
                    <HStack spacing={2.5}>
                      <Avatar
                        size="sm"
                        name={techName}
                        bg="teal.600"
                        color="white"
                        fontWeight="700"
                        fontSize="xs"
                      />
                      <Box>
                        <HStack spacing={1.5}>
                          <Text fontSize="xs" fontWeight="700" color={isDark ? "white" : "gray.800"} noOfLines={1}>
                            {techName}
                          </Text>
                          {techObj.payoutBlocked && (
                            <Badge colorScheme="red" fontSize="3xs" px={1} borderRadius="3px">
                              FROZEN
                            </Badge>
                          )}
                        </HStack>
                        {techPhone && (
                          <HStack spacing={1} color="gray.500" fontSize="3xs">
                            <Icon as={FaMobileAlt} boxSize={2.5} />
                            <Text>{techPhone}</Text>
                            <Tooltip label="Copy Phone Number" hasArrow>
                              <IconButton
                                size="2xs"
                                icon={<FaCopy />}
                                variant="ghost"
                                boxSize="14px"
                                minW="14px"
                                onClick={() => copyToClipboard(techPhone, "Mobile Number")}
                              />
                            </Tooltip>
                          </HStack>
                        )}
                      </Box>
                    </HStack>
                  </Td>

                  {/* Net Payable */}
                  <Td py={3}>
                    <VStack align="flex-start" spacing={0.5}>
                      <Badge
                        colorScheme="teal"
                        variant="solid"
                        bg="teal.600"
                        fontSize="xs"
                        fontWeight="800"
                        px={2.5}
                        py={0.5}
                        borderRadius="6px"
                        boxShadow="0 1px 3px rgba(0, 128, 128, 0.25)"
                      >
                        {formatInr(netPaise)}
                      </Badge>
                      <HStack spacing={1.5} fontSize="3xs" color="gray.500">
                        <Text>Gross: {formatInr(grossPaise)}</Text>
                        {totalDeductionsPaise > 0 && (
                          <Text color="red.500" fontWeight="600">
                            • Ded: -{formatInr(totalDeductionsPaise)}
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </Td>

                  {/* Beneficiary Bank / Account */}
                  <Td py={3}>
                    <VStack align="flex-start" spacing={0.5}>
                      <HStack spacing={1.5}>
                        <Icon as={FaUniversity} boxSize={3} color="blue.500" />
                        <Text fontSize="xs" fontWeight="700" color={isDark ? "gray.200" : "gray.800"} noOfLines={1}>
                          {bankName}
                        </Text>
                        <Badge variant="outline" colorScheme="blue" fontSize="3xs" px={1} py={0} borderRadius="3px">
                          {item.payoutMode || "NEFT"}
                        </Badge>
                      </HStack>

                      <HStack spacing={1.5} fontSize="3xs">
                        <Text fontFamily="mono" color="gray.600" fontWeight="600">
                          {maskedAcc}
                        </Text>
                        {ifscCode && (
                          <Text fontFamily="mono" color="gray.400">
                            ({ifscCode})
                          </Text>
                        )}
                        {rawAcc && (
                          <Tooltip label="Copy Account Number" hasArrow>
                            <IconButton
                              size="2xs"
                              icon={<FaCopy />}
                              variant="ghost"
                              boxSize="14px"
                              minW="14px"
                              onClick={() => copyToClipboard(rawAcc, "Account Number")}
                            />
                          </Tooltip>
                        )}
                      </HStack>

                      {upiId && (
                        <Text fontSize="3xs" color="purple.600" fontFamily="mono" noOfLines={1}>
                          UPI: {upiId}
                        </Text>
                      )}
                    </VStack>
                  </Td>

                  {/* Status & UTR */}
                  <Td py={3}>
                    <VStack align="flex-start" spacing={1}>
                      <PayoutStatusBadge status={status} size="sm" />
                      {item.utr ? (
                        <HStack spacing={1}>
                          <Text fontSize="3xs" fontFamily="mono" color="green.700" fontWeight="700">
                            UTR: {item.utr.length > 14 ? `${item.utr.slice(0, 14)}...` : item.utr}
                          </Text>
                          <Tooltip label="Copy Bank UTR" hasArrow placement="top">
                            <IconButton
                              aria-label="Copy UTR"
                              icon={<FaCopy />}
                              size="2xs"
                              variant="ghost"
                              boxSize="14px"
                              minW="14px"
                              color="green.600"
                              onClick={() => copyToClipboard(item.utr, "Bank UTR")}
                            />
                          </Tooltip>
                        </HStack>
                      ) : status === "approved" ? (
                        <Badge colorScheme="blue" variant="subtle" fontSize="3xs" px={1.5} py={0.5} borderRadius="4px">
                          Ready for Bank Transfer
                        </Badge>
                      ) : null}
                    </VStack>
                  </Td>

                  {/* Quick Action Buttons */}
                  <Td py={3} textAlign="center">
                    <HStack spacing={1.5} justify="center">
                      {/* Approved -> Direct Pay / Transfer Button */}
                      {status === "approved" && (
                        <Button
                          size="xs"
                          colorScheme="teal"
                          bg="teal.600"
                          _hover={{ bg: "teal.700", transform: "translateY(-1px)" }}
                          _active={{ bg: "teal.800" }}
                          leftIcon={<FaMoneyCheckAlt />}
                          fontWeight="bold"
                          borderRadius="8px"
                          boxShadow="0 2px 6px rgba(0, 128, 128, 0.3)"
                          onClick={() => onRecordTransfer && onRecordTransfer(item)}
                        >
                          Pay / Transfer
                        </Button>
                      )}

                      {/* Requested or Pending -> Direct Approve Button & Reject */}
                      {(status === "pending" || status === "requested") && (
                        <>
                          <Button
                            size="xs"
                            colorScheme="green"
                            bg="green.600"
                            _hover={{ bg: "green.700", transform: "translateY(-1px)" }}
                            _active={{ bg: "green.800" }}
                            leftIcon={<FaCheck />}
                            fontWeight="bold"
                            borderRadius="8px"
                            boxShadow="0 2px 6px rgba(16, 185, 129, 0.3)"
                            onClick={() => onApprove && onApprove(item)}
                          >
                            Approve
                          </Button>
                          <Tooltip label="Reject Request" hasArrow>
                            <IconButton
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                              borderColor="red.200"
                              _hover={{ bg: "red.50" }}
                              icon={<FaTimes />}
                              aria-label="Reject Request"
                              borderRadius="8px"
                              onClick={() => onReject && onReject(item)}
                            />
                          </Tooltip>
                        </>
                      )}

                      {/* Paid -> Quick Receipt Button */}
                      {status === "paid" && (
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="teal"
                          borderColor="teal.300"
                          _hover={{ bg: "teal.50" }}
                          leftIcon={<FaFileInvoice />}
                          fontWeight="600"
                          borderRadius="8px"
                          onClick={() => onViewReceipt && onViewReceipt(item)}
                        >
                          Receipt
                        </Button>
                      )}

                      {/* Secondary Options Menu */}
                      <Menu placement="bottom-end">
                        <Tooltip label="More Options" hasArrow>
                          <MenuButton
                            as={IconButton}
                            icon={<FaEllipsisV />}
                            variant="ghost"
                            size="xs"
                            borderRadius="8px"
                            aria-label="More Options"
                          />
                        </Tooltip>
                        <MenuList fontSize="xs" shadow="xl" borderRadius="12px" py={1} minW="180px">
                          <MenuItem icon={<FaEye />} onClick={() => onViewDetails && onViewDetails(item)}>
                            View Full Details Drawer
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
                              icon={<FaMoneyCheckAlt color="teal" />}
                              color="teal.700"
                              fontWeight="700"
                              onClick={() => onRecordTransfer && onRecordTransfer(item)}
                            >
                              Record Bank Transfer (Mark Paid)
                            </MenuItem>
                          )}
                          {(status === "pending" || status === "requested") && (
                            <MenuItem
                              icon={<FaCheck color="green" />}
                              color="green.700"
                              fontWeight="600"
                              onClick={() => onApprove && onApprove(item)}
                            >
                              Approve Request
                            </MenuItem>
                          )}
                          {(status === "pending" || status === "requested") && (
                            <MenuItem
                              icon={<FaTimes color="red" />}
                              color="red.600"
                              onClick={() => onReject && onReject(item)}
                            >
                              Reject Request
                            </MenuItem>
                          )}
                          <MenuItem icon={<FaCopy />} onClick={() => copyToClipboard(id, "Withdrawal ID")}>
                            Copy Withdrawal ID
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>

      {/* Pagination Bar */}
      {total > 0 && (
        <Flex
          px={5}
          py={3.5}
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
              Showing <strong>{withdrawals.length}</strong> of <strong>{total.toLocaleString()}</strong> total withdrawals
            </Text>
            <Text>•</Text>
            <HStack spacing={1}>
              <Text>Rows per page:</Text>
              <Select
                size="xs"
                w="68px"
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
            <Text fontSize="xs" fontWeight="700" px={2} color={isDark ? "white" : "gray.700"}>
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
