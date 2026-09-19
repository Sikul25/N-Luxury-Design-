(function () {
  const STRINGS = {
    en: {
      'nav.shop': 'Shop',
      'nav.collections': 'Collections',
      'nav.cart': 'Cart',
      'hero.eyebrow': 'N LUXURY DESIGN',
      'hero.title': 'Handcrafted elegance,\nseason after season.',
      'hero.subtitle': 'Discover the latest collection — jewelry and fashion pieces designed and photographed by hand.',
      'hero.cta': 'Explore the collection',
      'collections.title': 'Collections',
      'collections.empty': 'New collections are coming soon.',
      'product.addToCart': 'Add to cart',
      'product.buyNow': 'Buy now',
      'product.outOfStock': 'Currently unavailable',
      'cart.title': 'Your cart',
      'cart.empty': 'Your cart is empty.',
      'cart.checkout': 'Checkout',
      'cart.total': 'Total',
      'cart.remove': 'Remove',
      'cart.close': 'Close',
      'checkout.email': 'Email for your receipt',
      'checkout.emailPlaceholder': 'you@example.com',
      'checkout.pay': 'Pay securely',
      'checkout.processing': 'Redirecting to secure payment…',
      'checkout.error': 'Something went wrong. Please try again.',
      'footer.tagline': 'Timeless pieces, made with care.',
      'footer.contact': 'Contact',
      'footer.rights': 'All rights reserved.',
      'payment.successTitle': 'Thank you for your order!',
      'payment.successBody': 'Your payment was received. A confirmation has been sent to your email.',
      'payment.cancelledTitle': 'Payment cancelled',
      'payment.cancelledBody': 'Your order was not completed. You can try again whenever you like.',
      'payment.back': 'Back to shop'
    },
    ru: {
      'nav.shop': 'Магазин',
      'nav.collections': 'Коллекции',
      'nav.cart': 'Корзина',
      'hero.eyebrow': 'N LUXURY DESIGN',
      'hero.title': 'Элегантность ручной работы,\nсезон за сезоном.',
      'hero.subtitle': 'Откройте для себя новую коллекцию — украшения и предметы моды, созданные и сфотографированные вручную.',
      'hero.cta': 'Смотреть коллекцию',
      'collections.title': 'Коллекции',
      'collections.empty': 'Новые коллекции скоро появятся.',
      'product.addToCart': 'В корзину',
      'product.buyNow': 'Купить сейчас',
      'product.outOfStock': 'Временно недоступно',
      'cart.title': 'Ваша корзина',
      'cart.empty': 'Ваша корзина пуста.',
      'cart.checkout': 'Оформить заказ',
      'cart.total': 'Итого',
      'cart.remove': 'Удалить',
      'cart.close': 'Закрыть',
      'checkout.email': 'Email для чека',
      'checkout.emailPlaceholder': 'you@example.com',
      'checkout.pay': 'Оплатить безопасно',
      'checkout.processing': 'Переход к безопасной оплате…',
      'checkout.error': 'Что-то пошло не так. Попробуйте ещё раз.',
      'footer.tagline': 'Вечные вещи, созданные с заботой.',
      'footer.contact': 'Контакты',
      'footer.rights': 'Все права защищены.',
      'payment.successTitle': 'Спасибо за заказ!',
      'payment.successBody': 'Оплата получена. Подтверждение отправлено на вашу почту.',
      'payment.cancelledTitle': 'Оплата отменена',
      'payment.cancelledBody': 'Заказ не был завершён. Вы можете попробовать снова в любое время.',
      'payment.back': 'Вернуться в магазин'
    },
    fr: {
      'nav.shop': 'Boutique',
      'nav.collections': 'Collections',
      'nav.cart': 'Panier',
      'hero.eyebrow': 'N LUXURY DESIGN',
      'hero.title': 'Une élégance artisanale,\nsaison après saison.',
      'hero.subtitle': 'Découvrez la dernière collection — bijoux et pièces de mode conçus et photographiés à la main.',
      'hero.cta': 'Découvrir la collection',
      'collections.title': 'Collections',
      'collections.empty': 'De nouvelles collections arrivent bientôt.',
      'product.addToCart': 'Ajouter au panier',
      'product.buyNow': 'Acheter maintenant',
      'product.outOfStock': 'Actuellement indisponible',
      'cart.title': 'Votre panier',
      'cart.empty': 'Votre panier est vide.',
      'cart.checkout': 'Commander',
      'cart.total': 'Total',
      'cart.remove': 'Retirer',
      'cart.close': 'Fermer',
      'checkout.email': 'Email pour votre reçu',
      'checkout.emailPlaceholder': 'vous@exemple.com',
      'checkout.pay': 'Payer en toute sécurité',
      'checkout.processing': 'Redirection vers le paiement sécurisé…',
      'checkout.error': "Une erreur s'est produite. Veuillez réessayer.",
      'footer.tagline': 'Des pièces intemporelles, faites avec soin.',
      'footer.contact': 'Contact',
      'footer.rights': 'Tous droits réservés.',
      'payment.successTitle': 'Merci pour votre commande !',
      'payment.successBody': 'Votre paiement a été reçu. Une confirmation a été envoyée à votre email.',
      'payment.cancelledTitle': 'Paiement annulé',
      'payment.cancelledBody': "Votre commande n'a pas été finalisée. Vous pouvez réessayer quand vous le souhaitez.",
      'payment.back': 'Retour à la boutique'
    },
    es: {
      'nav.shop': 'Tienda',
      'nav.collections': 'Colecciones',
      'nav.cart': 'Carrito',
      'hero.eyebrow': 'N LUXURY DESIGN',
      'hero.title': 'Elegancia hecha a mano,\ntemporada tras temporada.',
      'hero.subtitle': 'Descubre la última colección: joyas y piezas de moda diseñadas y fotografiadas a mano.',
      'hero.cta': 'Explorar la colección',
      'collections.title': 'Colecciones',
      'collections.empty': 'Pronto llegarán nuevas colecciones.',
      'product.addToCart': 'Añadir al carrito',
      'product.buyNow': 'Comprar ahora',
      'product.outOfStock': 'No disponible por el momento',
      'cart.title': 'Tu carrito',
      'cart.empty': 'Tu carrito está vacío.',
      'cart.checkout': 'Finalizar compra',
      'cart.total': 'Total',
      'cart.remove': 'Quitar',
      'cart.close': 'Cerrar',
      'checkout.email': 'Email para tu recibo',
      'checkout.emailPlaceholder': 'tu@ejemplo.com',
      'checkout.pay': 'Pagar de forma segura',
      'checkout.processing': 'Redirigiendo al pago seguro…',
      'checkout.error': 'Algo salió mal. Inténtalo de nuevo.',
      'footer.tagline': 'Piezas atemporales, hechas con cuidado.',
      'footer.contact': 'Contacto',
      'footer.rights': 'Todos los derechos reservados.',
      'payment.successTitle': '¡Gracias por tu pedido!',
      'payment.successBody': 'Tu pago fue recibido. Se envió una confirmación a tu email.',
      'payment.cancelledTitle': 'Pago cancelado',
      'payment.cancelledBody': 'Tu pedido no se completó. Puedes intentarlo de nuevo cuando quieras.',
      'payment.back': 'Volver a la tienda'
    },
    it: {
      'nav.shop': 'Negozio',
      'nav.collections': 'Collezioni',
      'nav.cart': 'Carrello',
      'hero.eyebrow': 'N LUXURY DESIGN',
      'hero.title': 'Eleganza artigianale,\nstagione dopo stagione.',
      'hero.subtitle': 'Scopri l\'ultima collezione: gioielli e pezzi moda progettati e fotografati a mano.',
      'hero.cta': 'Esplora la collezione',
      'collections.title': 'Collezioni',
      'collections.empty': 'Nuove collezioni in arrivo presto.',
      'product.addToCart': 'Aggiungi al carrello',
      'product.buyNow': 'Acquista ora',
      'product.outOfStock': 'Al momento non disponibile',
      'cart.title': 'Il tuo carrello',
      'cart.empty': 'Il tuo carrello è vuoto.',
      'cart.checkout': 'Checkout',
      'cart.total': 'Totale',
      'cart.remove': 'Rimuovi',
      'cart.close': 'Chiudi',
      'checkout.email': 'Email per la ricevuta',
      'checkout.emailPlaceholder': 'tu@esempio.com',
      'checkout.pay': 'Paga in sicurezza',
      'checkout.processing': 'Reindirizzamento al pagamento sicuro…',
      'checkout.error': 'Qualcosa è andato storto. Riprova.',
      'footer.tagline': 'Pezzi senza tempo, realizzati con cura.',
      'footer.contact': 'Contatti',
      'footer.rights': 'Tutti i diritti riservati.',
      'payment.successTitle': 'Grazie per il tuo ordine!',
      'payment.successBody': 'Il pagamento è stato ricevuto. Una conferma è stata inviata alla tua email.',
      'payment.cancelledTitle': 'Pagamento annullato',
      'payment.cancelledBody': 'Il tuo ordine non è stato completato. Puoi riprovare quando vuoi.',
      'payment.back': 'Torna al negozio'
    }
  };

  const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' }
  ];

  function detectLang() {
    try {
      const saved = localStorage.getItem('nlux_lang');
      if (saved && STRINGS[saved]) return saved;
    } catch {}
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return STRINGS[nav] ? nav : 'en';
  }

  let current = detectLang();

  function t(key) {
    return (STRINGS[current] && STRINGS[current][key]) || STRINGS.en[key] || key;
  }

  function setLang(code) {
    if (!STRINGS[code]) return;
    current = code;
    try {
      localStorage.setItem('nlux_lang', code);
    } catch {}
    applyTranslations();
    document.dispatchEvent(new CustomEvent('nlux:langchange', { detail: { lang: code } }));
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.innerHTML = t(key).replace(/\n/g, '<br>');
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
  }

  document.addEventListener('DOMContentLoaded', applyTranslations);

  window.nluxI18n = { t, setLang, getLang: () => current, LANGS, applyTranslations };
})();
