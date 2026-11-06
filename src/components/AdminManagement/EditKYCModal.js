import React from "react";
import AppModal from "components/common/AppModal";
import {
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
    <AppModal isOpen={isOpen} onClose={onClose} size="md" title={<>Edit Technician KYC Numbers</>} footer={<><Button size="sm" mr={2} variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" colorScheme="teal" onClick={onSave} isLoading={isLoading}>
            Save Changes
          </Button></>}>
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

</AppModal>
  );
}
