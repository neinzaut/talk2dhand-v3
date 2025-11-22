import type { Badge, Language } from "../types"

// Icon mapping for different module types
const MODULE_ICONS: Record<string, string> = {
  "module-1": "🔤", // Alphabet
  "module-2": "🔢", // Numbers
  "module-3": "📝", // Grammar
  "module-4": "💬", // Conversation
  default: "🏆", // Default trophy
}

// Module name mapping for badge titles
const MODULE_NAMES: Record<string, string> = {
  "module-1": "Alphabet Master",
  "module-2": "Numbers Guru",
  "module-3": "Grammar Champion",
  "module-4": "Conversation Expert",
}

/**
 * Creates a themed badge for module completion
 * @param moduleId - The ID of the completed module
 * @param languageCode - The language code (asl or fsl)
 * @param moduleName - The display name of the module
 * @returns A Badge object with language-specific name
 */
export function createModuleBadge(
  moduleId: string,
  languageCode: Language,
  moduleName: string
): Badge {
  const icon = MODULE_ICONS[moduleId] || MODULE_ICONS.default
  const badgeName = MODULE_NAMES[moduleId] || "Module Master"
  const langLabel = languageCode.toUpperCase()
  
  return {
    id: `${moduleId}-${languageCode}`,
    moduleId,
    languageCode,
    name: `${badgeName} - ${langLabel}`,
    description: `Completed all lessons in ${moduleName} (${langLabel})`,
    icon,
    earnedAt: Date.now(),
  }
}

/**
 * Get the icon for a specific module
 */
export function getModuleIcon(moduleId: string): string {
  return MODULE_ICONS[moduleId] || MODULE_ICONS.default
}
