export function publicationDecision(priorUserId: string | null, currentUserId: string): "CREATE" | "REPLAY" | "CONFLICT" {
  if (!priorUserId) return "CREATE";
  return priorUserId === currentUserId ? "REPLAY" : "CONFLICT";
}
