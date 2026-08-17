import React from "react";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useRefresh } from "@/contexts/RefreshContext";

interface HapticTabProps extends BottomTabBarButtonProps {
  refreshKey: string;
}

export function HapticTab(props: HapticTabProps) {
  const { refreshKey, ...rest } = props;
  const { triggerRefresh } = useRefresh(refreshKey);

  // Whether this is the tab you are already on, taken from React Navigation
  // rather than worked out here.
  //
  // This used to compare the navigator's index against a hard-coded
  // ["home", "posts", "sounds", "checkin"], which is only correct while the bar
  // never changes. Adding Videos in fourth place pushed Journal to index 4
  // while the list still called it 3, so tapping Journal while on Videos was
  // read as a tap on the current tab: it refreshed instead of navigating and
  // the tab did not respond. Anything derived from the tab order has the same
  // fault waiting in it, so nothing is.
  const isSelected = props["aria-selected"] === true;

  const handlePress = (ev: any) => {
    if (isSelected) {
      triggerRefresh();
    } else {
      props.onPress?.(ev);
    }
  };

  return (
    <PlatformPressable
      {...rest}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      onPress={handlePress}
    />
  );
}
