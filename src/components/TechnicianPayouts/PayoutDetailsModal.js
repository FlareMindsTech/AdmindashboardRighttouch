import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  Icon,
  Button,
  Center,
  Spinner,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import {
  FaFileInvoice,
  FaCheckCircle,
  FaLock,
  FaRobot,
} from "react-icons/fa";

export default function PayoutDetailsModal({
  isOpen,
  onClose,
  selectedDetailsWd,
  detailsLoading,
  formatId,
  formatTechName,
  formatTechPhone,
  getTechId,
  getPayoutOrigin,
  brandColor = "#008080",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="20px" boxShadow="2xl">
        <ModalHeader bg="teal.800" color="white" borderTopRadius="20px" p="16px 24px">
          <Flex justify="space-between" align="center" pr="20px">
            <HStack spacing="10px">
              <Icon as={FaFileInvoice} boxSize={5} color="teal.200" />
              <Box>
                <Text fontSize="md" fontWeight="bold">Payout Itemized Details</Text>
                <Text fontSize="2xs" color="teal.100" fontFamily="mono">
                  {formatId ? formatId(selectedDetailsWd) : selectedDetailsWd?._id}
                </Text>
              </Box>
            </HStack>
            <Badge colorScheme={selectedDetailsWd?.status === "paid" ? "green" : "orange"} px="10px" py="4px" borderRadius="full">
              {selectedDetailsWd?.status?.toUpperCase()}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton color="white" top="18px" right="20px" />
        <ModalBody p="24px">
          {detailsLoading ? (
            <Center p="40px"><Spinner color={brandColor} /></Center>
          ) : (
            <VStack spacing="20px" align="stretch">
              {/* Technician Profile Card */}
              <Box bg="gray.50" p="14px" borderRadius="14px" border="1px solid" borderColor="gray.200">
                <Text fontSize="2xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb="8px">Technician Information</Text>
                <SimpleGrid columns={2} spacing="10px" fontSize="xs">
                  <Box><Text color="gray.500">Name:</Text><Text fontWeight="bold">{formatTechName ? formatTechName(selectedDetailsWd) : "N/A"}</Text></Box>
                  <Box><Text color="gray.500">Phone:</Text><Text fontWeight="bold">{formatTechPhone ? formatTechPhone(selectedDetailsWd) : "N/A"}</Text></Box>
                  <Box><Text color="gray.500">Technician ID:</Text><Text fontWeight="bold" fontFamily="mono">{getTechId ? getTechId(selectedDetailsWd) : "N/A"}</Text></Box>
                  <Box><Text color="gray.500">Origin:</Text><Badge colorScheme="purple">{getPayoutOrigin ? getPayoutOrigin(selectedDetailsWd) : "N/A"}</Badge></Box>
                </SimpleGrid>
              </Box>

              {/* Itemized Financial Breakdown */}
              <Box bg="teal.50" p="16px" borderRadius="14px" border="1px solid" borderColor="teal.200">
                <Text fontSize="2xs" fontWeight="bold" color="teal.900" textTransform="uppercase" mb="10px">Financial Breakdown</Text>
                <VStack spacing="6px" align="stretch" fontSize="xs">
                  <Flex justify="space-between"><Text color="gray.600">Requested Amount:</Text><Text fontWeight="bold">₹{(selectedDetailsWd?.amount || 0).toLocaleString("en-IN")}</Text></Flex>
                  <Flex justify="space-between" color="purple.700"><Text>- Platform Commission Cut:</Text><Text fontWeight="bold">₹{(selectedDetailsWd?.commissionAmount || 0).toLocaleString("en-IN")}</Text></Flex>
                  <Flex justify="space-between" color="red.600"><Text>- Admin Penalty Deductions:</Text><Text fontWeight="bold">₹{(selectedDetailsWd?.penaltyAmount || 0).toLocaleString("en-IN")}</Text></Flex>
                  {selectedDetailsWd?.penaltyReason && <Text fontSize="3xs" color="red.600" pl="10px">Reason: {selectedDetailsWd.penaltyReason}</Text>}
                  <Flex justify="space-between" color="orange.600"><Text>- Other Deductions:</Text><Text fontWeight="bold">₹{(selectedDetailsWd?.otherDeductions || 0).toLocaleString("en-IN")}</Text></Flex>
                  <Divider my="6px" borderColor="teal.300" />
                  <Flex justify="space-between" fontSize="sm">
                    <Text fontWeight="bold" color="teal.900">Net Dispatched Payout Amount:</Text>
                    <Text fontWeight="extrabold" color="teal.800">
                      ₹{(selectedDetailsWd?.netPayoutAmountPaise ? selectedDetailsWd.netPayoutAmountPaise / 100 : (selectedDetailsWd?.amount || 0)).toLocaleString("en-IN")}
                    </Text>
                  </Flex>
                </VStack>
              </Box>

              {/* Bank Settlement Reference Info */}
              <Box bg="blue.50" p="14px" borderRadius="14px" border="1px solid" borderColor="blue.200">
                <Text fontSize="2xs" fontWeight="bold" color="blue.900" textTransform="uppercase" mb="8px">Banking Settlement Details</Text>
                <SimpleGrid columns={2} spacing="10px" fontSize="xs">
                  <Box><Text color="gray.500">Payout Mode:</Text><Text fontWeight="bold">{selectedDetailsWd?.payoutMode || "Bank Transfer"}</Text></Box>
                  <Box><Text color="gray.500">Destination Account:</Text><Text fontWeight="bold" fontFamily="mono">{selectedDetailsWd?.payoutDestination ? `****${String(selectedDetailsWd.payoutDestination).slice(-4)}` : "Registered Bank Account"}</Text></Box>
                  <Box><Text color="gray.500">Bank UTR / Reference:</Text><Text fontWeight="bold" fontFamily="mono" color={selectedDetailsWd?.utr ? "green.700" : "gray.500"}>{selectedDetailsWd?.utr || "Pending Bank Transfer"}</Text></Box>
                  <Box><Text color="gray.500">Client Idempotency Key:</Text><Text fontWeight="bold" fontFamily="mono">{selectedDetailsWd?.clientIdempotencyKey || "N/A"}</Text></Box>
                </SimpleGrid>
              </Box>

              {/* Step-by-Step Audit Timeline */}
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.700" mb="12px">Step-by-Step Audit Timeline</Text>
                <VStack spacing="10px" align="stretch" pl="10px" borderLeft="2px solid" borderColor="teal.300">
                  <HStack spacing="10px">
                    <Icon as={FaCheckCircle} color="teal.500" boxSize={3.5} />
                    <Box fontSize="2xs">
                      <Text fontWeight="bold">Withdrawal Request Created</Text>
                      <Text color="gray.500">{new Date(selectedDetailsWd?.createdAt || Date.now()).toLocaleString()}</Text>
                    </Box>
                  </HStack>
                  <HStack spacing="10px">
                    <Icon as={FaLock} color="purple.500" boxSize={3.5} />
                    <Box fontSize="2xs">
                      <Text fontWeight="bold">Technician Wallet Funds Reserved</Text>
                      <Text color="gray.500">Active hold in wallet ledger</Text>
                    </Box>
                  </HStack>
                  {["approved", "paid"].includes(selectedDetailsWd?.status) && (
                    <HStack spacing="10px">
                      <Icon as={FaCheckCircle} color="blue.500" boxSize={3.5} />
                      <Box fontSize="2xs">
                        <Text fontWeight="bold" color="blue.700">Administrator Approval Granted</Text>
                        <Text color="gray.500">Authorized for manual bank disbursement</Text>
                      </Box>
                    </HStack>
                  )}
                  {selectedDetailsWd?.status === "paid" && (
                    <HStack spacing="10px">
                      <Icon as={FaCheckCircle} color="green.500" boxSize={3.5} />
                      <Box fontSize="2xs">
                        <Text fontWeight="bold" color="green.700">Bank Transfer Executed & UTR Recorded</Text>
                        <Text color="gray.500">UTR: {selectedDetailsWd.utr || "Recorded"}</Text>
                      </Box>
                    </HStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.100">
          <Button size="sm" colorScheme="teal" onClick={onClose}>Close Details</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
