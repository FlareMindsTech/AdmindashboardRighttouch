
import React from "react";
import { Box, Heading, Text, Button, VStack, Container } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { logoutSession, selectIsPrivileged } from "store/slices/authSlice";

export default function AccessDenied() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isPrivileged = useAppSelector(selectIsPrivileged);

  const handleGoHome = () => {
    navigate(isPrivileged ? "/owner/dashboard" : "/auth/signin");
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} textAlign="center">
        <Heading size="2xl" color="red.500">
          ⚠️ Access Denied
        </Heading>
        <Text fontSize="xl" color="gray.600">
          You don't have permission to access this page.
        </Text>
        <Box>
          <Button
            colorScheme="purple"
            size="lg"
            onClick={handleGoHome}
            mr={4}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              dispatch(logoutSession());
              navigate("/auth/signin");
            }}
          >
            Sign In with Different Account
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}
