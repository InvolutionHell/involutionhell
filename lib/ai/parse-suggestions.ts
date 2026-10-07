export function parseSuggestionJson(text: string): unknown[] {
  let cleanedText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  cleanedText = cleanedText.replace(/“/g, '"').replace(/”/g, '"');
  cleanedText = cleanedText.replace(
    /"(title|label|action)"?\s*[：:]\s*"/g,
    '"$1":"',
  );
  cleanedText = cleanedText
    .replace(/"\s*，\s*"/g, '","')
    .replace(/}\s*，\s*{/g, "},{");

  const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    cleanedText = arrayMatch[0];
  }

  try {
    const parsed: unknown = JSON.parse(cleanedText);
    return Array.isArray(parsed) ? parsed : [];
  } catch (parseError) {
    // 编号列表 / 多个数组拼接等非法外壳：逐个提取对象
    const objects = (cleanedText.match(/\{[^{}]*\}/g) ?? []).flatMap(
      (chunk) => {
        try {
          return [JSON.parse(chunk)];
        } catch {
          return [];
        }
      },
    );
    if (objects.length === 0) throw parseError;
    return objects;
  }
}
