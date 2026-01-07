
import React from "react";
import { Box, Heading, Text, Button, VStack, Container } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function AccessDenied() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        if (userData.role?.toLowerCase() === "owner") {
          navigate("/owner/dashboard");
        } else {
          navigate("/auth/signin");
        }
      } catch {
        navigate("/auth/signin");
      }
    } else {
      navigate("/auth/signin");
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} textAlign="center">
        <Heading size="2xl" color="red.500">
          ⚠️ Access Denied
        </Heading>
        <Text fontSize="xl" color="gray.600">
          You don't have permission to access this page. 
          Only users with owner privileges can access the admin dashboard.
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
              localStorage.clear();
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