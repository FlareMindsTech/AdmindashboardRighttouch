import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  Box,
  Icon,
  Text,
  Badge,
  VStack,
  SimpleGrid,
  Center,
} from "@chakra-ui/react";
import { FaUserCog, FaUsers } from "react-icons/fa";

export default function AllocateTechnicianModal({
  isOpen,
  onClose,
  selectedUserForTech,
  customColor = "#008080",
}) {
  if (!selectedUserForTech) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(2px)" bg="blackAlpha.500" />
      <ModalContent maxW="700px" borderRadius="xl" overflow="hidden" shadow="2xl">
        <ModalHeader bg="gray.900" color="white" py={4} px={6}>
          <Flex align="center" gap={3}>
            <Box p={2} bg={`${customColor}30`} borderRadius="md">
              <Icon as={FaUserCog} color="teal.300" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="md" fontWeight="bold" color="white">
                Technician Allocation & Job Details
              </Text>
              <Text fontSize="2xs" color="gray.400">
                Assigned technicians per booking
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton color="white" mt={1} />
        <ModalBody p={5} maxH="75vh" overflowY="auto" bg="gray.50">
          <VStack spacing={4} align="stretch">
            {selectedUserForTech.bookings && selectedUserForTech.bookings.length > 0 ? (
              selectedUserForTech.bookings.map((booking, idx) => {
                const techObj =
                  typeof booking.technicianId === "object" && booking.technicianId
                    ? booking.technicianId.userId || booking.technicianId
                    : null;
                const techName = techObj
                  ? `${techObj.fname || techObj.firstName || ""} ${
                      techObj.lname || techObj.lastName || ""
                    }`.trim() ||
                    techObj.name ||
                    "Assigned Specialist"
                  : booking.technicianName || "No Technician Allocated";
                const techPhone =
                  techObj?.mobileNumber ||
                  techObj?.phone ||
                  techObj?.mobile ||
                  booking.technicianPhone ||
                  "N/A";
                const techEmail = techObj?.email || "N/A";

                return (
                  <Box
                    key={idx}
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    bg="white"
                    shadow="xs"
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                      mb={3}
                      pb={2}
                      borderBottom="1px dashed"
                      borderColor="gray.200"
                    >
                      <Text
                        fontWeight="bold"
                        color={customColor}
                        fontSize="xs"
                        textTransform="uppercase"
                      >
                        Booking #{idx + 1} (
                        {booking.bookingNumber || String(booking._id || "").slice(-6)})
                      </Text>
                      <Badge
                        colorScheme={
                          booking.status === "completed"
                            ? "green"
                            : booking.status === "cancelled"
                            ? "red"
                            : "yellow"
                        }
                        fontSize="2xs"
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                      >
                        {booking.status || "Pending"}
                      </Badge>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box
                        bg="teal.50/50"
                        p={3}
                        borderRadius="lg"
                        borderLeft="3px solid"
                        borderColor="teal.400"
                      >
                        <Text
                          fontSize="2xs"
                          fontWeight="bold"
                          color="teal.700"
                          textTransform="uppercase"
                          mb={1.5}
                        >
                          Allocated Technician Profile
                        </Text>
                        {booking.technicianId || booking.technicianName ? (
                          <VStack align="stretch" spacing={1} fontSize="xs">
                            <Text><strong>Name:</strong> {techName}</Text>
                            <Text><strong>Phone:</strong> {techPhone}</Text>
                            <Text><strong>Email:</strong> {techEmail}</Text>
                            <Text>
                              <strong>Assigned:</strong>{" "}
                              {booking.assignedAt
                                ? new Date(booking.assignedAt).toLocaleString()
                                : "System Auto-Allocated"}
                            </Text>
                          </VStack>
                        ) : (
                          <Text
                            fontSize="xs"
                            color="red.500"
                            fontWeight="medium"
                            fontStyle="italic"
                          >
                            No technician allocated yet for this booking.
                          </Text>
                        )}
                      </Box>

                      <Box
                        bg="blue.50/50"
                        p={3}
                        borderRadius="lg"
                        borderLeft="3px solid"
                        borderColor="blue.400"
                      >
                        <Text
                          fontSize="2xs"
                          fontWeight="bold"
                          color="blue.700"
                          textTransform="uppercase"
                          mb={1.5}
                        >
                          Booked Service Details
                        </Text>
                        <VStack align="stretch" spacing={1} fontSize="xs">
                          <Text>
                            <strong>Service:</strong>{" "}
                            {booking.serviceId?.serviceName ||
                              booking.serviceName ||
                              booking.title ||
                              "Standard Service"}
                          </Text>
                          <Text>
                            <strong>Category:</strong>{" "}
                            {booking.serviceId?.category || booking.bookingType || "Service"}
                          </Text>
                          <Text>
                            <strong>Amount:</strong>{" "}
                            <Text as="span" fontWeight="bold" color="green.600">
                              ₹
                              {booking.totalAmount ||
                                booking.amount ||
                                booking.serviceId?.serviceCost ||
                                0}
                            </Text>
                          </Text>
                        </VStack>
                      </Box>
                    </SimpleGrid>
                  </Box>
                );
              })
            ) : (
              <Center py={8}>
                <VStack spacing={2}>
                  <Icon as={FaUsers} color="gray.400" boxSize={8} />
                  <Text color="gray.500" fontSize="sm">
                    No service bookings found for this customer.
                  </Text>
                </VStack>
              </Center>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
