export const emojiCategories = {
  recent: "Recently Used",
  people: "Smileys & People",
  nature: "Animals & Nature",
  foods: "Food & Drink",
  activity: "Activities",
  places: "Travel & Places",
  objects: "Objects",
  symbols: "Symbols",
  flags: "Flags",
};

export const getEmojiUrl = (unified, style = "apple") => {
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-${style}@14.0.0/img/emoji-${style}/64/${unified}.png`;
};

export const transformEmoji = (emojiData) => {
  return {
    id: emojiData.id,
    name: emojiData.name,
    native: emojiData.native,
    unified: emojiData.unified,
    keywords: emojiData.keywords,
    url: getEmojiUrl(emojiData.unified),
  };
};
