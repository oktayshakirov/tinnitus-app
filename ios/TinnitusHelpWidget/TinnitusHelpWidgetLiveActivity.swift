//
//  TinnitusHelpWidgetLiveActivity.swift
//  TinnitusHelpWidget
//
//  Created by Oktay Shakirov on 07.07.26.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct TinnitusHelpWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct TinnitusHelpWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TinnitusHelpWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension TinnitusHelpWidgetAttributes {
    fileprivate static var preview: TinnitusHelpWidgetAttributes {
        TinnitusHelpWidgetAttributes(name: "World")
    }
}

extension TinnitusHelpWidgetAttributes.ContentState {
    fileprivate static var smiley: TinnitusHelpWidgetAttributes.ContentState {
        TinnitusHelpWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: TinnitusHelpWidgetAttributes.ContentState {
         TinnitusHelpWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: TinnitusHelpWidgetAttributes.preview) {
   TinnitusHelpWidgetLiveActivity()
} contentStates: {
    TinnitusHelpWidgetAttributes.ContentState.smiley
    TinnitusHelpWidgetAttributes.ContentState.starEyes
}
