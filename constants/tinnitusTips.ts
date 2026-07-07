// Curated daily tips shown in the home-screen widget.
//
// These are general well-being and coping suggestions drawn from common
// tinnitus self-management guidance and our own articles — they are NOT medical
// advice. The widget picks one per day using getTodaysTip() so every user sees
// the same tip on a given date, fully offline. To add/adjust tips, just edit
// this list (the count can change freely — rotation adapts automatically).

export const TINNITUS_TIPS: string[] = [
  "Avoid complete silence — soft background sound makes tinnitus blend in and feel quieter.",
  "Try a fan, soft music, or nature sounds at night to help you drift off.",
  "Keep a consistent sleep schedule — better sleep often means less tinnitus distress.",
  "Stress can make tinnitus louder. A few minutes of slow breathing can help settle it.",
  "Protect your ears at concerts and loud events — keep earplugs handy.",
  "Follow the 60/60 rule: keep headphones under 60% volume for no more than 60 minutes.",
  "Notice if caffeine affects your tinnitus — try cutting back for a few days and compare.",
  "Alcohol can worsen tinnitus for some people. Track how you feel after drinking.",
  "Gentle exercise like walking boosts circulation and lowers stress.",
  "Stay hydrated throughout the day.",
  "When tinnitus flares, shift your focus to a task or hobby rather than the sound.",
  "The less you monitor your tinnitus, the more your brain learns to tune it out.",
  "Try a guided relaxation or meditation before bed.",
  "Warm baths and stretching can ease the tension that often amplifies tinnitus.",
  "Reduce very salty meals if you notice they make your ears feel fuller.",
  "Ask your doctor to review your medications — some can affect tinnitus.",
  "Get your hearing checked; treating hearing loss often reduces tinnitus.",
  "Hearing aids can make tinnitus less noticeable by bringing back everyday sounds.",
  "Jaw and neck tension (TMJ) can feed tinnitus — relax your jaw and unclench.",
  "Keep earbuds clean and avoid pushing earwax deeper with cotton swabs.",
  "If earwax builds up, have it removed professionally rather than at home.",
  "Take sound breaks — step outside and let natural sounds fill the quiet.",
  "Nicotine narrows blood vessels and can worsen tinnitus. Cutting back may help.",
  "Anxiety and tinnitus feed each other; easing one usually eases the other.",
  "Keep a simple journal to spot your personal tinnitus triggers.",
  "On hard days, remind yourself: spikes are temporary and usually settle.",
  "White, pink, or brown noise can be soothing — try each and see what fits.",
  "Fill quiet rooms with a low background sound instead of straining against silence.",
  "Limit long stretches in loud environments; give your ears regular rest.",
  "A short daytime nap can help if tinnitus disrupted your night.",
  "Slow belly breathing calms your nervous system and can lower tinnitus stress.",
  "Progressive muscle relaxation releases the tension that amplifies ringing.",
  "Connect with others who have tinnitus — you're not alone in this.",
  "Cognitive behavioral therapy (CBT) is one of the most effective tinnitus tools.",
  "Be patient with habituation — most people find tinnitus bothers them less over time.",
  "Avoid checking whether your tinnitus is still there; attention makes it louder.",
  "Keep your mind engaged — boredom makes tinnitus easier to notice.",
  "Wind down screens and stress an hour before bed for calmer nights.",
  "Go easy on afternoon caffeine to protect your sleep.",
  "Balanced meals and steady blood sugar support overall ear and nerve health.",
  "Step away from stimulants when you feel a flare building.",
  "Sunlight and daily movement lift your mood, which softens tinnitus distress.",
  "Try a bedside sound machine set to a gentle, steady tone.",
  "Lower the TV and music a little — protecting your hearing protects your future.",
  "Lean on a calming routine to shift focus away from the sound.",
  "If tinnitus is new, sudden, or only in one ear, see a professional to be safe.",
  "Don't fear the silence at night — a soft sound pillow can ease you to sleep.",
  "Short mindfulness sessions teach your brain to let the sound fade to the background.",
  "Manage stress proactively — it's one of the biggest tinnitus amplifiers.",
  "Celebrate small wins: every calm, distracted moment is real progress.",
];

// Day-of-year index so the tip is stable for a given calendar day and rotates
// through the whole list over time, wrapping automatically.
export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export function getTodaysTip(date: Date = new Date()): string {
  const index = getDayOfYear(date) % TINNITUS_TIPS.length;
  return TINNITUS_TIPS[index];
}
