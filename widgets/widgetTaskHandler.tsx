import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TinnitusTipWidget } from "./TinnitusTipWidget";
import { SoundWidget } from "./SoundWidget";
import { CheckinWidget } from "./CheckinWidget";
import { WIDGET_IS_PRO_KEY } from "@/services/widget/widgetSync";
import { fetchTodaysSound } from "@/services/widget/dailySound";
import { buildWidgetData } from "@/services/checkin";

const RENDER_ACTIONS = ["WIDGET_ADDED", "WIDGET_UPDATE", "WIDGET_RESIZED"];

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction } = props;
  if (!RENDER_ACTIONS.includes(widgetAction)) return;

  const isPro = (await AsyncStorage.getItem(WIDGET_IS_PRO_KEY)) === "1";

  switch (widgetInfo.widgetName) {
    case "TinnitusTip":
      props.renderWidget(
        <TinnitusTipWidget isPro={isPro} width={widgetInfo.width} />
      );
      break;
    case "TinnitusSound": {
      // Only hit the network when the user is actually Pro.
      const sound = isPro ? await fetchTodaysSound() : null;
      props.renderWidget(
        <SoundWidget isPro={isPro} sound={sound} width={widgetInfo.width} />
      );
      break;
    }
    case "TinnitusCheckin": {
      const data = isPro ? await buildWidgetData() : null;
      props.renderWidget(
        <CheckinWidget isPro={isPro} data={data} width={widgetInfo.width} />
      );
      break;
    }
    default:
      break;
  }
}
