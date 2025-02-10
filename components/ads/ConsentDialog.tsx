import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import * as TrackingTransparency from "expo-tracking-transparency";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";

const ConsentDialog = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem("trackingConsent").then((storedConsent) => {
      if (storedConsent === null) {
        setModalVisible(true);
      }
    });
  }, []);

  const handleContinue = async () => {
    await AsyncStorage.setItem("trackingConsent", "shown");
    setModalVisible(false);
    if (Platform.OS === "ios") {
      const { status } =
        await TrackingTransparency.requestTrackingPermissionsAsync();
      console.log("Tracking permission status:", status);
    }
  };

  const handleAgree = async () => {
    await AsyncStorage.setItem("trackingConsent", "granted");
    setModalVisible(false);
  };

  const handleDisagree = async () => {
    await AsyncStorage.setItem("trackingConsent", "denied");
    setModalVisible(false);
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Privacy and Data Tracking</Text>
          <Text style={styles.message}>
            Dear user, we care about your privacy and data security. At
            TinnitusHelp.me, we keep this app free by showing ads. Our partners
            may collect data to deliver personalized ads, but only if you agree.
            {Platform.OS === "ios"
              ? " Please press 'Continue' to proceed."
              : " Please select an option below."}
          </Text>
          <View style={styles.buttonContainer}>
            {Platform.OS === "android" ? (
              <>
                <TouchableOpacity
                  onPress={handleDisagree}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>I Don't Agree</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAgree} style={styles.button}>
                  <Text style={[styles.buttonText, styles.agreeButton]}>
                    I Agree
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={handleContinue} style={styles.button}>
                <Text style={[styles.buttonText, styles.continueButton]}>
                  Continue
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.text,
  },
  message: {
    marginBottom: 15,
    fontSize: 16,
    color: Colors.text,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.highlight,
  },
  continueButton: {
    fontWeight: "bold",
  },
  agreeButton: {
    fontWeight: "bold",
  },
});

export default ConsentDialog;
