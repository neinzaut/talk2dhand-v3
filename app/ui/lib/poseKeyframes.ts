/**
 * Pose Keyframe Library for Stick Figure Avatar
 * Defines 2D pose coordinates and easing functions for sign language animation
 */

export interface PosePoint {
  x: number // Normalized 0-1 coordinate
  y: number // Normalized 0-1 coordinate
}

export interface SignPose {
  head: PosePoint
  leftShoulder: PosePoint
  rightShoulder: PosePoint
  leftElbow: PosePoint
  rightElbow: PosePoint
  leftWrist: PosePoint
  rightWrist: PosePoint
  hip: PosePoint
}

/**
 * Easing Functions for smooth animations
 */

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3
  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

export function linear(t: number): number {
  return t
}

/**
 * Interpolate between two poses using an easing function
 */
export function interpolatePose(
  fromPose: SignPose,
  toPose: SignPose,
  progress: number,
  easingFn: (t: number) => number = easeInOutCubic
): SignPose {
  const t = easingFn(Math.max(0, Math.min(1, progress)))
  
  const interpolatePoint = (from: PosePoint, to: PosePoint): PosePoint => ({
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  })

  return {
    head: interpolatePoint(fromPose.head, toPose.head),
    leftShoulder: interpolatePoint(fromPose.leftShoulder, toPose.leftShoulder),
    rightShoulder: interpolatePoint(fromPose.rightShoulder, toPose.rightShoulder),
    leftElbow: interpolatePoint(fromPose.leftElbow, toPose.leftElbow),
    rightElbow: interpolatePoint(fromPose.rightElbow, toPose.rightElbow),
    leftWrist: interpolatePoint(fromPose.leftWrist, toPose.leftWrist),
    rightWrist: interpolatePoint(fromPose.rightWrist, toPose.rightWrist),
    hip: interpolatePoint(fromPose.hip, toPose.hip),
  }
}

/**
 * Neutral/Rest Pose - default standing position
 */
export const NEUTRAL_POSE: SignPose = {
  head: { x: 0.5, y: 0.15 },
  leftShoulder: { x: 0.35, y: 0.3 },
  rightShoulder: { x: 0.65, y: 0.3 },
  leftElbow: { x: 0.3, y: 0.5 },
  rightElbow: { x: 0.7, y: 0.5 },
  leftWrist: { x: 0.28, y: 0.7 },
  rightWrist: { x: 0.72, y: 0.7 },
  hip: { x: 0.5, y: 0.8 },
}

/**
 * Sign Language Pose Library
 * All coordinates are normalized (0-1) where:
 * - x: 0 = left edge, 1 = right edge
 * - y: 0 = top edge, 1 = bottom edge
 */
export const SIGN_POSES: Record<string, SignPose> = {
  // BAD - hands down with thumbs down gesture
  bad: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.35, y: 0.5 },
    rightElbow: { x: 0.65, y: 0.5 },
    leftWrist: { x: 0.35, y: 0.75 },
    rightWrist: { x: 0.65, y: 0.75 },
    hip: { x: 0.5, y: 0.8 },
  },

  // DRINK - hand to mouth gesture
  drink: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.6, y: 0.35 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.55, y: 0.2 },
    hip: { x: 0.5, y: 0.8 },
  },

  // FINE - thumbs up gesture
  fine: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.65, y: 0.45 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.65, y: 0.25 },
    hip: { x: 0.5, y: 0.8 },
  },

  // FOOD - hand to mouth eating gesture
  food: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.6, y: 0.4 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.52, y: 0.22 },
    hip: { x: 0.5, y: 0.8 },
  },

  // GO - pointing forward gesture
  go: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.7, y: 0.35 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.85, y: 0.35 },
    hip: { x: 0.5, y: 0.8 },
  },

  // HAPPY - hands up cheerful gesture
  happy: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.25, y: 0.25 },
    rightElbow: { x: 0.75, y: 0.25 },
    leftWrist: { x: 0.2, y: 0.15 },
    rightWrist: { x: 0.8, y: 0.15 },
    hip: { x: 0.5, y: 0.8 },
  },

  // HAVE - hands to chest possession gesture
  have: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.32, y: 0.4 },
    rightElbow: { x: 0.68, y: 0.4 },
    leftWrist: { x: 0.4, y: 0.35 },
    rightWrist: { x: 0.6, y: 0.35 },
    hip: { x: 0.5, y: 0.8 },
  },

  // HESHEIT - pointing to side
  hesheit: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.7, y: 0.4 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.85, y: 0.4 },
    hip: { x: 0.5, y: 0.8 },
  },

  // HELLO - waving hand
  hello: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.7, y: 0.25 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.78, y: 0.15 },
    hip: { x: 0.5, y: 0.8 },
  },

  // LIKE - thumbs up to chest
  like: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.6, y: 0.4 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.55, y: 0.3 },
    hip: { x: 0.5, y: 0.8 },
  },

  // MINEMY - pointing to self
  minemy: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.6, y: 0.4 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.5, y: 0.35 },
    hip: { x: 0.5, y: 0.8 },
  },

  // NOT - hand wave negation
  not: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.6, y: 0.35 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.7, y: 0.3 },
    hip: { x: 0.5, y: 0.8 },
  },

  // NOW - both hands down at sides
  now: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.32, y: 0.5 },
    rightElbow: { x: 0.68, y: 0.5 },
    leftWrist: { x: 0.3, y: 0.68 },
    rightWrist: { x: 0.7, y: 0.68 },
    hip: { x: 0.5, y: 0.8 },
  },

  // SAD - hands down drooping
  sad: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.32, y: 0.55 },
    rightElbow: { x: 0.68, y: 0.55 },
    leftWrist: { x: 0.35, y: 0.75 },
    rightWrist: { x: 0.65, y: 0.75 },
    hip: { x: 0.5, y: 0.8 },
  },

  // SEE - pointing to eyes
  see: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.58, y: 0.25 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.52, y: 0.18 },
    hip: { x: 0.5, y: 0.8 },
  },

  // THANKYOU - hand from chin outward
  thankyou: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.58, y: 0.3 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.65, y: 0.35 },
    hip: { x: 0.5, y: 0.8 },
  },

  // WEUS - inclusive gesture both hands
  weus: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.25, y: 0.4 },
    rightElbow: { x: 0.75, y: 0.4 },
    leftWrist: { x: 0.2, y: 0.45 },
    rightWrist: { x: 0.8, y: 0.45 },
    hip: { x: 0.5, y: 0.8 },
  },

  // WHERE - questioning gesture hands up
  where: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.28, y: 0.35 },
    rightElbow: { x: 0.72, y: 0.35 },
    leftWrist: { x: 0.25, y: 0.22 },
    rightWrist: { x: 0.75, y: 0.22 },
    hip: { x: 0.5, y: 0.8 },
  },

  // WILL - forward motion gesture
  will: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.68, y: 0.4 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.75, y: 0.4 },
    hip: { x: 0.5, y: 0.8 },
  },

  // YOURSELF - pointing outward
  yourself: {
    head: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.35, y: 0.3 },
    rightShoulder: { x: 0.65, y: 0.3 },
    leftElbow: { x: 0.3, y: 0.5 },
    rightElbow: { x: 0.7, y: 0.38 },
    leftWrist: { x: 0.28, y: 0.7 },
    rightWrist: { x: 0.82, y: 0.38 },
    hip: { x: 0.5, y: 0.8 },
  },
}

/**
 * Get pose for a sign word, returns neutral pose if not found
 */
export function getPoseForSign(signWord: string): SignPose {
  const normalizedWord = signWord.toLowerCase().trim()
  return SIGN_POSES[normalizedWord] || NEUTRAL_POSE
}

/**
 * Check if a sign has a defined pose
 */
export function hasPoseForSign(signWord: string): boolean {
  const normalizedWord = signWord.toLowerCase().trim()
  return normalizedWord in SIGN_POSES
}
