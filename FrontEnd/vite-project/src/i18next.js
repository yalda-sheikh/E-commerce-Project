import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          home: "Home",
          products: "Products",
          login: "Login",
          cart: "Cart",
          welcome: "Welcome to our store"
        }
      },
      fa: {
        translation: {
          home: "خانه",
          products: "محصولات",
          login: "ورود",
          cart: "سبد خرید",
          welcome: "به فروشگاه ما خوش آمدید"
        }
      }
    },

    fallbackLng: "fa",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;