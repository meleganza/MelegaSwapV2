/** A late response is shown only when it belongs to the current input. */
export function readGenerationCurrent(issued: number, current: number): boolean {
  return issued === current
}
