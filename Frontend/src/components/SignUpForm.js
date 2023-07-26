import React, { useState, useEffect, useContext } from 'react';
import { Button, VStack, Badge, useDisclosure, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { NFTStorage } from "nft.storage";

import {
  googleLogout,
  useGoogleLogin,
  GoogleLogin,
  useGoogleOneTapLogin,
} from '@react-oauth/google';
import axios from 'axios';
import {
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Avatar,
  AvatarBadge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { APIContext, globalCredential } from './APIContext';
import { MapContext } from './MapContext';

export default function SignUpForm({ setIsLoggedIn }) {
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [buttonsDirection, setButtonsDirection] = useState('row');
  const { isMobile, hasTouchScreen } = useContext(MapContext);
  const {
    globalUserInfo,
    setGlobalUserInfo,
    setGlobalCredential,
    checkinState,
    setCheckinState,
    globalCredential,
    badgeState,
    setBadgeState,
    newBadgeState,
    setNewBadgeState,
  } = useContext(APIContext);
  const [userInfoFetched, setUserInfoFetched] = useState(false);
  const { setIsDrawerOpen } = useContext(MapContext);
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const [modalContent, setModalContent] = useState('signUp');
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const handleButtonClick = content => {
    setModalContent(content);
    onOpen();
  };
  const toastLogin = useToast();
  const toastSignup = useToast();
  const toastLogout = useToast();
  const toastSignupError = useToast();
  const toastLoginError = useToast();
  const toastBadge = useToast();
  const toastNFT = useToast();

  useEffect(() => {
    const loggedInfo = localStorage.getItem('loggedInfo');
    setUserLoggedIn(loggedInfo === 'true');
    setLoading(false);

    // Check if user info is cached
    const cachedUserInfo = localStorage.getItem('userInfo');
    if (loggedInfo === 'true' && cachedUserInfo) {
      setGlobalUserInfo(JSON.parse(cachedUserInfo));
      setUserInfoFetched(true);
    }
  }, []);

  useEffect(() => {
    console.log(hasTouchScreen);
    if (hasTouchScreen) {
      setButtonsDirection('column');
      console.log('buttonssssss', buttonsDirection);
    } else {
      setButtonsDirection('row');
    }
  }, [hasTouchScreen]);

  useEffect(() => {
    if (checkinState) {
      // Call the userInfoUpdate function to trigger the API call
      userInfoUpdate();
    }
  }, [checkinState]);

  useEffect(() => {
    if (newBadgeState) {
      badgeChecker(badgeState, newBadgeState);
    }
  }, [checkinState]);



  const badgeChecker = (badgeState, newBadgeState) => {
    // Compare each badge property in the objects
    for (const badge in newBadgeState.badgeDO) {
      const oldBadgeValue = badgeState.badgeDO[badge];
      const newBadgeValue = newBadgeState.badgeDO[badge];

      // Check if the badge value has changed from false to true
      if (oldBadgeValue === false && newBadgeValue === true) {
        // Show a toast with the badge name
        const badgeName = badge.replace(/_/g, ' '); // Replace underscores with spaces
        toastBadge({
          title: 'Congratulations!',
          description: `You've acquired the badge "${badgeName}".`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        toastNFT({
          title: 'NFT MINTED!',
          description: `You've acquired the "${badgeName} NFT!".`,
          status: 'success',
          duration: 6000,
          isClosable: true,
        });

        mintNft(badgeName);
      }
    }
  };



  ////////////////////////////////
  /////                      /////
  ////     NFT MINTING CODE  /////
  ////                       /////
  ////////////////////////////////


// this cleans up the url after uploading the NFT art
const cleanupIPFS = (url) => {
  if(url.includes("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/")
  }
}


// Fetch the image file data from the URL
// const empireStateBadgeImagePath = '../../../public/images/badgeimages/empire_State_Badge.jpg';

// Function to fetch image as Blob
const fetchImageAsBlob = async (url) => {
const response = await fetch(url);
const blob = await response.blob();
return blob;
};

// this uploads the art to blockchain storage
const uploadArtToIpfs = async (badgeName) => {
try {
  const nftstorage = new NFTStorage({
    token: process.env.REACT_APP_NFT_STORAGE,
  });

  const imageBlob = await fetchImageAsBlob(`/images/badgeimages_test/${badgeName}.png`);

  const file = new File([imageBlob], `${badgeName}.png`, { // Use badgeName as the image file name
    type: "image/png", // Change this to the correct file type if needed (e.g., "image/png" for PNG images)
  });

  const store = await nftstorage.store({
    name: `Badge - ${badgeName}`, 
    description: `You got the ${badgeName} Badge!`, // generate description or use name again
    image: file
  });
  console.log(file,'this is hte blob file converted')

  return cleanupIPFS(store.data.image.href);
} catch (err) {
  console.log(err);
  return null;
}
};

// THIS MINTS THE NFTS
const mintNft = async (badgeName) => {
try {
  const imageURL = await uploadArtToIpfs(badgeName);
  console.log("URL for image ", imageURL)

  if (!imageURL) {
    console.log("Error uploading image to IPFS.");
    return;
  }

  // mint as an NFT on nftport
  const response = await axios.post(
    `https://api.nftport.xyz/v0/mints/easy/urls`,
    {
      file_url: imageURL,
      chain: "polygon",
      name: badgeName,
      description: `You visited The ${badgeName} Badge.`,
      mint_to_address: "0xA649D68a977AB4d4Ab3ddd275aC3a84D03889Ee4",
    },
    {
      headers: {
        Authorization: process.env.REACT_APP_NFT_PORT,
      }
    }
  );
  const data = await response.data;
  console.log(data);
} catch (err) {
  console.log(err);
}
};
/////////////////////////////////
/////       END OF         ///// 
////     NFT MINTING CODE  /////
////                       /////
////////////////////////////////










  const userInfoUpdate = async credentialResponse => {
    //console.log(credentialResponse, 'THIS IS THE CRED for checkin');
    // const { checkinCredential } = credentialResponse;

    //setGlobalCredential(credentialResponse.credential); // Set the credential as a global variable
    const cachedUserCredential = localStorage.getItem('userCredential');
    if (cachedUserCredential) {
      axios
        .post(
          `https://csi6220-2-vm1.ucd.ie/backend/api/user/info?idTokenString=${cachedUserCredential}`
        ) //user info, json w/ true false
        .then(response => {
          console.log(response.data, 'updated user info');
          setGlobalUserInfo(response.data);

          if (response.status === 200) {
            setGlobalUserInfo(response.data);
            setNewBadgeState(response.data);
            setUserLoggedIn(true);
            setIsLoggedIn(true);

            // Cache the user info
            localStorage.setItem('userInfo', JSON.stringify(response.data));

            // Cache the user credential
            //localStorage.setItem('userCredential', globalCredential);
            //reset checkinstate to false
            setCheckinState(false);

            toastLogin({
              title: 'Attractions Updated.',
              description: 'Your Attractions Have Been Updated.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });

            setUserInfoFetched(true);
          } else {
            //setUserLoggedIn(false);
            //setIsLoggedIn(false);
            toastLoginError({
              title: 'Update Error.',
              description: 'Error with update, please please refresh page.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch(error => console.log(error));
    }
  };

  const backendLogin = async credentialResponse => {
    console.log(credentialResponse, 'THIS IS THE CRED');
    const { credential } = credentialResponse;

    setGlobalCredential(credentialResponse.credential); // Set the credential as a global variable

    if (credential) {
      axios
        .post(
          `https://csi6220-2-vm1.ucd.ie/backend/api/user/info?idTokenString=${credential}`
        ) //user info, json w/ true false
        .then(response => {
          console.log(response.data, 'user info');
          setGlobalUserInfo(response.data);
          console.log(globalUserInfo,'retrieving the cached info')

          setBadgeState(response.data);

          if (response.status === 200) {
            setGlobalUserInfo(response.data);

            setUserLoggedIn(true);
            setIsLoggedIn(true);
            localStorage.setItem('loggedInfo', 'true'); // Store logged-in state in localStorage

            // Cache the user info
            localStorage.setItem('userInfo', JSON.stringify(response.data));


            // Cache the user credential
            localStorage.setItem('userCredential', credential);

            toastLogin({
              title: 'Login Successful.',
              description: "You've Logged in Successfully.",
              status: 'success',
              duration: 3000,
              isClosable: true,
            });

            setUserInfoFetched(true);
          } else {
            setUserLoggedIn(false);
            setIsLoggedIn(false);
            localStorage.setItem('loggedInfo', 'false'); // Store logged-in state in localStorage
            toastLoginError({
              title: 'Login Error.',
              description: 'Error with login, please try again.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch(error => console.log(error));
    }
  };

  const backendSignUp = credentialResponse => {
    console.log(credentialResponse, 'THIS IS THE CRED');
    const { credential } = credentialResponse;

    if (credential) {
      console.log(credential);
      axios
        .post(
          `https://csi6220-2-vm1.ucd.ie/backend/api/user/register?idTokenString=${credential}`
        )
        .then(response => {
          console.log(
            response.data,
            'this is from the backend login for sign up'
          );

          if (response.data.code !== 10006) {
            console.log(response.data.code, 'this is the code!!!!');
            setGlobalUserInfo(response.data);
            setUserLoggedIn(true);
            setIsLoggedIn(true);
            localStorage.setItem('loggedInfo', 'true'); // Store logged-in state in localStorage

            // Cache the user info
            localStorage.setItem('userInfo', JSON.stringify(response.data));

            setUserInfoFetched(true);

            toastSignup({
              title: 'Account created.',
              description: "We've created your account for you.",
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          } else {
            setUserLoggedIn(false);
            setIsLoggedIn(false);
            onToggle(false);
            localStorage.setItem('loggedInfo', 'false'); // Store logged-in state in localStorage
            toastSignupError({
              title: 'Account Present.',
              description: 'You already have an account.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch(error => console.log(error));
    }
  };

  const deleteAccount = async () => {
    console.log(globalCredential, 'THIS IS THE CRED!!!ASDJASJDL!!');

    if (globalCredential) {
      axios
        .post(`http://localhost:8001/api/user/delete?idTokenString=${globalCredential}`) //user info, json w/ true false
        .then(response => {
          // if (response.data.code === 10004) {
          setUserLoggedIn(false);
          setIsLoggedIn(false);
          localStorage.clear() // Clear the cache

          handleLogout()

          toastLogin({
            title: 'Account successfully deleted.',
            description: "We hope to see you again.",
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

            // setUserInfoFetched(true);

          // } else {
          //   toastLoginError({
          //     title: 'Deletion Error.',
          //     description: 'Error with deleting your account, please try again.',
          //     status: 'error',
          //     duration: 3000,
          //     isClosable: true,
          //   });
          // }
        })
        .catch(error => console.log(error));
    }
  };

  const handleDeleteConfirmation = () => {
    setDeleteAlertOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteAlertOpen(false);
  };

  const handleDeleteAccount = () => {
    handleDeleteCancel(); 
    deleteAccount(); 
  };

  const handleLogout = () => {
    setUserLoggedIn(false);
    setIsLoggedIn(false);
    localStorage.setItem('loggedInfo', 'false'); // Store logged-in state in localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userCredential');
    setIsDrawerOpen(false);
    setGlobalCredential(null);
    onToggle(false);
    toastLogout({
      title: 'Logout.',
      description: "You've logged out successfully.",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Flex flexDirection={buttonsDirection} minWidth="190px" justifyContent="flex-end">
      {userLoggedIn ? (
        <Menu>
          <MenuButton
            as={Button}
            bg="#ff914d"
            color="white"
            border="solid 1px orangered"
            borderRadius="25px"
            _hover={{ bg: 'orangered', color: 'white' }}
          >
            User Options
          </MenuButton>
          <MenuList>
            <MenuItem onClick={handleLogout}>Log Out</MenuItem>
            <MenuItem onClick={handleDeleteConfirmation}>Delete Account</MenuItem>
          </MenuList>
        </Menu>

      ) : (
        <>
          <Flex mr={2}>
            <Button
              bg="white"
              border="solid 1px orangered"
              borderRadius="25px"
              onClick={() => {
                handleButtonClick('logIn');
              }}
            >
              Log In
            </Button>
          </Flex>
          <Flex>
            <Button
              bg="#ff914d"
              color="white"
              border="solid 1px orangered"
              borderRadius="25px"
              _hover={{ bg: 'orangered', color: 'white' }}
              onClick={() => handleButtonClick('signUp')}
            >
              Sign Up
            </Button>
          </Flex>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {modalContent === 'logIn' ? 'Welcome back!' : 'Welcome!'}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {modalContent === 'logIn' ? (
                  <GoogleLogin
                    clientId="568208948795-5dv85a002gctb076vpor6905ur987is0.apps.googleusercontent.com"
                    onSuccess={backendLogin}
                    onFailure={error =>
                      console.log('Google login failed:', error)
                    }
                    cookiePolicy="single_host_origin"
                    icon="false"
                    style={{
                      marginLeft: '1.5em',
                      marginTop: '1em',
                    }}
                    color="black"
                    bg="white"
                    border="1px"
                    borderRadius="0px"
                    borderColor="orangered"
                    shape="pill"
                    buttonText="Login"
                  />
                ) : (
                  <GoogleLogin
                    clientId="568208948795-5dv85a002gctb076vpor6905ur987is0.apps.googleusercontent.com"
                    onSuccess={backendSignUp}
                    onFailure={error =>
                      console.log('Google login failed:', error)
                    }
                    style={{
                      marginLeft: '1.5em',
                      marginTop: '1em',
                    }}
                    color="black"
                    bg="white"
                    border="1px"
                    borderRadius="10px"
                    borderColor="orangered"
                    buttonText="Sign Up"
                    shape="pill"
                    text="Sign Up"
                  />
                )}
              </ModalBody>
              <ModalFooter />
            </ModalContent>
          </Modal>
        </>
      )}
    <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={undefined}
        onClose={handleDeleteCancel}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Account
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete your account?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={undefined} onClick={handleDeleteCancel}>
                No
              </Button>
              <Button colorScheme="red" ml={3} onClick={handleDeleteAccount}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
}