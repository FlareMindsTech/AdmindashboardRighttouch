import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

export default function EditKYCModal({
  isOpen,
  onClose,
  kycEditForm,
  setKycEditForm,
  onSave,
  isLoading,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent borderRadius="14px">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100">
          Edit Technician KYC Numbers
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={4}>
          <VStack spacing={3}>
            <FormControl>
              <FormLabel fontSize="xs">Aadhaar Number (12 digits)</FormLabel>
              <Input
                size="sm"
                value={kycEditForm.aadhaarNumber}
                onChange={(e) => setKycEditForm({ ...kycEditForm, aadhaarNumber: e.target.value })}
                placeholder="123456789012"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">PAN Card Number</FormLabel>
              <Input
                size="sm"
                value={kycEditForm.panNumber}
                onChange={(e) => setKycEditForm({ ...kycEditForm, panNumber: e.target.value })}
                placeholder="ABCDE1234F"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Driving License Number</FormLabel>
              <Input
                size="sm"
                value={kycEditForm.drivingLicenseNumber}
                onChange={(e) =>
                  setKycEditForm({ ...kycEditForm, drivingLicenseNumber: e.target.value })
                }
                placeholder="TN3720230009999"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50">
          <Button size="sm" mr={2} variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" colorScheme="teal" onClick={onSave} isLoading={isLoading}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
