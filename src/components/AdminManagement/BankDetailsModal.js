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
  Heading,
  Text,
  Button,
  VStack,
  Icon,
  Badge,
  SimpleGrid,
  Textarea,
  HStack,
} from "@chakra-ui/react";
import {
  FaEdit,
  FaCheckCircle,
  FaUniversity,
} from "react-icons/fa";

export default function BankDetailsModal({
  isOpen,
  onClose,
  selectedTechForBank,
  allKycRecords,
  onOpenEditBank,
  showBankRejection,
  setShowBankRejection,
  bankRejectionReason,
  setBankRejectionReason,
  onVerifyBankAction,
  loading,
  isTechnicianBankVerified,
  findKYCRecord,
  getTechnicianName,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="16px">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100">
          <Flex justify="space-between" align="center" pr={6}>
            <Box>
              <Heading size="sm">Gate 3: Bank & Payout Verification</Heading>
              <Text fontSize="xs" color="gray.500" mt={0.5}>
                Technician: {getTechnicianName(selectedTechForBank, allKycRecords)}
              </Text>
            </Box>
            <Button
              size="xs"
              variant="outline"
              colorScheme="teal"
              leftIcon={<FaEdit />}
              onClick={onOpenEditBank}
            >
              Edit Bank Details
            </Button>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4}>
          {selectedTechForBank && (
            <VStack spacing={4} align="stretch">
              {/* Bank status banner */}
              {(() => {
                const isBankVer = isTechnicianBankVerified(selectedTechForBank, allKycRecords);
                const kycMatch = findKYCRecord(selectedTechForBank, allKycRecords);
                const bankDetails = kycMatch?.bankDetails;

                return (
                  <>
                    <Flex
                      p={3}
                      borderRadius="8px"
                      align="center"
                      justify="space-between"
                      bg={isBankVer ? "green.50" : bankDetails ? "orange.50" : "gray.50"}
                      border="1px solid"
                      borderColor={isBankVer ? "green.300" : bankDetails ? "orange.200" : "gray.200"}
                    >
                      <Box>
                        <Flex align="center" gap={2}>
                          <Icon
                            as={isBankVer ? FaCheckCircle : FaUniversity}
                            color={isBankVer ? "green.600" : "orange.500"}
                            boxSize="18px"
                          />
                          <Text fontSize="sm" fontWeight="bold" color="gray.800">
                            {isBankVer
                              ? "Already Verified (Payouts Enabled)"
                              : bankDetails
                              ? "Bank Details Pending Verification"
                              : "No Bank Details Added"}
                          </Text>
                        </Flex>
                        <Badge colorScheme={isBankVer ? "green" : bankDetails ? "orange" : "gray"} mt={1}>
                          {isBankVer ? "ALREADY VERIFIED (PAYOUTS ACTIVE)" : bankDetails ? "PENDING REVIEW" : "NO BANK ADDED"}
                        </Badge>
                      </Box>
                    </Flex>

                    {bankDetails ? (
                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} p={3} border="1px solid #eee" borderRadius="10px">
                        <Box>
                          <Text fontSize="10px" color="gray.400" textTransform="uppercase">Account Holder</Text>
                          <Text fontSize="sm" fontWeight="bold">{bankDetails.accountHolderName || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="10px" color="gray.400" textTransform="uppercase">Bank Name</Text>
                          <Text fontSize="sm" fontWeight="bold">{bankDetails.bankName || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="10px" color="gray.400" textTransform="uppercase">Account Number</Text>
                          <Text fontSize="sm" fontWeight="bold" fontFamily="monospace">{bankDetails.accountNumber || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="10px" color="gray.400" textTransform="uppercase">IFSC Code</Text>
                          <Text fontSize="sm" fontWeight="bold" fontFamily="monospace">{bankDetails.ifscCode || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="10px" color="gray.400" textTransform="uppercase">Branch</Text>
                          <Text fontSize="sm">{bankDetails.branchName || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="10px" color="gray.400" textTransform="uppercase">UPI ID</Text>
                          <Text fontSize="sm" fontWeight="semibold" color="teal.600">{bankDetails.upiId || "N/A"}</Text>
                        </Box>
                      </SimpleGrid>
                    ) : (
                      <Text textAlign="center" py={6} color="gray.400" fontStyle="italic">
                        No bank details submitted yet by this technician.
                      </Text>
                    )}

                    {showBankRejection && (
                      <Box p={3} border="1px solid" borderColor="red.300" borderRadius="8px" bg="red.50">
                        <Text fontSize="xs" fontWeight="bold" color="red.700" mb={1}>
                          Bank Rejection Reason:
                        </Text>
                        <Textarea
                          size="sm"
                          bg="white"
                          placeholder="State reason for bank detail rejection..."
                          value={bankRejectionReason}
                          onChange={(e) => setBankRejectionReason(e.target.value)}
                        />
                      </Box>
                    )}
                  </>
                );
              })()}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.100" bg="gray.50">
          <HStack spacing={2} justify="flex-end" w="100%">
            {!showBankRejection ? (
              <>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => setShowBankRejection(true)}
                >
                  Reject Bank
                </Button>
                {(() => {
                  const isBankVer = isTechnicianBankVerified(selectedTechForBank, allKycRecords);
                  return (
                    <Button
                      size="sm"
                      colorScheme={isBankVer ? "teal" : "green"}
                      leftIcon={<FaCheckCircle />}
                      onClick={() => onVerifyBankAction(true)}
                      isLoading={loading}
                    >
                      {isBankVer ? "Already Verified ✓" : "Verify Bank (Enable Payouts)"}
                    </Button>
                  );
                })()}
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setShowBankRejection(false)}>
                  Cancel
                </Button>
                <Button size="sm" colorScheme="red" onClick={() => onVerifyBankAction(false)}>
                  Confirm Rejection
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
