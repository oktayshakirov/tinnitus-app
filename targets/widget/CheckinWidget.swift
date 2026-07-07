import WidgetKit
import SwiftUI

// "Daily Check-in" — shows today's check-in status, streak and (medium size) a
// 7-day level chart. Data is written to the App Group by the app whenever the
// user saves a check-in ("checkin" key). Pro-gated like the other widgets.

struct CheckinData: Codable {
  let streak: Int
  let todayLevel: Int // 0 = not checked in today
  let last7: [Int]
}

private func loadCheckin() -> CheckinData {
  let defaults = UserDefaults(suiteName: appGroup)
  if let raw = defaults?.string(forKey: "checkin"),
     let data = raw.data(using: .utf8),
     let decoded = try? JSONDecoder().decode(CheckinData.self, from: data) {
    return decoded
  }
  return CheckinData(streak: 0, todayLevel: 0, last7: [0, 0, 0, 0, 0, 0, 0])
}

private func checkinIsPro() -> Bool {
  UserDefaults(suiteName: appGroup)?.bool(forKey: "isPro") ?? false
}

private let levelEmoji = ["😌", "🙂", "😐", "😣", "😖"]
private let levelColors: [Color] = [
  Color(red: 0x4A / 255, green: 0xDE / 255, blue: 0x80 / 255),
  Color(red: 0xA3 / 255, green: 0xE6 / 255, blue: 0x35 / 255),
  Color(red: 0xFA / 255, green: 0xCC / 255, blue: 0x15 / 255),
  Color(red: 0xFB / 255, green: 0x92 / 255, blue: 0x3C / 255),
  Color(red: 0xF8 / 255, green: 0x71 / 255, blue: 0x71 / 255),
]

struct CheckinEntry: TimelineEntry {
  let date: Date
  let isPro: Bool
  let data: CheckinData
}

struct CheckinProvider: TimelineProvider {
  func placeholder(in context: Context) -> CheckinEntry {
    CheckinEntry(
      date: Date(), isPro: true,
      data: CheckinData(streak: 3, todayLevel: 2, last7: [2, 3, 2, 0, 1, 2, 2])
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (CheckinEntry) -> Void) {
    completion(placeholder(in: context))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<CheckinEntry>) -> Void) {
    let entry = CheckinEntry(date: Date(), isPro: checkinIsPro(), data: loadCheckin())
    // Refresh at midnight so "today" resets even if the app isn't opened.
    let nextMidnight =
      Calendar.current.nextDate(
        after: Date(),
        matching: DateComponents(hour: 0, minute: 0, second: 0),
        matchingPolicy: .nextTime
      ) ?? Date().addingTimeInterval(3600)
    completion(Timeline(entries: [entry], policy: .after(nextMidnight)))
  }
}

struct CheckinEntryView: View {
  var entry: CheckinEntry
  @Environment(\.widgetFamily) var family

  private let accent = Color(red: 0xFF / 255, green: 0xD2 / 255, blue: 0xA6 / 255)
  private let highlight = Color(red: 0xFF / 255, green: 0xDA / 255, blue: 0xB9 / 255)

  private var isSmall: Bool { family == .systemSmall }

  private var checkedIn: Bool { entry.data.todayLevel > 0 }

  private var bigEmoji: String {
    checkedIn ? levelEmoji[min(max(entry.data.todayLevel, 1), 5) - 1] : "📝"
  }

  private var statusText: String {
    checkedIn ? "Logged today" : "How's your tinnitus today?"
  }

  private var streakText: String {
    if entry.data.streak > 0 {
      return checkedIn
        ? "🔥 \(entry.data.streak)-day streak - keep it up!"
        : "🔥 \(entry.data.streak)-day streak - check in!"
    }
    return "Start your streak today"
  }

  private var streakShort: String {
    entry.data.streak > 0
      ? "🔥 \(entry.data.streak)-day streak" : "Start your streak"
  }

  @ViewBuilder private var chart: some View {
    HStack(alignment: .bottom, spacing: 0) {
      ForEach(0..<entry.data.last7.count, id: \.self) { i in
        let lv = entry.data.last7[i]
        RoundedRectangle(cornerRadius: 3)
          .fill(lv > 0 ? levelColors[lv - 1] : Color.white.opacity(0.15))
          .frame(width: 16, height: lv > 0 ? CGFloat(10 + (lv - 1) * 9) : 5)
          .frame(maxWidth: .infinity)
      }
    }
  }

  var body: some View {
    VStack(alignment: .leading, spacing: isSmall ? 6 : 8) {
      Text(isSmall ? "JOURNAL" : "DAILY JOURNAL")
        .font(.system(size: 11, weight: .bold))
        .foregroundColor(accent)
        .lineLimit(1)
        .minimumScaleFactor(0.85)

      if !entry.isPro {
        Text("🔒 Unlock the Journal widget with Pro")
          .font(.system(size: isSmall ? 13 : 15, weight: .semibold))
          .foregroundColor(.white)
          .minimumScaleFactor(0.7)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      } else if isSmall {
        Spacer(minLength: 0)
        Text(bigEmoji).font(.system(size: 40))
        Text(checkedIn ? "Logged today" : "Tap to log today")
          .font(.system(size: 12, weight: .medium))
          .foregroundColor(.white)
          .lineLimit(1)
          .minimumScaleFactor(0.8)
        Spacer(minLength: 0)
        Text(streakShort)
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(highlight)
          .lineLimit(1)
          .minimumScaleFactor(0.8)
      } else {
        HStack(alignment: .top) {
          VStack(alignment: .leading, spacing: 4) {
            Text(statusText)
              .font(.system(size: 16, weight: .medium))
              .foregroundColor(.white)
              .lineLimit(2)
            Text(streakText)
              .font(.system(size: 13, weight: .semibold))
              .foregroundColor(highlight)
              .lineLimit(1)
              .minimumScaleFactor(0.7)
          }
          Spacer(minLength: 8)
          Text(bigEmoji).font(.system(size: 42))
        }
        Spacer(minLength: 0)
        chart
      }
    }
    .padding(isSmall ? 14 : 18)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .widgetURL(URL(string: "tinnitushelp://checkin"))
  }
}

struct CheckinWidget: Widget {
  let kind = "CheckinWidget"

  private let background = Color(red: 0x5B / 255, green: 0x39 / 255, blue: 0x64 / 255)

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: CheckinProvider()) { entry in
      if #available(iOS 17.0, *) {
        CheckinEntryView(entry: entry).containerBackground(background, for: .widget)
      } else {
        CheckinEntryView(entry: entry).background(background)
      }
    }
    .configurationDisplayName("Journal")
    .description("Your journal streak and today's tinnitus level at a glance.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
