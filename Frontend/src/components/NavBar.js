import React, { useState, useContext } from 'react';
import {
  Box,
  Flex,
  TabList,
  Tab,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  Button,
  Text,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import SignUpForm from './SignUpForm';
import LocationInput from './LocationInput';
import SearchBar from './SearchBar';
import { MapContext } from './MapContext';

export default function NavBar({ isMobile, setIsMobile }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Retrieve the logged-in status from the cache
    const cachedStatus = localStorage.getItem('loggedInfo');
    return cachedStatus === 'true'; // Convert to boolean
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { setActiveDrawer, isDrawerOpen, setIsDrawerOpen } =
    useContext(MapContext);

  const handleLogin = () => {
    setIsLoggedIn(true);
    // isDisabled(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // isDisabled(false);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  //refresh the page when clicking the logo
  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <Flex
      align="center"
      justify="space-between"
      h="75px"
      mt="10px"
      px="4"
      style={{ borderBottom: 'solid 1px orangered' }}
    >
      <Box>
        <img
          style={{ cursor: 'pointer' }} // cursor change on hover
          onClick={handleLogoClick}
          src="logo.png"
          alt="Tourify Logo"
        />
      </Box>
      <Flex
        flex="1"
        justifyContent="center"
        display={{ base: 'none', md: 'flex' }}
      >
        <SearchBar />
        <Button
          display="flex"
          flexDirection="column"
          bg="white"
          h="fit-content"
          w="fit-content"
          isDisabled={!isLoggedIn}
          onClick={() => {
            setActiveDrawer('recommender');
            {
              !isDrawerOpen && setIsDrawerOpen(true);
            }
          }}
        >
          <img
            src="/images/navbar-icons/recommender-icon.png"
            alt="Recommender"
            style={{ paddingTop: '8px' }}
          />
          <Text fontWeight="normal" fontSize="11px" pb="6px" m="0">
            Recommender
          </Text>
        </Button>
        <Button
          display="flex"
          flexDirection="column"
          bg="white"
          h="fit-content"
          w="fit-content"
          isDisabled={!isLoggedIn}
          onClick={() => {
            setActiveDrawer('attractions');
            {
              !isDrawerOpen && setIsDrawerOpen(true);
            }
          }}
        >
          <img
            src="/images/navbar-icons/attractions-icon.png"
            alt="Attractions"
            style={{ paddingTop: '8px' }}
          />
          <Text fontWeight="normal" fontSize="11px" pb="6px" m="0">
            Attractions
          </Text>
        </Button>
        <Button
          display="flex"
          flexDirection="column"
          bg="white"
          h="fit-content"
          w="fit-content"
          isDisabled={!isLoggedIn}
          onClick={() => {
            setActiveDrawer('badges');
            {
              !isDrawerOpen && setIsDrawerOpen(true);
            }
          }}
        >
          <img
            src="/images/navbar-icons/badges-icon.png"
            alt="Badges"
            style={{ paddingTop: '8px' }}
          />
          <Text fontWeight="normal" fontSize="11px" pb="6px" m="0">
            Badges
          </Text>
        </Button>
        {/* <TabList>
          <Tab color="orangered">Map</Tab>
          <Tab isDisabled={!isLoggedIn} color="orangered">
            Attractions
          </Tab>
          <Tab isDisabled={!isLoggedIn} color="orangered">
            Badges
          </Tab>
        </TabList> */}
      </Flex>
      {isMobile && (
        <Box display={{ base: 'block', md: 'none' }} style={{ zIndex: '2' }}>
          <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
            <MenuButton
              as={IconButton}
              icon={<HamburgerIcon />}
              variant="ghost"
              onClick={handleMenuToggle}
              l={1}
            />
            <MenuList>
              {/* <TabList flexDirection="column">
                <Tab
                  _selected={{ color: 'white', bg: '#ff4500' }}
                  onClick={handleMenuToggle}
                >
                  Map
                </Tab>
                <Tab
                  _selected={{ color: 'white', bg: '#ff4500' }}
                  onClick={handleMenuToggle}
                  isDisabled={!isLoggedIn}
                >
                  Attractions
                </Tab>
                <Tab
                  _selected={{ color: 'white', bg: '#ff4500' }}
                  onClick={handleMenuToggle}
                  isDisabled={!isLoggedIn}
                >
                  Badges
                </Tab>
              </TabList> */}
              <Flex>
                <SignUpForm setIsLoggedIn={setIsLoggedIn} />
              </Flex>
            </MenuList>
          </Menu>
        </Box>
      )}
      {!isMobile && (
        <Flex>
          <SignUpForm setIsLoggedIn={setIsLoggedIn} align="center" />
        </Flex>
      )}
    </Flex>
  );
}
