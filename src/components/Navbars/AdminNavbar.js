import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import AdminNavbarLinks from "./AdminNavbarLinks";

const AdminNavbar = React.memo(function AdminNavbar(props) {
  const { onOpen } = props;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Background layer for deep visual anchor */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        height={{ base: "0px", md: "90px", lg: "95px" }}
        bg="#008080"
        zIndex="-1"
      />

      {/* Main Luxury Executive Header Bar */}
      <Flex
        as="header"
        position="fixed"
        top="0"
        left="0"
        right="0"
        w="100%"
        h={{ base: "64px", md: "74px" }}
        align="center"
        justify="space-between"
        px={{ base: 3, sm: 4, md: 6, lg: 8 }}
        bg="linear-gradient(135deg, #008080 0%, #006b6b 60%, #005454 100%)"
        backdropFilter="blur(12px)"
        sx={{ WebkitBackdropFilter: "blur(12px)" }}
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.16)"
        boxShadow={
          scrolled
            ? "0 10px 28px -4px rgba(0, 50, 50, 0.5), 0 2px 8px rgba(0, 0, 0, 0.15)"
            : "0 4px 18px rgba(0, 50, 50, 0.28)"
        }
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        zIndex="1000"
      >
        {/* LEFT SECTION: Mobile Hamburger Trigger */}
        <HStack spacing={3} align="center">
          <IconButton
            aria-label="Open Navigation Drawer"
            icon={<HamburgerIcon boxSize={5} color="white" />}
            display={{ base: "flex", lg: "none" }}
            variant="ghost"
            size="sm"
            borderRadius="10px"
            bg="rgba(255, 255, 255, 0.12)"
            _hover={{ bg: "rgba(255, 255, 255, 0.22)" }}
            _active={{ bg: "rgba(255, 255, 255, 0.3)" }}
            onClick={onOpen}
          />
        </HStack>

        {/* Flexible center spacer */}
        <Box flex="1" />

        {/* RIGHT SECTION: Quick links, Notifications, Profile capsule */}
        <AdminNavbarLinks scrolled={scrolled} />
      </Flex>
    </>
  );
});

export default AdminNavbar;
