import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'nl' | 'en';

interface LanguageContextType {
  currentLanguage: Language;
  switchLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  nl: {
    // Nav
    'nav_home': 'Home',
    'nav_collection': 'Collectie',
    'nav_sell': 'Verkopen',
    'nav_login': 'Inloggen',
    'nav_logout': 'Uitloggen',
    'nav_dashboard': 'Dashboard',
    'nav_admin': 'Admin Panel',
    'nav_discover': 'Ontdek Nu',
    
    // Hero
    'hero_badge': 'De Nederlandse Premium Standaard',
    'hero_title_1': 'HERGEBRUIKTE',
    'hero_title_2': 'MEESTERWERKEN.',
    'hero_desc': "Amsterdam's meest exclusieve marktplaats voor geverifieerde tech en designmeubels. Gecureerd door experts, geleverd met zorg.",
    'hero_cta_shop': 'Shop de Collectie',
    'hero_cta_sell': 'Start Verkoop',
    
    // Home Sections
    'home_new_badge': 'Vers uit curatie',
    'home_new_title': 'Nieuwe Items',
    'home_view_all': 'Bekijk alles →',
    'home_spotlight_badge': 'Exclusieve Curatie',
    'home_spotlight_title': 'Product Spotlight',
    'home_cats_badge': 'Navigeer per Stijl',
    'home_cats_title': 'Ontdek Collecties',
    'home_cats_desc': 'Onze curators hebben de meest exclusieve items voor u geselecteerd, gecategoriseerd op esthetiek en vakmanschap.',
    
    // Trust Bar
    'trust_verified_title': 'GEVERIFIEERD',
    'trust_verified_desc': 'Elk item handmatig gecontroleerd door Nederlandse experts.',
    'trust_shipping_title': 'SNELLE LOGISTIEK',
    'trust_shipping_desc': 'Verzekerde verzending via PostNL of DHL binnen 48 uur.',
    'trust_payment_title': 'VEILIG BETALEN',
    'trust_payment_desc': 'Gegarandeerde transacties via iDEAL e Stripe Connect.',
    
    // CTA
    'cta_title_1': 'Uw Design',
    'cta_title_2': 'Verdient Beter.',
    'cta_desc': 'Verkoop uw hoogwaardige items via onze gecureerde marktplaats e bereik de juiste kopers in heel Europa.',
    'cta_button': 'Meld je aan',

    // Shop
    'shop_search_placeholder': 'Product, SKU of tags...',
    'shop_collections': 'Collecties',
    'shop_all_products': 'Alle Producten',
    'shop_reset': 'Reset',
    'shop_condition': 'Staat / Conditie',
    'shop_condition_all': 'Alles',
    'shop_price': 'Prijs',
    'shop_price_to': 'Tot',
    'shop_help_title': 'Hulp Nodig?',
    'shop_help_desc': 'Onze curators staan klaar om al uw vragen te beantwoorden.',
    'shop_help_btn': 'Stuur Bericht',
    'shop_results': 'Resultaten',
    'shop_sort_label': 'Sorteer op:',
    'shop_sort_newest': 'Nieuwste',
    'shop_sort_price_asc': 'Prijs: Laag - Hoog',
    'shop_sort_price_desc': 'Prijs: Hoog - Laag',
    'shop_empty_title': 'Geen items gevonden',
    'shop_empty_desc': 'Probeer andere zoekwoorden of wis de filters.',
    'shop_clear_filters': 'Filters Wissen',
    'shop_mobile_filters': 'Filters & Categorieën',

    // Auth
    'auth_login_tab': 'Inloggen',
    'auth_register_tab': 'Registreren',
    'auth_email_placeholder': 'E-MAILADRES',
    'auth_pass_placeholder': 'WACHTWOORD',
    'auth_first_name': 'VOORNAAM',
    'auth_last_name': 'ACHTERNAAM',
    'auth_confirm_pass': 'BEVESTIG WACHTWOORD',
    'auth_role_buyer': 'Ik wil kopen',
    'auth_role_seller': 'Ik wil verkopen',
    'auth_terms': 'Ik accepteer de voorwaarden',
    'auth_btn_login': 'Inloggen',
    'auth_btn_register': 'Registreren',
    'auth_processing': 'Verwerken...',

    // Product Card
    'card_verified': 'Verified',
    'card_details': 'Details',
    'card_saved': 'Bewaard',
    'card_save': 'Bewaar',
    
    // Categories (Static)
    'cat_electronics': 'Elektronica',
    'cat_design': 'Design',
    'cat_bikes': 'Fietsen',
    'cat_fashion': 'Vintage Mode',
    'cat_antique': 'Kunst & Antiek',
    'cat_gadgets': 'Gadgets'
  },
  en: {
    // Nav
    'nav_home': 'Home',
    'nav_collection': 'Collection',
    'nav_sell': 'Sell',
    'nav_login': 'Login',
    'nav_logout': 'Logout',
    'nav_dashboard': 'Dashboard',
    'nav_admin': 'Admin Panel',
    'nav_discover': 'Discover Now',

    // Hero
    'hero_badge': 'The Dutch Premium Standard',
    'hero_title_1': 'PRE-OWNED',
    'hero_title_2': 'MASTERPIECES.',
    'hero_desc': "Amsterdam's most exclusive marketplace for verified tech and design furniture. Curated by experts, delivered with care.",
    'hero_cta_shop': 'Shop Collection',
    'hero_cta_sell': 'Start Selling',

    // Home Sections
    'home_new_badge': 'Fresh from curation',
    'home_new_title': 'New Arrivals',
    'home_view_all': 'View all →',
    'home_spotlight_badge': 'Exclusive Curation',
    'home_spotlight_title': 'Product Spotlight',
    'home_cats_badge': 'Browse by Style',
    'home_cats_title': 'Discover Collections',
    'home_cats_desc': 'Our curators have selected the most exclusive items for you, categorized by aesthetics and craftsmanship.',

    // Trust Bar
    'trust_verified_title': 'VERIFIED',
    'trust_verified_desc': 'Every item manually checked by Dutch experts.',
    'trust_shipping_title': 'FAST LOGISTICS',
    'trust_shipping_desc': 'Insured shipping via PostNL or DHL within 48 hours.',
    'trust_payment_title': 'SECURE PAYMENT',
    'trust_payment_desc': 'Guaranteed transactions via iDEAL and Stripe Connect.',

    // CTA
    'cta_title_1': 'Your Design',
    'cta_title_2': 'Deserves Better.',
    'cta_desc': 'Sell your high-end items through our curated marketplace and reach the right buyers across Europe.',
    'cta_button': 'Sign Up Now',

    // Shop
    'shop_search_placeholder': 'Product, SKU or tags...',
    'shop_collections': 'Collections',
    'shop_all_products': 'All Products',
    'shop_reset': 'Reset',
    'shop_condition': 'State / Condition',
    'shop_condition_all': 'All',
    'shop_price': 'Price',
    'shop_price_to': 'Up to',
    'shop_help_title': 'Need Help?',
    'shop_help_desc': 'Our curators are ready to answer all your questions.',
    'shop_help_btn': 'Send Message',
    'shop_results': 'Results',
    'shop_sort_label': 'Sort by:',
    'shop_sort_newest': 'Newest',
    'shop_sort_price_asc': 'Price: Low - High',
    'shop_sort_price_desc': 'Price: High - Low',
    'shop_empty_title': 'No items found',
    'shop_empty_desc': 'Try other keywords or clear the filters.',
    'shop_clear_filters': 'Clear Filters',
    'shop_mobile_filters': 'Filters & Categories',

    // Auth
    'auth_login_tab': 'Login',
    'auth_register_tab': 'Register',
    'auth_email_placeholder': 'EMAIL ADDRESS',
    'auth_pass_placeholder': 'PASSWORD',
    'auth_first_name': 'FIRST NAME',
    'auth_last_name': 'LAST NAME',
    'auth_confirm_pass': 'CONFIRM PASSWORD',
    'auth_role_buyer': 'I want to buy',
    'auth_role_seller': 'I want to sell',
    'auth_terms': 'I accept the terms',
    'auth_btn_login': 'Login',
    'auth_btn_register': 'Register',
    'auth_processing': 'Processing...',

    // Product Card
    'card_verified': 'Verified',
    'card_details': 'Details',
    'card_saved': 'Saved',
    'card_save': 'Save',

    // Categories (Static)
    'cat_electronics': 'Electronics',
    'cat_design': 'Design',
    'cat_bikes': 'Bicycles',
    'cat_fashion': 'Vintage Fashion',
    'cat_antique': 'Art & Antique',
    'cat_gadgets': 'Gadgets'
  }
};

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('nl');

  const switchLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const t = (key: string) => {
    return translations[currentLanguage][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};