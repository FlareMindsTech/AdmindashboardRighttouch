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
  HStack,
  Button,
  Spinner,
  VStack,
  Icon,
  Badge,
  SimpleGrid,
  Textarea,
} from "@chakra-ui/react";
import {
  FaLock,
  FaUnlock,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { MdOutlinePending } from "react-icons/md";

export default function KYCReviewModal({
  isOpen,
  onClose,
  selectedTechForKYC,
  allKycRecords,
  kycData,
  kycLoading,
  isUnmaskedPII,
  onToggleUnmaskedPII,
  onOpenEditKYC,
  onDeleteKYC,
  showRejectionInput,
  setShowRejectionInput,
  rejectionInput,
  setRejectionInput,
  onVerifyKYCAction,
  isTechnicianKYCVerified,
  getTechnicianName,
  getImageUrl,
  customColor = "#008080",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="16px">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={3}>
          <Flex justify="space-between" align="center" pr={6}>
            <Box>
              <Heading size="sm">Gate 2: KYC Identity Verification</Heading>
              <Text fontSize="xs" color="gray.500" mt={0.5}>
                Technician: {getTechnicianName(selectedTechForKYC, allKycRecords)}
              </Text>
            </Box>
            <HStack spacing={2}>
              <Button
                size="xs"
                variant="outline"
                leftIcon={isUnmaskedPII ? <FaLock /> : <FaUnlock />}
                colorScheme={isUnmaskedPII ? "purple" : "gray"}
                onClick={onToggleUnmaskedPII}
                isLoading={kycLoading}
              >
                {isUnmaskedPII ? "Mask PII" : "Unmask Full PII (Audited)"}
              </Button>
              {kycData && (
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="teal"
                  leftIcon={<FaEdit />}
                  onClick={() => {
                    const rec = Array.isArray(kycData)
                      ? kycData.find((d) => (d.technicianId?._id || d.technicianId) === selectedTechForKYC?._id) || kycData[0]
                      : kycData;
                    onOpenEditKYC(rec);
                  }}
                >
                  Edit Numbers
                </Button>
              )}
            </HStack>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4}>
          {kycLoading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner size="lg" color={customColor} />
            </Flex>
          ) : kycData ? (
            (() => {
              let rec = Array.isArray(kycData)
                ? kycData.find((d) => (d.technicianId?._id || d.technicianId) === selectedTechForKYC?._id) || kycData[0]
                : kycData;

              if (!rec) {
                return (
                  <Text textAlign="center" py={8} color="gray.500">
                    No KYC record found for this technician.
                  </Text>
                );
              }

              const docs = rec.documents || {};
              const verificationStatus =
                rec.verificationStatus || rec.status || "pending";
              const isAlreadyVerified = isTechnicianKYCVerified(selectedTechForKYC, allKycRecords);

              return (
                <VStack spacing={4} align="stretch">
                  {/* Status Banner */}
                  <Flex
                    p={3}
                    borderRadius="8px"
                    align="center"
                    justify="space-between"
                    bg={
                      verificationStatus === "approved" || isAlreadyVerified
                        ? "green.50"
                        : verificationStatus === "rejected"
                        ? "red.50"
                        : "yellow.50"
                    }
                    border="1px solid"
                    borderColor={
                      verificationStatus === "approved" || isAlreadyVerified
                        ? "green.300"
                        : verificationStatus === "rejected"
                        ? "red.200"
                        : "yellow.200"
                    }
                  >
                    <Box>
                      <Flex align="center" gap={2}>
                        <Icon
                          as={
                            verificationStatus === "approved" || isAlreadyVerified
                              ? FaCheckCircle
                              : verificationStatus === "rejected"
                              ? FaTimesCircle
                              : MdOutlinePending
                          }
                          color={
                            verificationStatus === "approved" || isAlreadyVerified
                              ? "green.600"
                              : verificationStatus === "rejected"
                              ? "red.600"
                              : "yellow.600"
                          }
                          boxSize="18px"
                        />
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {verificationStatus === "approved" || isAlreadyVerified
                            ? "Already Verified (KYC Approved)"
                            : verificationStatus === "rejected"
                            ? "KYC Rejected"
                            : "KYC Pending Verification"}
                        </Text>
                      </Flex>
                      <Badge
                        colorScheme={
                          verificationStatus === "approved" || isAlreadyVerified
                            ? "green"
                            : verificationStatus === "rejected"
                            ? "red"
                            : "yellow"
                        }
                        fontSize="xs"
                        mt={1}
                      >
                        {verificationStatus === "approved" || isAlreadyVerified
                          ? "ALREADY VERIFIED BY ADMIN"
                          : verificationStatus.toUpperCase()}
                      </Badge>
                    </Box>
                    {rec.verifiedAt && (
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        Verified Date: {new Date(rec.verifiedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </Flex>

                  {rec.rejectionReason && (
                    <Box p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px">
                      <Text fontSize="xs" fontWeight="bold" color="red.700">
                        Rejection Reason:
                      </Text>
                      <Text fontSize="xs" color="red.600" mt={1}>
                        {rec.rejectionReason}
                      </Text>
                    </Box>
                  )}

                  {/* Document Cards Grid */}
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                    {/* Aadhaar */}
                    <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="10px">
                      <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
                        AADHAAR CARD
                      </Text>
                      {docs.aadhaarUrl ? (
                        <Box borderRadius="6px" overflow="hidden" border="1px solid #eee">
                          <img
                            src={getImageUrl(docs.aadhaarUrl)}
                            alt="Aadhaar"
                            style={{ width: "100%", height: "130px", objectFit: "cover", cursor: "pointer" }}
                            onClick={() => window.open(getImageUrl(docs.aadhaarUrl), "_blank")}
                          />
                          <Button
                            size="xs"
                            w="100%"
                            variant="ghost"
                            colorScheme="purple"
                            as="a"
                            href={getImageUrl(docs.aadhaarUrl)}
                            target="_blank"
                          >
                            View Full Size
                          </Button>
                        </Box>
                      ) : (
                        <Flex h="130px" bg="gray.50" align="center" justify="center" border="1px dashed #cbd5e1">
                          <Text fontSize="xs" color="gray.400">Not Uploaded</Text>
                        </Flex>
                      )}
                      <Text fontSize="10px" color="gray.400" mt={2} textTransform="uppercase">
                        Aadhaar Number
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" fontFamily="monospace">
                        {rec.aadhaarNumber || "N/A"}
                      </Text>
                    </Box>

                    {/* PAN Card */}
                    <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="10px">
                      <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
                        PAN CARD
                      </Text>
                      {docs.panUrl ? (
                        <Box borderRadius="6px" overflow="hidden" border="1px solid #eee">
                          <img
                            src={getImageUrl(docs.panUrl)}
                            alt="PAN"
                            style={{ width: "100%", height: "130px", objectFit: "cover", cursor: "pointer" }}
                            onClick={() => window.open(getImageUrl(docs.panUrl), "_blank")}
                          />
                          <Button
                            size="xs"
                            w="100%"
                            variant="ghost"
                            colorScheme="purple"
                            as="a"
                            href={getImageUrl(docs.panUrl)}
                            target="_blank"
                          >
                            View Full Size
                          </Button>
                        </Box>
                      ) : (
                        <Flex h="130px" bg="gray.50" align="center" justify="center" border="1px dashed #cbd5e1">
                          <Text fontSize="xs" color="gray.400">Not Uploaded</Text>
                        </Flex>
                      )}
                      <Text fontSize="10px" color="gray.400" mt={2} textTransform="uppercase">
                        PAN Number
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" fontFamily="monospace">
                        {rec.panNumber || "N/A"}
                      </Text>
                    </Box>

                    {/* Driving License */}
                    <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="10px">
                      <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
                        DRIVING LICENSE
                      </Text>
                      {docs.dlUrl ? (
                        <Box borderRadius="6px" overflow="hidden" border="1px solid #eee">
                          <img
                            src={getImageUrl(docs.dlUrl)}
                            alt="Driving License"
                            style={{ width: "100%", height: "130px", objectFit: "cover", cursor: "pointer" }}
                            onClick={() => window.open(getImageUrl(docs.dlUrl), "_blank")}
                          />
                          <Button
                            size="xs"
                            w="100%"
                            variant="ghost"
                            colorScheme="purple"
                            as="a"
                            href={getImageUrl(docs.dlUrl)}
                            target="_blank"
                          >
                            View Full Size
                          </Button>
                        </Box>
                      ) : (
                        <Flex h="130px" bg="gray.50" align="center" justify="center" border="1px dashed #cbd5e1">
                          <Text fontSize="xs" color="gray.400">Not Uploaded</Text>
                        </Flex>
                      )}
                      <Text fontSize="10px" color="gray.400" mt={2} textTransform="uppercase">
                        DL Number
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" fontFamily="monospace">
                        {rec.drivingLicenseNumber || "N/A"}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Rejection input area */}
                  {showRejectionInput && (
                    <Box p={3} border="1px solid" borderColor="red.300" borderRadius="8px" bg="red.50">
                      <Text fontSize="xs" fontWeight="bold" color="red.700" mb={1}>
                        Reason for Rejection (Required):
                      </Text>
                      <Textarea
                        size="sm"
                        bg="white"
                        placeholder="State why document/identity was rejected..."
                        value={rejectionInput}
                        onChange={(e) => setRejectionInput(e.target.value)}
                      />
                    </Box>
                  )}
                </VStack>
              );
            })()
          ) : (
            <Text textAlign="center" py={10} color="gray.500">
              No KYC record found.
            </Text>
          )}
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.100" bg="gray.50">
          <Flex w="100%" justify="space-between" align="center">
            {kycData && (
              <Button
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={onDeleteKYC}
              >
                Delete KYC
              </Button>
            )}

            <HStack spacing={2}>
              {!showRejectionInput ? (
                <>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => setShowRejectionInput(true)}
                  >
                    Reject KYC
                  </Button>
                  {(() => {
                    const alreadyVerified = isTechnicianKYCVerified(selectedTechForKYC, allKycRecords);
                    return (
                      <Button
                        size="sm"
                        colorScheme={alreadyVerified ? "teal" : "green"}
                        leftIcon={<FaCheckCircle />}
                        onClick={() => onVerifyKYCAction("approved")}
                      >
                        {alreadyVerified ? "Already Verified ✓" : "Approve (Verify Identity)"}
                      </Button>
                    );
                  })()}
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowRejectionInput(false);
                      setRejectionInput("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => onVerifyKYCAction("rejected")}
                  >
                    Confirm Rejection
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
