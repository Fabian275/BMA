import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translations from "./translations.json";
import axios from "axios";

export const initI18n = async (token: string | null) => {
  const fetchDefaultLanguage = async () => {
    if (!token) {
      return "de";
    }
    try {
      const response = await axios.get(
        "http://localhost:5001/api/default-language",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data.language;
    } catch (error) {
      console.error("Fehler beim Laden der Standardsprache:", error);
      return "de";
    }
  };
  

  const defaultLanguage = await fetchDefaultLanguage();

  await i18n.use(initReactI18next).init({
    resources: translations,
    lng: defaultLanguage || "de",
    fallbackLng: "de",
    interpolation: {
      escapeValue: false,
    },
  });
};

export default i18n;
