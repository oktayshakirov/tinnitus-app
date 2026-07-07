import WidgetKit
import SwiftUI

// "Sound of the Day" — fetches the live zen list from the blog (so new sounds
// appear automatically), picks one per day, downloads its low-quality thumbnail
// and links into the app's sounds tab. Pro-gated via the shared App Group flag.
// `appGroup` is defined in index.swift (same target).

private let soundsURL = "https://www.tinnitushelp.me/api/widget-sounds"

struct SoundItem: Codable {
  let slug: String
  let title: String
  let thumbnail: String
}

struct SoundsResponse: Codable {
  let sounds: [SoundItem]
}

private func soundsIsPro() -> Bool {
  UserDefaults(suiteName: appGroup)?.bool(forKey: "isPro") ?? false
}

enum SoundAPI {
  static func fetchSounds() async -> [SoundItem] {
    guard let url = URL(string: soundsURL) else { return [] }
    guard let (data, response) = try? await URLSession.shared.data(from: url),
      let http = response as? HTTPURLResponse, http.statusCode == 200,
      let decoded = try? JSONDecoder().decode(SoundsResponse.self, from: data)
    else { return [] }
    return decoded.sounds
  }

  static func fetchImage(_ urlString: String) async -> Data? {
    guard !urlString.isEmpty, let url = URL(string: urlString) else { return nil }
    guard let (data, response) = try? await URLSession.shared.data(from: url),
      let http = response as? HTTPURLResponse, http.statusCode == 200
    else { return nil }
    return data
  }
}

struct SoundEntry: TimelineEntry {
  let date: Date
  let isPro: Bool
  let sound: SoundItem?
  let image: Data?
}

struct SoundProvider: TimelineProvider {
  func placeholder(in context: Context) -> SoundEntry {
    SoundEntry(
      date: Date(), isPro: true,
      sound: SoundItem(slug: "", title: "Water Sounds for Relaxation", thumbnail: ""),
      image: nil
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (SoundEntry) -> Void) {
    completion(placeholder(in: context))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<SoundEntry>) -> Void) {
    let nextMidnight =
      Calendar.current.nextDate(
        after: Date(),
        matching: DateComponents(hour: 0, minute: 0, second: 0),
        matchingPolicy: .nextTime
      ) ?? Date().addingTimeInterval(3600)

    guard soundsIsPro() else {
      let entry = SoundEntry(date: Date(), isPro: false, sound: nil, image: nil)
      completion(Timeline(entries: [entry], policy: .after(nextMidnight)))
      return
    }

    Task {
      let sounds = await SoundAPI.fetchSounds()
      var sound: SoundItem? = nil
      var image: Data? = nil
      if !sounds.isEmpty {
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        sound = sounds[(dayOfYear + 3) % sounds.count]
        image = await SoundAPI.fetchImage(sound?.thumbnail ?? "")
      }
      let entry = SoundEntry(date: Date(), isPro: true, sound: sound, image: image)
      completion(Timeline(entries: [entry], policy: .after(nextMidnight)))
    }
  }
}

struct SoundEntryView: View {
  var entry: SoundEntry
  @Environment(\.widgetFamily) var family

  private let accent = Color(red: 0xFF / 255, green: 0xD2 / 255, blue: 0xA6 / 255)
  private let highlight = Color(red: 0xFF / 255, green: 0xDA / 255, blue: 0xB9 / 255)

  private var isSmall: Bool { family == .systemSmall }

  private func deepLink() -> URL? {
    if let slug = entry.sound?.slug, !slug.isEmpty {
      return URL(string: "tinnitushelp://sounds?zen=\(slug)")
    }
    return URL(string: "tinnitushelp://sounds")
  }

  @ViewBuilder private var thumbnail: some View {
    let side: CGFloat = isSmall ? 44 : 64
    if let data = entry.image, let ui = UIImage(data: data) {
      Image(uiImage: ui)
        .resizable()
        .aspectRatio(contentMode: .fill)
        .frame(width: side, height: side)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    } else {
      RoundedRectangle(cornerRadius: 12)
        .fill(Color.white.opacity(0.1))
        .frame(width: side, height: side)
        .overlay(Image(systemName: "music.note").foregroundColor(highlight))
    }
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(isSmall ? "DAILY SOUND" : "SOUND OF THE DAY")
        .font(.system(size: 11, weight: .bold))
        .foregroundColor(accent)
        .lineLimit(1)
        .minimumScaleFactor(0.85)

      if !entry.isPro {
        Text("🔒 Unlock daily sounds with Pro")
          .font(.system(size: isSmall ? 14 : 15, weight: .semibold))
          .foregroundColor(.white)
          .minimumScaleFactor(0.8)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      } else if isSmall {
        thumbnail
        Text(entry.sound?.title ?? "Tap to explore relief sounds")
          .font(.system(size: 13, weight: .medium))
          .foregroundColor(.white)
          .lineLimit(4)
          .minimumScaleFactor(0.6)
          .fixedSize(horizontal: false, vertical: true)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      } else {
        HStack(spacing: 12) {
          thumbnail
          Text(entry.sound?.title ?? "Tap to explore relief sounds")
            .font(.system(size: 16, weight: .medium))
            .foregroundColor(.white)
            .lineLimit(3)
            .minimumScaleFactor(0.8)
          Spacer(minLength: 0)
        }
        Spacer(minLength: 0)
        Text("Tap to listen on TinnitusHelp.me")
          .font(.system(size: 11))
          .foregroundColor(highlight)
      }
    }
    .padding(isSmall ? 14 : 18)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .widgetURL(deepLink())
  }
}

struct SoundOfDayWidget: Widget {
  let kind = "SoundOfDayWidget"

  private let background = Color(red: 0x5B / 255, green: 0x39 / 255, blue: 0x64 / 255)

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: SoundProvider()) { entry in
      if #available(iOS 17.0, *) {
        SoundEntryView(entry: entry).containerBackground(background, for: .widget)
      } else {
        SoundEntryView(entry: entry).background(background)
      }
    }
    .configurationDisplayName("Sound of the Day")
    .description("A relaxing sound to listen to, refreshed every day.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
