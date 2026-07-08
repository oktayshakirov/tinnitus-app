import React from "react";
import { FlexWidget, TextWidget, ImageWidget } from "react-native-android-widget";
import type { SoundItem } from "@/services/widget/dailySound";
import { soundDeepLink } from "@/services/widget/dailySound";

const BG = "#5B3964";
const TEXT = "#FFFFFF";
const HIGHLIGHT = "#FFDAB9";
const ACCENT = "#FFD2A6";

interface Props {
  isPro: boolean;
  sound: SoundItem | null;
  width?: number;
}

export function SoundWidget({ isPro, sound, width = 0 }: Props) {
  const isWide = width >= 220;
  const uri = sound ? soundDeepLink(sound.slug) : "tinnitushelp://sounds";
  const thumb = isWide ? 110 : 64;

  let body: React.ReactElement;
  if (!isPro) {
    body = (
      <TextWidget
        text="🔒 Unlock daily sounds with Pro"
        style={{ fontSize: isWide ? 15 : 13, color: TEXT }}
      />
    );
  } else {
    body = (
      <FlexWidget
        style={{
          flexDirection: isWide ? "row" : "column",
          alignItems: "center",
          width: "match_parent",
        }}
      >
        {sound?.thumbnail ? (
          <ImageWidget
            image={sound.thumbnail as `https:${string}`}
            imageWidth={thumb}
            imageHeight={thumb}
            radius={14}
            style={{
              height: thumb,
              width: thumb,
              marginRight: isWide ? 14 : 0,
              marginBottom: isWide ? 0 : 10,
            }}
          />
        ) : null}
        <TextWidget
          text={sound?.title ?? "Tap to explore relief sounds"}
          style={{
            fontSize: isWide ? 16 : 14,
            color: TEXT,
            ...(isWide ? { flex: 1 } : {}),
          }}
        />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri }}
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
        text={isWide ? "SOUND OF THE DAY" : "DAILY SOUND"}
        style={{ fontSize: 11, fontFamily: "sans-serif-medium", color: ACCENT }}
      />

      {/* Fills the space between header and footer, centering the content. */}
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {body}
      </FlexWidget>

      <TextWidget
        text="Tap to listen on TinnitusHelp.me"
        style={{ fontSize: 11, color: HIGHLIGHT }}
      />
    </FlexWidget>
  );
}
