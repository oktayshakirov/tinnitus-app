import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { getTodaysTip } from "@/constants/tinnitusTips";

// App theme (kept literal here — this renders outside the RN tree so it can't
// import runtime theme objects that rely on the app being mounted).
const BG = "#5B3964";
const TEXT = "#FFFFFF";
const HIGHLIGHT = "#FFDAB9";
const ACCENT = "#FFD2A6";

const BLOG_URI = "tinnitushelp://posts";

interface Props {
  isPro: boolean;
  // Width in dp reported by the launcher; ~140 for a 2x2 cell, ~250+ for 4x2.
  width?: number;
}

export function TinnitusTipWidget({ isPro, width = 0 }: Props) {
  const isWide = width >= 220;
  const tip = getTodaysTip();

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: BLOG_URI }}
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: BG,
        borderRadius: 24,
        padding: isWide ? 18 : 14,
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <TextWidget
        text={isWide ? "DAILY TINNITUS TIP" : "DAILY TIP"}
        style={{ fontSize: 11, fontFamily: "sans-serif-medium", color: ACCENT }}
      />

      {/* Fills the space between header and footer, centering the tip. */}
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <TextWidget
          text={isPro ? tip : "🔒 Unlock daily tips with Pro"}
          style={{ fontSize: isWide ? 17 : 14, color: TEXT }}
        />
      </FlexWidget>

      <TextWidget
        text="Tap to read more on TinnitusHelp.me"
        style={{ fontSize: 11, color: HIGHLIGHT }}
      />
    </FlexWidget>
  );
}
