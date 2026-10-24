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
  VStack,
  Avatar,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaWallet } from "react-icons/fa";
import {
  getUserDisplayName,
  getUserDisplayPhone,
  getUserDisplayEmail,
} from "views/Dashboard/UserManagement";

export default function UserPaymentModal({
  isOpen,
  onClose,
  selectedUserForPayment,
}) {
  if (!selectedUserForPayment) return null;

  const { user, totalBookings, successfulPaymentsCount, totalPaidAmount } =
    selectedUserForPayment;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent maxW="500px">
        <ModalHeader color="gray.700">
          <Flex align="center" gap={2}>
            <Icon as={FaWallet} color="orange.500" />
            Payment Summary
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* User Info */}
            <Flex align="center" gap={3} p={3} bg="gray.50" borderRadius="md">
              <Avatar size="sm" name={getUserDisplayName(user)} />
              <Box>
                <Text fontWeight="bold">{getUserDisplayName(user)}</Text>
                <Text fontSize="xs" color="gray.500">
                  {getUserDisplayPhone(user)} • {getUserDisplayEmail(user)}
                </Text>
              </Box>
            </Flex>

            {/* Payment Stats */}
            <SimpleGrid columns={2} spacing={3}>
              <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                <Text fontSize="xs" color="gray.500">Total Bookings</Text>
                <Text fontSize="xl" fontWeight="bold">{totalBookings}</Text>
              </Box>
              <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                <Text fontSize="xs" color="gray.500">Paid Bookings</Text>
                <Text fontSize="xl" fontWeight="bold" color="green.500">
                  {successfulPaymentsCount}
                </Text>
              </Box>
            </SimpleGrid>

            {/* Total Amount */}
            <Box p={4} bg="teal.50" borderRadius="md">
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold" color="teal.700">Total Amount Paid</Text>
                <Text fontSize="2xl" fontWeight="extrabold" color="teal.600">
                  ₹
                  {Number(totalPaidAmount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </Flex>
            </Box>

            {successfulPaymentsCount === 0 && (
              <Box p={3} bg="red.50" borderRadius="md">
                <Text fontSize="sm" color="red.500" textAlign="center">
                  No successful payments found for this user.
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
