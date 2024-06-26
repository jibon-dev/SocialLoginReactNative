import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {BASE_URL} from './src/api/api';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const App = () => {
  const [user, setUser] = useState(null);
  console.log('User =============> : ', user);

  useEffect(() => {
    GoogleSignin.configure({
      androidClientId:
        '314495525646-08483hh2p317qmt2goo1a19e7nt2uva9.apps.googleusercontent.com',
      scopes: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'openid',
        'profile',
        'email',
      ],
    });
  }, []);

  // Collect user token ==========================================================

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('UserInfo =========>:', userInfo);
      setUser(userInfo);
      getGmailInfo(userInfo.user);

      // sendUserDataToBackend(userInfo.user);
    } catch (error) {
      console.log('Message', error.message);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services Not Available or Outdated');
      } else {
        console.log('Some Other Error Happened');
      }
    }
  };

  const getGmailInfo = async userData => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user: userData,
      }),
    };

    try {
      const response = await fetch(
        `${BASE_URL}/account/api/send-gmail-login/`,
        requestOptions,
      );
      if (response.ok) {
        console.log('User data sent successfully');
      } else {
        console.log('Failed to send user data', response.statusText);
      }
    } catch (error) {
      console.error('Error sending user data:', error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUser(null);
    } catch (error) {
      console.error('signOut Error', error);
    }
  };

  return (
    <View style={styles.main}>
      {!user ? (
        <GoogleSigninButton
          style={{width: 192, height: 48}}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
        />
      ) : (
        <TouchableOpacity onPress={signOut}>
          <Image
            source={{uri: user?.user?.photo}}
            style={styles.profileImage}
          />
          <Text>{user?.user?.email}</Text>
          <Text>{user?.user?.name}</Text>
          <Text>Email: {user?.user?.email}</Text>
          <Text>Name: {user?.user?.name}</Text>
          <Text>ID: {user?.user?.id}</Text>
          <Text>Given Name: {user?.user?.givenName}</Text>
          <Text>Family Name: {user?.user?.familyName}</Text>

          <Text>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 20,
    marginTop: 10,
  },
});

export default App;
