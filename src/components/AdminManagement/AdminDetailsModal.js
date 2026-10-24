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
  Badge,
  Button,
  Avatar,
  SimpleGrid,
  VStack,
  HStack,
  Link,
} from "@chakra-ui/react";
import {
  FaUserGraduate,
  FaIdCard,
  FaUniversity,
} from "react-icons/fa";

export default function AdminDetailsModal({
  isOpen,
  onClose,
  selectedTechnician,
  allKycRecords,
  onToggleTraining,
  onOpenKYCModal,
  onOpenBankModal,
  loading,
  customColor = "#008080",
  getTechnicianName,
  getTechnicianImage,
  isTechnicianKYCVerified,
  isTechnicianBankVerified,
  findKYCRecord,
  getTechnicianPhone,
  getTechnicianEmail,
  getTechnicianDistrict,
  getTechnicianAddress,
  getTechnicianSpecialization,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="16px">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100">
          Technician Complete Profile
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={4}>
          {selectedTechnician && (
            <VStack spacing={4} align="stretch">
              {/* Header info */}
              <Flex align="center" gap={4} p={3.5} bg="gray.50" borderRadius="12px" border="1px solid" borderColor="gray.100">
                <Avatar
                  size="lg"
                  name={getTechnicianName(selectedTechnician, allKycRecords)}
                  src={getTechnicianImage(selectedTechnician, allKycRecords)}
                  border="2px solid"
                  borderColor={customColor}
                />
                <Box flex="1">
                  <Flex align="center" justify="space-between" flexWrap="wrap" gap={2}>
                    <Heading size="md" color="gray.800">
                      {getTechnicianName(selectedTechnician, allKycRecords)}
                    </Heading>
                    {selectedTechnician.availability?.isOnline !== undefined && (
                      <Badge
                        colorScheme={selectedTechnician.availability?.isOnline ? "green" : "gray"}
                        variant="subtle"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontSize="xs"
                      >
                        ● {selectedTechnician.availability?.isOnline ? "Online" : "Offline"}
                      </Badge>
                    )}
                  </Flex>
                  <Flex gap={2} mt={1.5} flexWrap="wrap">
                    <Badge colorScheme={selectedTechnician.workStatus === "approved" ? "green" : "orange"} px={2} py={0.5} borderRadius="md">
                      Work: {selectedTechnician.workStatus || "pending"}
                    </Badge>
                    <Badge colorScheme={selectedTechnician.trainingCompleted ? "green" : "orange"} px={2} py={0.5} borderRadius="md">
                      Training: {selectedTechnician.trainingCompleted ? "Completed" : "Pending"}
                    </Badge>
                    <Badge
                      colorScheme={
                        isTechnicianKYCVerified(selectedTechnician, allKycRecords) ? "green" : "purple"
                      }
                      px={2}
                      py={0.5}
                      borderRadius="md"
                    >
                      KYC: {isTechnicianKYCVerified(selectedTechnician, allKycRecords) ? "Verified" : "Pending"}
                    </Badge>
                    {isTechnicianBankVerified(selectedTechnician, allKycRecords) && (
                      <Badge colorScheme="teal" px={2} py={0.5} borderRadius="md">
                        Bank: Verified
                      </Badge>
                    )}
                  </Flex>
                </Box>
              </Flex>

              {/* Info Cards */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Box p={3.5} border="1px solid #e2e8f0" borderRadius="10px" bg="white">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2.5} letterSpacing="wider">
                    CONTACT & LOCATION
                  </Text>
                  <VStack align="stretch" spacing={2} fontSize="xs">
                    <Flex justify="space-between" align="center">
                      <Text color="gray.600" fontWeight="medium">Mobile:</Text>
                      {getTechnicianPhone(selectedTechnician, allKycRecords) ? (
                        <Link
                          href={`tel:${getTechnicianPhone(selectedTechnician, allKycRecords)}`}
                          color="teal.600"
                          fontWeight="semibold"
                          _hover={{ textDecoration: "underline" }}
                        >
                          {getTechnicianPhone(selectedTechnician, allKycRecords)}
                        </Link>
                      ) : (
                        <Text color="gray.400" fontStyle="italic">Not Provided</Text>
                      )}
                    </Flex>

                    <Flex justify="space-between" align="center">
                      <Text color="gray.600" fontWeight="medium">Email:</Text>
                      {getTechnicianEmail(selectedTechnician, allKycRecords) ? (
                        <Link
                          href={`mailto:${getTechnicianEmail(selectedTechnician, allKycRecords)}`}
                          color="teal.600"
                          fontWeight="medium"
                          isTruncated
                          maxW="190px"
                          _hover={{ textDecoration: "underline" }}
                          title={getTechnicianEmail(selectedTechnician, allKycRecords)}
                        >
                          {getTechnicianEmail(selectedTechnician, allKycRecords)}
                        </Link>
                      ) : (
                        <Text color="gray.400" fontStyle="italic">Not Provided</Text>
                      )}
                    </Flex>

                    <Flex justify="space-between" align="center">
                      <Text color="gray.600" fontWeight="medium">District (Mandatory):</Text>
                      {getTechnicianDistrict(selectedTechnician) ? (
                        <Badge colorScheme="teal" px={2} py={0.5} borderRadius="md" textTransform="capitalize" fontWeight="bold">
                          📍 {getTechnicianDistrict(selectedTechnician)}
                        </Badge>
                      ) : (
                        <Badge colorScheme="red" px={2} py={0.5} borderRadius="md">
                          ⚠️ District Missing
                      </Badge>
                      )}
                    </Flex>

                    <Flex justify="space-between" align="center">
                      <Text color="gray.600" fontWeight="medium">City / Town:</Text>
                      <Text fontWeight="semibold" color="gray.800" textTransform="capitalize">
                        {selectedTechnician.city || selectedTechnician.profile?.city || selectedTechnician.locality || "N/A"}
                      </Text>
                    </Flex>

                    <Box pt={1} borderTop="1px dashed" borderColor="gray.100">
                      <Text color="gray.600" fontWeight="medium" mb={0.5}>Address:</Text>
                      <Text color="gray.700" lineHeight="short">
                        {getTechnicianAddress(selectedTechnician, allKycRecords)}
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                <Box p={3.5} border="1px solid #e2e8f0" borderRadius="10px" bg="white">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2.5} letterSpacing="wider">
                    PROFESSIONAL STATS
                  </Text>
                  <VStack align="stretch" spacing={2} fontSize="xs">
                    <Flex justify="space-between" align="center">
                      <Text color="gray.600" fontWeight="medium">Specialization:</Text>
                      <Badge colorScheme="blue" px={2} py={0.5} borderRadius="md">
                        {getTechnicianSpecialization(selectedTechnician)}
                      </Badge>
                    </Flex>

                    <Flex justify="space-between" align="center">
                      <Text color="gray.600" fontWeight="medium">Experience:</Text>
                      <Text fontWeight="semibold" color="gray.800">
                        {selectedTechnician.experienceYears || selectedTechnician.profile?.experienceYears || 0} Years
                      </Text>
                    </Flex>

                    <Flex justify="space-between" align="center">
                      <Text color="gray.600" fontWeight="medium">Total Jobs:</Text>
                      <Text fontWeight="bold" color="gray.800">
                        {selectedTechnician.totalJobsCompleted || selectedTechnician.jobStats?.completed || 0}
                      </Text>
                    </Flex>

                    <Flex justify="space-between" align="center">
                      <Text color="gray.600" fontWeight="medium">Rating:</Text>
                      <Text fontWeight="semibold" color="gray.800">
                        ⭐ {selectedTechnician.rating?.avg ? Number(selectedTechnician.rating.avg).toFixed(1) : "0.0"} ({selectedTechnician.rating?.count || 0} reviews)
                      </Text>
                    </Flex>

                    {selectedTechnician.createdAt && (
                      <Flex justify="space-between" align="center" pt={1} borderTop="1px dashed" borderColor="gray.100">
                        <Text color="gray.600" fontWeight="medium">Registered On:</Text>
                        <Text color="gray.700">
                          {new Date(selectedTechnician.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </Text>
                      </Flex>
                    )}
                  </VStack>
                </Box>
              </SimpleGrid>

              {/* KYC Identity Gate 2 Overview if available */}
              {(() => {
                const kycMatch = findKYCRecord(selectedTechnician, allKycRecords);
                if (!kycMatch) return null;
                return (
                  <Box p={3.5} border="1px solid #e2e8f0" borderRadius="10px" bg="white">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="wider">
                        IDENTITY & KYC OVERVIEW
                      </Text>
                      <Badge colorScheme={isTechnicianKYCVerified(selectedTechnician, allKycRecords) ? "green" : "purple"}>
                        {isTechnicianKYCVerified(selectedTechnician, allKycRecords) ? "KYC Approved" : "KYC Pending"}
                      </Badge>
                    </Flex>
                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={2.5} fontSize="xs">
                      <Box>
                        <Text color="gray.500">Aadhaar</Text>
                        <Text fontWeight="semibold" fontFamily="monospace">
                          {kycMatch.aadhaarNumber ? (
                            isTechnicianKYCVerified(selectedTechnician, allKycRecords)
                              ? kycMatch.aadhaarNumber
                              : `•••• •••• ${String(kycMatch.aadhaarNumber).slice(-4)}`
                          ) : (
                            <Text as="span" color="gray.400" fontStyle="italic">Not Uploaded</Text>
                          )}
                        </Text>
                      </Box>
                      <Box>
                        <Text color="gray.500">PAN Card</Text>
                        <Text fontWeight="semibold" fontFamily="monospace">
                          {kycMatch.panNumber || <Text as="span" color="gray.400" fontStyle="italic">Not Uploaded</Text>}
                        </Text>
                      </Box>
                      <Box>
                        <Text color="gray.500">Driving License</Text>
                        <Text fontWeight="semibold" fontFamily="monospace">
                          {kycMatch.drivingLicenseNumber || <Text as="span" color="gray.400" fontStyle="italic">Not Uploaded</Text>}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                );
              })()}

              {/* Bank Details Summary */}
              {(() => {
                const kycMatch = findKYCRecord(selectedTechnician, allKycRecords);
                const b = kycMatch?.bankDetails || selectedTechnician.bankDetails || selectedTechnician.profile?.bankDetails || selectedTechnician.bankAccount;
                return (
                  <Box p={3.5} border="1px solid #e2e8f0" borderRadius="10px" bg="white">
                    <Flex justify="space-between" align="center" mb={2.5}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="wider">
                        PAYOUT BANK ACCOUNT
                      </Text>
                      <Badge colorScheme={isTechnicianBankVerified(selectedTechnician, allKycRecords) ? "green" : "orange"}>
                        {isTechnicianBankVerified(selectedTechnician, allKycRecords) ? "Payouts Enabled" : "Pending Verification"}
                      </Badge>
                    </Flex>
                    {b && (b.accountHolderName || b.accountNumber || b.bankName || b.upiId) ? (
                      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={2.5} fontSize="xs">
                        <Box>
                          <Text color="gray.500">Account Holder</Text>
                          <Text fontWeight="semibold" color="gray.800">{b.accountHolderName || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text color="gray.500">Bank Name</Text>
                          <Text fontWeight="semibold" color="gray.800">{b.bankName || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text color="gray.500">Account Number</Text>
                          <Text fontWeight="semibold" fontFamily="monospace" color="gray.800">{b.accountNumber || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text color="gray.500">IFSC Code</Text>
                          <Text fontWeight="semibold" fontFamily="monospace" color="gray.800">{b.ifscCode || "N/A"}</Text>
                        </Box>
                        <Box gridColumn={{ base: "span 1", sm: "span 2" }}>
                          <Text color="gray.500">UPI ID</Text>
                          <Text fontWeight="semibold" color="gray.800" wordBreak="break-all">{b.upiId || "N/A"}</Text>
                        </Box>
                      </SimpleGrid>
                    ) : (
                      <Text fontSize="xs" color="gray.400" fontStyle="italic">No bank details added</Text>
                    )}
                  </Box>
                );
              })()}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100">
          {selectedTechnician && (
            <Flex w="100%" justify="space-between" align="center">
              <Button
                size="sm"
                colorScheme={selectedTechnician.trainingCompleted ? "orange" : "teal"}
                leftIcon={<FaUserGraduate />}
                onClick={() => onToggleTraining(selectedTechnician, !selectedTechnician.trainingCompleted)}
                isLoading={loading}
              >
                {selectedTechnician.trainingCompleted ? "Mark Training Incomplete" : "Approve Gate 1 Training"}
              </Button>

              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="purple"
                  leftIcon={<FaIdCard />}
                  onClick={() => {
                    onClose();
                    onOpenKYCModal(selectedTechnician);
                  }}
                >
                  Review KYC
                </Button>
                <Button
                  size="sm"
                  colorScheme="orange"
                  leftIcon={<FaUniversity />}
                  onClick={() => {
                    onClose();
                    onOpenBankModal(selectedTechnician);
                  }}
                >
                  Review Bank
                </Button>
              </HStack>
            </Flex>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
