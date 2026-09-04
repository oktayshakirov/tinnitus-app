import React from "react";
import { FlexWidget, TextWidget, ImageWidget } from "react-native-android-widget";
import type { CheckinWidgetData } from "@/services/checkin";
import { MASCOT_DATA } from "./mascotData";

const BG = "#5B3964";
const TEXT = "#FFFFFF";
const HIGHLIGHT = "#FFDAB9";
const ACCENT = "#FFD2A6";

// Mascot faces (shared with the website) — four expressions across five levels.
// Passed as inline base64 data URIs: react-native-android-widget resolves
// require()'d assets to a Metro dev-server URL in dev, but that path can't be
// reached in a release build, so the widget's face silently fails to load.
// A data URI needs no network fetch and renders the same in both.
const LEVEL_MASCOT: `data:image${string}`[] = [
  MASCOT_DATA.happy,
  MASCOT_DATA.neutral,
  MASCOT_DATA.sad,
  MASCOT_DATA.scared,
  MASCOT_DATA.scared,
];
const LEVEL_COLORS = ["#4ade80", "#a3e635", "#facc15", "#fb923c", "#f87171"];

interface Props {
  isPro: boolean;
  data: CheckinWidgetData | null;
  width?: number;
}

export function CheckinWidget({ isPro, data, width = 0 }: Props) {
  const isWide = width >= 220;
  const streak = data?.streak ?? 0;
  const todayLevel = data?.todayLevel ?? 0;
  const checkedIn = todayLevel > 0;

  const faceSize = isWide ? 44 : 40;
  const face = checkedIn ? (
    <ImageWidget
      image={LEVEL_MASCOT[todayLevel - 1]}
      imageWidth={faceSize}
      imageHeight={faceSize}
    />
  ) : (
    <TextWidget text="📝" style={{ fontSize: faceSize }} />
  );
  const streakShort =
    streak > 0 ? `🔥 ${streak}-day streak` : "Start your streak";
  const streakLong =
    streak > 0
      ? `🔥 ${streak}-day streak${checkedIn ? " - keep it up!" : " - check in!"}`
      : "Start your streak today";

  // react-native-android-widget does not support React fragments, so every
  // conditional branch below returns a single widget element.
  let content: React.ReactElement;
  if (!isPro) {
    content = (
      <TextWidget
        text="🔒 Unlock the Journal widget with Pro"
        style={{ fontSize: isWide ? 15 : 13, color: TEXT }}
      />
    );
  } else if (!isWide) {
    content = (
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "column",
          width: "match_parent",
          height: "match_parent",
        }}
      >
        <FlexWidget
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            width: "match_parent",
          }}
        >
          {face}
          <TextWidget
            text={checkedIn ? "Logged today" : "Tap to log today"}
            style={{ fontSize: 12, color: TEXT, marginTop: 6 }}
          />
        </FlexWidget>
        <TextWidget
          text={streakShort}
          style={{ fontSize: 12, color: HIGHLIGHT }}
        />
      </FlexWidget>
    );
  } else {
    const barHeight = (lv: number) =>
      lv > 0 ? 18 + (lv - 1) * 16 : 6;

    content = (
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "column",
          width: "match_parent",
          height: "match_parent",
        }}
      >
        <FlexWidget
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            width: "match_parent",
          }}
        >
          <FlexWidget style={{ flexDirection: "column", flex: 1 }}>
            <TextWidget
              text={checkedIn ? "Logged today" : "How's your tinnitus today?"}
              style={{ fontSize: 16, color: TEXT }}
            />
            <TextWidget
              text={streakLong}
              style={{ fontSize: 13, color: HIGHLIGHT, marginTop: 4 }}
            />
          </FlexWidget>
          {face}
        </FlexWidget>
        <FlexWidget
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-end",
            width: "match_parent",
            marginTop: 14,
          }}
        >
          {(data?.last7 ?? []).map((lv, i) => (
            <FlexWidget
              key={String(i)}
              style={{
                flex: 1,
                height: "match_parent",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <FlexWidget
                style={{
                  width: 16,
                  height: barHeight(lv),
                  backgroundColor: (lv > 0
                    ? LEVEL_COLORS[lv - 1]
                    : "#26FFFFFF") as `#${string}`,
                  borderRadius: 3,
                }}
              />
            </FlexWidget>
          ))}
        </FlexWidget>
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: "tinnitushelp://checkin" }}
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
        text={isWide ? "DAILY JOURNAL" : "JOURNAL"}
        style={{ fontSize: 11, fontFamily: "sans-serif-medium", color: ACCENT }}
      />
      {/* Content fills the space below the header, distributed top-to-bottom. */}
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {content}
      </FlexWidget>
    </FlexWidget>
  );
}
