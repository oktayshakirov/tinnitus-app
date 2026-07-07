import WidgetKit
import SwiftUI

// Shared with the app via the App Group. The app (JS) writes "tips" (a JSON
// array of strings) and "isPro" (Bool); this extension reads them and rotates
// the tip daily on its own timeline, so it keeps working even if the app is
// never opened.
let appGroup = "group.com.shadev.tinnitushelpme"

struct TipEntry: TimelineEntry {
  let date: Date
  let tip: String
  let isPro: Bool
}

private func loadTips() -> [String] {
  let defaults = UserDefaults(suiteName: appGroup)
  if let raw = defaults?.string(forKey: "tips"),
     let data = raw.data(using: .utf8),
     let arr = try? JSONDecoder().decode([String].self, from: data),
     !arr.isEmpty {
    return arr
  }
  return ["Open TinnitusHelp.me to load your daily tips."]
}

private func loadIsPro() -> Bool {
  UserDefaults(suiteName: appGroup)?.bool(forKey: "isPro") ?? false
}

private func tipForToday(_ date: Date) -> String {
  let tips = loadTips()
  let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: date) ?? 1
  return tips[(dayOfYear - 1) % tips.count]
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> TipEntry {
    TipEntry(date: Date(), tip: "Your daily tinnitus tip appears here.", isPro: true)
  }

  func getSnapshot(in context: Context, completion: @escaping (TipEntry) -> Void) {
    completion(entry(for: Date()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<TipEntry>) -> Void) {
    let entry = entry(for: Date())
    // Refresh at the next midnight so the tip advances one day at a time.
    let nextMidnight =
      Calendar.current.nextDate(
        after: Date(),
        matching: DateComponents(hour: 0, minute: 0, second: 0),
        matchingPolicy: .nextTime
      ) ?? Date().addingTimeInterval(3600)
    completion(Timeline(entries: [entry], policy: .after(nextMidnight)))
  }

  private func entry(for date: Date) -> TipEntry {
    TipEntry(date: date, tip: tipForToday(date), isPro: loadIsPro())
  }
}

struct TinnitusTipEntryView: View {
  var entry: TipEntry
  @Environment(\.widgetFamily) var family

  private let accent = Color(red: 0xFF / 255, green: 0xD2 / 255, blue: 0xA6 / 255)
  private let highlight = Color(red: 0xFF / 255, green: 0xDA / 255, blue: 0xB9 / 255)

  private var isSmall: Bool { family == .systemSmall }

  var body: some View {
    VStack(alignment: .leading, spacing: isSmall ? 8 : 8) {
      // Small has a narrow width, so use a shorter one-line title.
      Text(isSmall ? "DAILY TIP" : "DAILY TINNITUS TIP")
        .font(.system(size: 11, weight: .bold))
        .foregroundColor(accent)
        .lineLimit(1)
        .minimumScaleFactor(0.85)

      if entry.isPro {
        Text(entry.tip)
          // Smaller on 2x2 so more words fit per line; expands to fill and
          // vertically centers in the remaining space so there's no dead area.
          .font(.system(size: isSmall ? 13 : 17, weight: .medium))
          .foregroundColor(.white)
          .lineLimit(isSmall ? 10 : 4)
          .minimumScaleFactor(0.7)
          .lineSpacing(isSmall ? 2 : 0)
          .fixedSize(horizontal: false, vertical: true)
          .frame(
            maxWidth: .infinity,
            maxHeight: isSmall ? .infinity : nil,
            alignment: .leading
          )
      } else {
        Text(isSmall ? "🔒 Unlock daily tips with Pro" : "🔒 Unlock a fresh daily tip with Pro")
          .font(.system(size: isSmall ? 14 : 15, weight: .semibold))
          .foregroundColor(.white)
          .minimumScaleFactor(0.8)
          .frame(
            maxWidth: .infinity,
            maxHeight: isSmall ? .infinity : nil,
            alignment: .leading
          )
      }

      // Footer only on medium — on small every row counts, so we drop it and
      // let the tip use the full height.
      if !isSmall {
        Spacer(minLength: 0)
        Text("Tap to read more on TinnitusHelp.me")
          .font(.system(size: 11))
          .foregroundColor(highlight)
      }
    }
    .padding(isSmall ? 14 : 18)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .widgetURL(URL(string: "tinnitushelp://posts"))
  }
}

@main
struct TinnitusWidgetBundle: WidgetBundle {
  var body: some Widget {
    CheckinWidget()
    TinnitusTipWidget()
    SoundOfDayWidget()
  }
}

struct TinnitusTipWidget: Widget {
  let kind = "TinnitusTipWidget"

  private let background = Color(red: 0x5B / 255, green: 0x39 / 255, blue: 0x64 / 255)

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      if #available(iOS 17.0, *) {
        TinnitusTipEntryView(entry: entry)
          .containerBackground(background, for: .widget)
      } else {
        TinnitusTipEntryView(entry: entry)
          .background(background)
      }
    }
    .configurationDisplayName("Daily Tinnitus Tip")
    .description("A helpful tinnitus tip that changes every day.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
