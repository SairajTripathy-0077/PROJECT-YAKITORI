import type { CompanionEvent, GreetingMetadata } from '../types/game';

export const GREETING_POOLS: Record<CompanionEvent, string[]> = {
  LOGIN: [
    "Yay, you're back, {playerName}! I was waiting for you! Let's see what fun things we can knock out today!",
    "Oh hey, {playerName}! So happy to see you again! Grab some water, get cozy, and let's do our best today!",
    "Yay! Honestly, seeing you just made my whole day, {playerName}! What are we tackling first together?",
    "Heeey {playerName}! Ready to get some quests done today? Don't worry, I've got your back the whole way!",
    "Welcome back, {playerName}! I totally knew you'd show up today! Let's make today super awesome!"
  ],

  NEW_USER: [
    "Hey there! I'm so excited to finally meet you, {playerName}! We're going to make an awesome team, I promise!",
    "Oh yay, you're finally here! Don't stress about doing everything at once, we'll take it one step at a time. I'm right here with you!",
    "Welcome, {playerName}! Seriously so happy you're here. Let's make your daily goals actually fun to crush!"
  ],

  TASK_COMPLETE: [
    "Yay, you did it! You wrapped up '{questTitle}'! That gave you +{xpEarned} XP for your {attribute} and +{goldEarned} gold! Seriously, super proud of you, {playerName}!",
    "Nice one, {playerName}! '{questTitle}' is done and dusted! You just grabbed +{xpEarned} {attribute} XP and pocketed +{goldEarned} gold. Look at you go!",
    "Yes! You finished '{questTitle}'! That's another +{xpEarned} XP towards your {attribute} and +{goldEarned} gold in the bag. Keep this roll going, buddy!",
    "Look at that, '{questTitle}' is finished! You earned +{xpEarned} XP for {attribute} and got +{goldEarned} gold. Honestly, you're on fire right now, {playerName}!",
    "Awesome job on '{questTitle}'! That gave your {attribute} a nice +{xpEarned} XP boost plus +{goldEarned} gold. Take a quick breath, you're doing amazing!"
  ],

  LEVEL_UP: [
    "OH MY GOSH, LEVEL {newLevel}?! You actually leveled up, {playerName}! You unlocked '{title}' and +{goldEarned} gold! High five, you earned this so much!",
    "YESSS! Level {newLevel}, let's go! Look at you rocking that new '{title}' title, plus you got +{goldEarned} gold! I knew you could do it, {playerName}!",
    "Whoa, {playerName}, you're already at Level {newLevel}?! And look, you've got +{goldEarned} gold and the title '{title}' now! Honestly so cool seeing you grow like this!",
    "Huge milestone, buddy! Level {newLevel} looks so good on you! Pocket that +{goldEarned} gold and wear that '{title}' title proudly!"
  ],

  INTERACTIVE_CLICK: [
    "Hey! Just checking in on you. Remember to take a quick stretch and drink some water, okay?",
    "Need a little boost, {playerName}? You're doing way better than you think. Let's keep going!",
    "I'm right here cheering you on! Even knocking out one small task today is a big win.",
    "Hey buddy! Whenever you're ready, let's knock out another one together!"
  ],

  STREAK: [
    "Whoa, {streakDays} days in a row?! {playerName}, you're seriously unstoppable right now!",
    "A {streakDays}-day streak?! Look at that consistency, buddy! Keep showing up like this!"
  ]
};

// Memory cache to prevent repeating the exact same greeting consecutively
const lastUsedIndices: Record<CompanionEvent, number> = {
  LOGIN: -1,
  NEW_USER: -1,
  TASK_COMPLETE: -1,
  LEVEL_UP: -1,
  INTERACTIVE_CLICK: -1,
  STREAK: -1,
};

/**
 * Select a non-repeating randomized greeting from the pool and interpolate variables.
 */
export function getGreetingMessage(event: CompanionEvent, metadata?: GreetingMetadata): string {
  if (metadata?.customMessage) {
    return interpolateVariables(metadata.customMessage, metadata);
  }

  const pool = GREETING_POOLS[event] || GREETING_POOLS.LOGIN;
  let nextIdx = Math.floor(Math.random() * pool.length);

  // If pool has more than 1 item, prevent repeating the same index twice in a row
  if (pool.length > 1 && nextIdx === lastUsedIndices[event]) {
    nextIdx = (nextIdx + 1) % pool.length;
  }
  lastUsedIndices[event] = nextIdx;

  const rawTemplate = pool[nextIdx];
  return interpolateVariables(rawTemplate, metadata);
}

function interpolateVariables(template: string, metadata?: GreetingMetadata): string {
  const playerName = metadata?.playerName?.trim() || 'Hero';
  const questTitle = metadata?.questTitle || 'Quest';
  const xpEarned = metadata?.xpEarned !== undefined ? String(metadata.xpEarned) : '25';
  const goldEarned = metadata?.goldEarned !== undefined 
    ? String(metadata.goldEarned) 
    : (metadata?.rewardGold !== undefined ? String(metadata.rewardGold) : '10');
  const attribute = metadata?.attribute ? metadata.attribute.toUpperCase() : 'SKILL';
  const newLevel = metadata?.newLevel !== undefined ? String(metadata.newLevel) : '2';
  const title = metadata?.title || 'Pixel Knight';
  const streakDays = metadata?.streakDays !== undefined ? String(metadata.streakDays) : '1';

  return template
    .replace(/{playerName}/g, playerName)
    .replace(/{questTitle}/g, questTitle)
    .replace(/{xpEarned}/g, xpEarned)
    .replace(/{goldEarned}/g, goldEarned)
    .replace(/{attribute}/g, attribute)
    .replace(/{newLevel}/g, newLevel)
    .replace(/{title}/g, title)
    .replace(/{streakDays}/g, streakDays);
}
