import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  HStack,
  Box,
  Icon,
  Text,
  Badge,
  VStack,
  Avatar,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaUsers } from "react-icons/fa";
import {
  getUserDisplayName,
  getUserDisplayEmail,
  getUserDisplayPhone,
} from "views/Dashboard/UserManagement";

export default function UserDetailsModal({
  isOpen,
  onClose,
  selectedUser,
  customColor = "#008080",
}) {
  if (!selectedUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(2px)" bg="blackAlpha.500" />
      <ModalContent maxW="620px" borderRadius="xl" overflow="hidden" shadow="2xl">
        <ModalHeader bg="gray.900" color="white" py={4} px={6}>
          <Flex align="center" justify="space-between" pr={6}>
            <HStack spacing={3}>
              <Box p={2} bg={`${customColor}30`} borderRadius="md">
                <Icon as={FaUsers} color="teal.300" boxSize={5} />
              </Box>
              <Box>
                <Text fontSize="md" fontWeight="bold" color="white">
                  User Profile & Account Dossier
                </Text>
                <Text fontSize="2xs" color="gray.400" fontFamily="mono">
                  USER ID: #{String(selectedUser._id || selectedUser.id || "").slice(-8).toUpperCase()}
                </Text>
              </Box>
            </HStack>
            <Badge
              colorScheme={selectedUser.status?.toLowerCase() === "active" ? "green" : "red"}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {selectedUser.status || "Active"}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton color="white" mt={1} />
        <ModalBody p={5} maxH="75vh" overflowY="auto" bg="gray.50">
          <VStack spacing={4} align="stretch">
            {/* Profile Banner Card */}
            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs">
              <Flex align="center" gap={4}>
                <Avatar
                  size="xl"
                  name={getUserDisplayName(selectedUser)}
                  src={selectedUser.profileImage}
                  border="2px solid"
                  borderColor={customColor}
                  shadow="md"
                />
                <Box flex="1">
                  <Heading size="md" color="gray.800">
                    {getUserDisplayName(selectedUser)}
                  </Heading>
                  <Text fontSize="xs" color="gray.600" mt={0.5}>
                    {getUserDisplayEmail(selectedUser)}
                  </Text>
                  <HStack spacing={2} mt={2}>
                    <Badge colorScheme="teal" fontSize="2xs" px={2} py={0.5} borderRadius="md">
                      {selectedUser.role || "Registered Customer"}
                    </Badge>
                    <Badge
                      colorScheme={selectedUser.allocatedTechnician !== "None" ? "purple" : "gray"}
                      fontSize="2xs"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                    >
                      {selectedUser.allocatedTechnician !== "None" ? "Assigned Tech" : "Unassigned"}
                    </Badge>
                  </HStack>
                </Box>
              </Flex>
            </Box>

            {/* Contact & Personal Information */}
            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs">
              <Text fontWeight="bold" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wide" mb={3}>
                Contact & Account Information
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} fontSize="xs">
                <Box bg="gray.50" p={2.5} borderRadius="lg">
                  <Text color="gray.500" fontSize="2xs">Mobile Phone</Text>
                  <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                    {getUserDisplayPhone(selectedUser)}
                  </Text>
                </Box>
                <Box bg="gray.50" p={2.5} borderRadius="lg">
                  <Text color="gray.500" fontSize="2xs">Email Address</Text>
                  <Text fontWeight="semibold" color="gray.800" isTruncated fontSize="xs">
                    {getUserDisplayEmail(selectedUser)}
                  </Text>
                </Box>
                <Box bg="gray.50" p={2.5} borderRadius="lg">
                  <Text color="gray.500" fontSize="2xs">Joined Date</Text>
                  <Text fontWeight="semibold" color="gray.800">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </Text>
                </Box>
                <Box bg="gray.50" p={2.5} borderRadius="lg">
                  <Text color="gray.500" fontSize="2xs">Location / City</Text>
                  <Text fontWeight="semibold" color="gray.800" textTransform="capitalize">
                    {selectedUser.city ||
                      selectedUser.locality ||
                      selectedUser.address ||
                      selectedUser.profile?.city ||
                      "N/A"}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Booking Statistics Grid */}
            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs">
              <Text fontWeight="bold" color="teal.700" fontSize="xs" textTransform="uppercase" letterSpacing="wide" mb={3}>
                Service Booking Metrics
              </Text>
              <SimpleGrid columns={4} spacing={2}>
                <Box bg="teal.50" p={2.5} borderRadius="lg" textAlign="center">
                  <Text fontSize="2xs" color="teal.700" fontWeight="bold">TOTAL</Text>
                  <Text fontSize="lg" fontWeight="black" color="teal.800">
                    {selectedUser.bookings?.length || selectedUser.bookingCount || 0}
                  </Text>
                </Box>
                <Box bg="green.50" p={2.5} borderRadius="lg" textAlign="center">
                  <Text fontSize="2xs" color="green.700" fontWeight="bold">COMPLETED</Text>
                  <Text fontSize="lg" fontWeight="black" color="green.700">
                    {selectedUser.jobStats?.service?.completed || 0}
                  </Text>
                </Box>
                <Box bg="orange.50" p={2.5} borderRadius="lg" textAlign="center">
                  <Text fontSize="2xs" color="orange.700" fontWeight="bold">PENDING</Text>
                  <Text fontSize="lg" fontWeight="black" color="orange.700">
                    {Math.max(
                      0,
                      (selectedUser.bookingCount || selectedUser.bookings?.length || 0) -
                        (selectedUser.jobStats?.service?.completed || 0)
                    )}
                  </Text>
                </Box>
                <Box bg="red.50" p={2.5} borderRadius="lg" textAlign="center">
                  <Text fontSize="2xs" color="red.700" fontWeight="bold">CANCELLED</Text>
                  <Text fontSize="lg" fontWeight="black" color="red.700">
                    {selectedUser.jobStats?.service?.cancelled || 0}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Technician Assignment */}
            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs">
              <Text fontWeight="bold" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wide" mb={2}>
                Allocated Technician
              </Text>
              <Badge
                colorScheme={selectedUser.allocatedTechnician !== "None" ? "green" : "gray"}
                fontSize="xs"
                px={3}
                py={1.5}
                borderRadius="md"
              >
                {selectedUser.allocatedTechnician !== "None"
                  ? `Assigned Specialist: ${selectedUser.allocatedTechnician}`
                  : "No active technician allocated"}
              </Badge>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
