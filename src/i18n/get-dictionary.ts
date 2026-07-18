import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  id: () => import("./dictionaries/id.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  const loader = dictionaries[locale] ?? dictionaries.en;
  return loader();
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
